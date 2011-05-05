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

          if map.valid_move? move
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
          node.spawn!
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

      def end_of_game
        # get the results
        results = ranking

        # save information
        Game.create! do |game|
          game.map              = map
          game.time_start       = @time_start
          game.time_end         = Time.now
          game.number_of_turns  = @turn
          game.json             = to_json

          # save scores
          @players.each do |player|
            game.artificial_intelligence_games.build( :artificial_intelligence=>player, :player_id=>player.player_id, :score=>results[player.player_id][:score], :winner=>results[player.player_id][:winner] )
          end
        end
      end

      def infos
        {
          :game_id                  => @uuid,
          :map_id                   => map.id,
          :maximum_number_of_turns  => map.maximum_number_of_turns,
          :number_of_players        => number_of_players
        }
      end

      def ranking
        results = Hash.new{ |h,k| h[k] = {} }
        points  = Hash.new{ |h,k| h[k] = 0.0 }
        total   = 0

        map.nodes.each do |node|
          points[node.owner] += node.points if node.owner.present?
          total += node.points
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

      def snapshot
        temp = Hash.new

        temp[:infos]  = infos
        temp[:nodes]  = map.nodes.map(&:to_hash)
        temp[:paths]  = map.paths.map(&:to_hash)
        temp[:states] = @turns[@turn][:init_state]

        temp.to_json
      end

      def play! players
        # initializing responses and requests
        rep = {}
        req = {}

        players.each do |player|
          req[player.player_id] = Typhoeus::Request.new(player.url_on_turn,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => map.time_limit_per_turn,
            :cache_timeout => 0,
            :params        => {
              :self=>player.player_id,
              :game=>@uuid,
              :turn=>@turn,
              :json=>snapshot
            })
          
          puts req[player.player_id].inspect

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