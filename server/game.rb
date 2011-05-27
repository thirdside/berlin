module Berlin
  module Server
    class Game < Game
      after_initialize :build
      
      attr_accessor :uuid, :turn, :moves, :players, :debug

      def build
        # game id
        @uuid = UUIDTools::UUID.random_create.to_s

        # times
        @time_start = Time.now
        @time_end   = nil

        # artificial intelligences
        @players = []

        # @turns => {1=>{:moves=>[], :spawns=>[], :init_state=>state, :post_state=>state}}
        @turns = Hash.new{ |h,k| h[k] = Hash.new{ |hh,kk| hh[kk] = [] } }
        
        # Hydra is the gem used to communicate with players
        @hydra = Typhoeus::Hydra.new
        
        # Game start at turn 0
        @turn = 0
      end

      def init
        # set player_id for each player
        @players.each_with_index do |player, index|
          player.player_id = index
        end

        # init number of soldiers for each player
        map.init( @players )
      end

      def log message
        puts message if @debug
      end

      def add_player player
        # add the player to the array
        @players << player
      end

      def number_of_players
        @players.size
      end

      def player_ids
        @players.map(&:player_id)
      end

      def alive_players
        @players.select do |player|
          map.number_of_soldiers_for( player.player_id ) > 0 || map.number_of_nodes_for( player.player_id ) > 0
        end
      end

      def register_moves player_id, moves
        JSON.parse( moves ).each do |move|
          move = Berlin::Server::Move.parse( player_id, move )

          if map.valid_move? @turn, move
            @turns[@turn][:moves] << move
          end
        end
      end

      def move!
        @turns[@turn][:moves].each do |move|
          map.move! move
        end
      end

      def spawn!
        map.nodes.each do |node|
          if node.owned?
            # get spawn info
            number_of_soldiers  = node.type.soldiers_per_turn
            player_id           = node.owner
            node_id             = node.id
            
            # we don't need to spawn if soldiers per turn == 0
            if number_of_soldiers != 0
              # spawn!
              node.add_soldiers( player_id, number_of_soldiers )
              
              # register the spawn
              @turns[@turn][:spawns] << {:node_id=>node_id, :player_id=>player_id, :number_of_soldiers=>number_of_soldiers}
            end
          end
        end
      end

      def fight!
        map.nodes.select{ |node| node.occupied? }.each do |node|
          node.fight!
        end
      end

      def state! state
        @turns[@turn][:"#{state}_state"] = map.states
      end
      
      def start_game
        # initializing responses and requests
        rep = {}
        req = {}

        @players.each do |player|
          req[player.player_id] = Typhoeus::Request.new(player.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => 30000,
            :cache_timeout => 0,
            :params        => {
              :action=>'game_start',
              :infos=>self.infos( player.player_id ).to_json,
              :map=>map.to_hash.to_json,
              :state=>map.states.to_json
            }
          )

          puts req[player.player_id].inspect if @debug

          req[player.player_id].on_complete do |response|
            rep[player.player_id] = response
          end

          @hydra.queue( req[player.player_id] )
        end

        @hydra.run

        players.each do |player|
          unless rep[player.player_id].success?
            # Save timeout
            player.timeouts.create
            
            # Raise error
            raise Berlin::Server::Exceptions::ArtificialIntelligenceNotResponding
          end
        end
      end

      def end_of_game        
        # initializing requests
        req = {}

        @players.each do |player|
          req[player.player_id] = Typhoeus::Request.new(player.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => 0,
            :cache_timeout => 0,
            :params        => {
              :action=>'game_over',
              :infos=>self.infos( player.player_id ).to_json,
              :map=>map.to_hash.to_json,
              :state=>map.states.to_json
            }
          )

          puts req[player.player_id].inspect if @debug

          @hydra.queue( req[player.player_id] )
        end

        @hydra.run
        
        # get the results
        results = ranking
        
        # save information
        Game.create! do |game|
          game.map              = self.map
          game.user_id          = self.user_id
          game.time_start       = @time_start
          game.time_end         = Time.now
          game.number_of_turns  = @turn
          game.json             = self.to_json
          
          # save scores
          @players.each do |player|
            game.artificial_intelligence_games.build( :artificial_intelligence=>player, :player_id=>player.player_id, :score=>results[player.player_id][:score], :winner=>results[player.player_id][:winner] )
          end
        end
      end

      def infos player_id = nil
        info = {
          :game_id                  => @uuid,
          :current_turn             => @turn,
          :maximum_number_of_turns  => map.maximum_number_of_turns,
          :time_limit_per_turn      => map.time_limit_per_turn,
          :directed                 => map.directed,
          :number_of_players        => number_of_players
        }

        player_id ? info.merge(:player_id => player_id) : info
      end

      def ranking
        results = Hash.new{ |h,k| h[k] = {} }
        points  = Hash.new{ |h,k| h[k] = 0.0 }
        total   = 0

        map.nodes.each do |node|
          if node.owned?
            points[node.owner] += node.points
            total += node.points
          end
        end

        # Get max points to determine winners
        max = points.values.max

        @players.map(&:player_id).each do |player_id|
          results[player_id][:score]  = points[player_id] == 0 ? 0.0 : (points[player_id] / total)
          results[player_id][:winner] = points[player_id] == max
        end

        results
      end

      def to_json
        temp = Hash.new

        temp[:infos] = infos
        temp[:turns] = Hash.new{ |h,k| h[k] = {} }

        @turns.each do |turn, info|
          temp[:turns][turn][:states_pre]   = info[:init_state]
          temp[:turns][turn][:moves]        = info[:moves]
          temp[:turns][turn][:states_post]  = info[:post_state]
          temp[:turns][turn][:spawns]       = info[:spawns]
        end

        temp.to_json
      end

      def play! players
        # initializing responses and requests
        rep = {}
        req = {}

        players.each do |player|
          req[player.player_id] = Typhoeus::Request.new(player.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => map.time_limit_per_turn,
            :cache_timeout => 0,
            :params        => {
              :action=>'turn',
              :infos=>self.infos( player.player_id ).to_json,
              :map=>map.to_hash.to_json,
              :state=>map.states.to_json
            }
          )

          puts req[player.player_id].inspect if @debug

          req[player.player_id].on_complete do |response|
            rep[player.player_id] = response
          end

          @hydra.queue( req[player.player_id] )
        end

        @hydra.run

        players.each do |player|
          response = rep[player.player_id]
          
          if response.success?
            begin
              register_moves( player.player_id, response.body )
            rescue
              log "Can't parse json"
            end
          elsif response.timed_out?
            log "Request timed out"
          else
            log response.curl_error_message
          end
        end
      end

      def run
        raise 'No map?!' if map.nil?
        
        start_game
        
        while @turn < map.maximum_number_of_turns
          players = alive_players

          break unless players.size > 1
          
          @turn += 1

          log "Turn ##{@turn}"

          state! :init
          play!( players )
          move!
          fight!
          state! :post
          spawn!
        end

        end_of_game
      end
    end
  end
end
