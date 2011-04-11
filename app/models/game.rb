class Game < ActiveRecord::Base
  attr_accessor :uuid, :turn, :moves, :states, :spawns

  belongs_to :map, :counter_cache=>true

  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :artificial_intelligences, :through=>:artificial_intelligence_games

  after_initialize :build!

  def number_of_players
    artificial_intelligences.count
  end

  def winners
    max = artificial_intelligence_games.map(&:score).max
    artificial_intelligence_games.select{ |w| w.score == max }.map(&:artificial_intelligence)
  end

  def build!
    # Fuuuuu Rails
    return if defined? Rails.env

    @uuid   = UUIDTools::UUID.random_create.to_s
    @moves  = Hash.new{ |h,k| h[k] = [] }
    @spawns = Hash.new{ |h,k| h[k] = [] }
    @states = {}
    @turn   = 1
    @start  = Time.new
    @end    = nil
    @hydra  = Typhoeus::Hydra.new
  end

  # register moves for a player
  # json should be of format [{from, to, number_of_soldiers}, ...]
  def register_move player_id, json
    JSON.parse( json ).each do |move|
      from                = @map.nodes[move['from']]
      to                  = @map.nodes[move['to']]
      number_of_soldiers  = move['number_of_soldiers']

      # a move is valid if nodes are adjacent and if there's enough soldiers to move
      if from.adjacent? to
        if from.armies[player_id].present?
          if from.armies[player_id] >= number_of_soldiers && number_of_soldiers > 0
            @moves[@turn] << {'player_id'=>player_id, 'number_of_soldiers'=>number_of_soldiers, 'from'=>move['from'], 'to'=>move['to']}
          end
        end
      end
    end
  end

  def move!
    @moves[@turn].each do |move|
      p "Player ##{move['player_id']} moves #{move['number_of_soldiers']} soldiers from node ##{move['from']} to node ##{move['to']}."
      @map.nodes[move['from']].move_soldiers move['player_id'], @map.nodes[move['to']], move['number_of_soldiers']
    end
  end

  def fight!
    @map.nodes.values.select{ |node| node.occupied? }.each do |node|

      while node.combat?
        p "There's a combat on node ##{node.id}!"

        casualties = node.armies.values.min

        p "Each army lose #{casualties} soldiers."

        node.armies.keys.each do |player_id|
          node.add_soldiers player_id, casualties * -1
        end
      end

      # if there's still an army on the node, set the owner to the corresponding player
      if node.occupied?
        p "Player ##{node.armies.keys.first} is now the proud owner of node ##{node.id}"
        node.owner = node.armies.keys.first
      end
    end
  end

  def spawn!
    @map.nodes.values.select{ |node| node.owned? }.each do |node|
      if node.soldiers_per_turn > 0
        p "Player ##{node.owner} gains #{node.soldiers_per_turn} soldiers on node ##{node.id}."
        node.add_soldiers node.owner, node.soldiers_per_turn
        @spawns[@turn] << {:player_id=>node.owner, :number_of_soldiers=>node.soldiers_per_turn, :node_id=>node.id}
      end
    end
  end

  # let's run!
  def run
    raise "Heugh? With what map?" if @map.nil?

    while @turn <= @map.maximum_number_of_turns
      # check for alive players
      alive_players = @map.alive_players

      # is there more than 1 alive player?
      break unless alive_players.size > 1

      p "#{@turn} - new turn!"

      # reset response and request
      responses = {}
      requests  = {}

      # calculate the new state of the map
      @states[@turn] = @map.states

      # create and queue a http request for each alive player
      alive_players.each do |player_id, player|
        requests[player_id] = Typhoeus::Request.new(player.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => @map.time_limit_per_turn,
            :cache_timeout => 0,
            :params        => {
              :self=>player_id,
              :game=>self.uuid,
              :turn=>self.turn,
              :json=>self.snapshot
            })

        requests[player_id].on_complete do |response|
          responses[player_id] = response
        end

        @hydra.queue( requests[player_id] )
      end

      # blocking call, waiting for all requests
      @hydra.run

      # let's move!
      @map.players.keys.each do |player_id|
        rep = responses[player_id]

        if rep.success?
          begin
            self.register_move( player_id, rep.body )
          rescue
            p "Can't parse json"
          end
        elsif rep.timed_out?
          p "Request timed out"
        else
          p rep.curl_error_message
        end
      end

      move!
      fight!
      spawn!

      # next turn
      @turn += 1
    end

    # calculate the new state of the map
    @states[@turn] = @map.states

    self.end_of_game
  end

  def ranking
    results = {}
    points  = Hash.new{ |h,k| h[k] = 0.0 }
    total   = 0

    @map.nodes.values.each do |node|
      if node.points?
        points[node.owner] += node.points if node.owner.present?
        total += node.points
      end
    end

    @map.players.keys.each do |player_id|
      results[player_id] = points[player_id] == 0 ? 0.0 : (points[player_id] / total)
    end

    results
  end

  def end_of_game
    # get the results
    results = ranking

    # save information
    self.time_start       = @start
    self.time_end         = Time.now
    self.number_of_turns  = @turn
    self.json             = to_json

    # save scores
    @map.players.each do |player_id, player|
      self.artificial_intelligence_games.build( :artificial_intelligence=>player, :score=>results[player_id] )
    end

    self.save!
  end

  def infos
    {
      :game_id                  => self.uuid,
      :map_id                   => @map.id,
      :turn                     => @turn,
      :maximum_number_of_turns  => @map.maximum_number_of_turns,
      :players                  => @map.players.map{ |player_id, player| {:id=>player_id, :name=>player.url} }
    }
  end

  # return a complete json of the actual map
  def snapshot
    temp = Hash.new

    temp[:infos]  = self.infos
    temp[:nodes]  = @map.parsed['nodes']
    temp[:paths]  = @map.parsed['paths']
    temp[:states] = @states[@turn]

    temp.to_json
  end

  # save the game in json format for joy and pleasure
  def to_json
    temp = Hash.new

    temp[:infos] = self.infos
    temp[:turns] = Hash.new{ |h,k| h[k] = {} }

    (1..@turn).each do |turn|
      temp[:turns][turn][:moves]  = @moves[turn]
      temp[:turns][turn][:states] = @states[turn]
      temp[:turns][turn][:spawns] = @spawns[turn]
    end

    temp.to_json
  end
end
