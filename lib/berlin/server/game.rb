module Berlin
  module Server
    class Game < ::Game
      attr_accessor :uuid, :turn, :moves, :players, :debug

      K_FACTOR = 32

      belongs_to :map, :class_name => "Berlin::Server::Map"
      has_many :artificial_intelligences, :class_name => "Berlin::Server::ArtificialIntelligence", :through => :artificial_intelligence_games

      after_initialize :build

      def build
        log "BUILD"
        # game id
        @uuid = UUIDTools::UUID.timestamp_create.to_s

        # times
        @time_start = Time.now
        @time_end   = nil

        # artificial intelligences
        @players = artificial_intelligences.includes(:artificial_intelligence_games)
        @players.each do |ai|
          ai_game = ai.artificial_intelligence_games.detect{|g| g.game_id == id }
          ai.player_id = ai_game.player_id
        end

        # @turns => {1 => {:moves => [], :spawns => [], :init_state => state, :post_state => state}}
        @turns = Hash.new{ |h,k| h[k] = Hash.new{ |hh,kk| hh[kk] = [] } }

        # keep track of asked moves
        @moves = Hash.new{ |h,k| h[k] = Hash.new{ |hh,kk| hh[kk] = Hash.new{ |hhh,kkk| hhh[kkk] = Hash.new{ |hhhh,kkkk| hhhh[kkkk] = 0 } } } }

        # Hydra is the gem used to communicate with players
        @hydra = Typhoeus::Hydra.new

        # Game start at turn 0
        @turn = 0

        map.init( @players )
      end

      def log message
        Delayed::Worker.logger.add(Logger::INFO, message)
      end

      def number_of_players
        @players.size
      end

      def player_ids
        @players.map(&:player_id)
      end

      def alive_players
        @players.select do |player|
          map.number_of_nodes_for( player.player_id ) > 0
        end
      end

      def register_moves player_id, moves
        JSON.parse( moves ).each do |move|
          @moves[@turn][player_id][move['from']][move['to']] += move['number_of_soldiers'].to_i
        end
      end

      def move!
        @moves[@turn].each do |player_id, from_nodes|
          from_nodes.each do |from_node, to_nodes|
            to_nodes.each do |to_node, number_of_soldiers|
              move = Berlin::Server::Move.new player_id, from_node, to_node, number_of_soldiers

              if map.valid_move? @turn, move
                @turns[@turn][:moves] << move
              end
            end
          end
        end

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
              @turns[@turn][:spawns] << {:node_id => node_id, :player_id => player_id, :number_of_soldiers => number_of_soldiers}
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
            :method         => :post,
            :followlocation => true,
            :headers        => {:Accept => "application/json"},
            :timeout        => 30000,
            :body           => {
              :action => 'game_start',
              :infos => self.infos( player.player_id ).to_json,
              :map => map.to_hash.to_json,
              :state => map.states.to_json
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
            raise Berlin::Server::Exceptions::ArtificialIntelligenceNotResponding, "#{player.id} not responding"
          end
        end
      end

      def end_of_game
        send_game_over
        complete_game
      end

      def complete_game
        # get the results
        results = ranking

        calculate_new_ratings if round

        self.time_end = Time.now
        self.number_of_turns = @turn
        self.json = to_json
        finish
        save!

        # save scores
        @players.each do |player|
          participation = player.participations.find_by_tournament_id(round.tournament_id) if round
          ai = artificial_intelligence_games.where(:artificial_intelligence_id => player.id).first
          ai.update_attributes(
            :score                    => results[player.player_id][:score],
            :winner                   => results[player.player_id][:winner],
            :rating                   => participation.try(:rating)
          )
        end
      end

      def calculate_new_ratings
        results = ranking
        new_ratings = {}

        players.each do |player|
          player_participation = player.participations.find_by_tournament_id(round.tournament_id)
          elo_delta = players.reject{|p| p == player}.reduce(0) do |delta, opponent|
            opponent_participation = opponent.participations.find_by_tournament_id(round.tournament_id)
            delta + K_FACTOR * (results[player.player_id][:score] - expected_score(player_participation, opponent_participation))
          end
          new_ratings[player_participation] = elo_delta
        end

        new_ratings.each do |player_participation, elo_delta|
          player_participation.rating += elo_delta
          player_participation.save
        end
      end

      def expected_score(player, opponent)
        (1/ (1 + 10**((opponent.rating - player.rating) / 400.0))).round(2)
      end

      def send_game_over
        req = {}

        @players.each do |player|
          req[player.player_id] = Typhoeus::Request.new(player.url,
            :method         => :post,
            :followlocation => true,
            :headers        => {:Accept => "application/json"},
            :timeout        => 0,
            :params         => {
              :action => 'game_over',
              :infos => self.infos( player.player_id ).to_json,
              :map => map.to_hash.to_json,
              :state => map.states.to_json
            }
          )

          puts req[player.player_id].inspect if @debug

          @hydra.queue( req[player.player_id] )
        end

        @hydra.run
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
            :method         => :post,
            :followlocation => true,
            :headers        => {:Accept => "application/json"},
            :timeout        => map.time_limit_per_turn,
            :params         => {
              :action => 'turn',
              :infos => self.infos( player.player_id ).to_json,
              :map => map.to_hash.to_json,
              :state => map.states.to_json
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
            log response.return_message
          end
        end
      end

      def run
        log("Running game")

        raise Berlin::Server::Exceptions::NoMap if map.nil?

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
