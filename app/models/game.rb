class Game < ActiveRecord::Base
  attr_accessor :turn, :moves

  belongs_to :map
  belongs_to :winner, :class_name=>"ArtificialIntelligence"

  def after_initialize
    @moves  = Hash.new{ |h,k| h[k] = Hash.new{ |h,k| h[k] = [] } }
    @turn   = 0
    @start  = Time.new
    @end    = nil
    @hydra  = Typhoeus::Hydra.new unless defined? Rails.env
  end

  # return a complete json of the actual map
  def snapshot
    @map.to_json
  end

  # register moves for a player
  # json should be of format [{from, to, number}, {from, to, number}, ...]
  def move player_id, json
    JSON.parse( json ).each do |move|
      from                = @map.nodes[move['from']]
      to                  = @map.nodes[move['to']]
      number_of_soldiers  = move['number_of_soldiers']

      if from.adjacent? to
        if from.armies[player_id].present?
          if from.armies[player_id] >= number_of_soldiers && number_of_soldiers > 0
            @moves[@turn][player_id] << move
          end
        end
      end
    end
  end

  # next turn
  def next_turn
    # execute valid moves...
    @moves[@turn].each do |player_id, moves|
      moves.each do |move|
        p "move"
        @map.nodes[move['from']].move_soldiers player_id, @map.nodes[move['to']], move['number_of_soldiers']
      end
    end

    # execute combats...
    @map.nodes.values.select{ |node| node.combat? }.each do |node|
      while node.combat?
        node.armies.keys.each do |player_id|
          node.add_soldiers player_id, -1
        end
      end

      # if there's still an army on the node, set the owner to the corresponding player
      node.owner = node.armies.keys.first if node.armies.size > 0
    end

    # new soldiers!
    @map.nodes.values.select{ |node| node.occupied? }.each do |node|
      node.add_soldiers node.owner, node.soldiers_per_turn
    end

    p "End of turn"

    # increment turn number
    @turn += 1
  end

  # let's run!
  def run
    raise "Heugh? With what map?" if @map.nil?

    while @turn <= @map.maximum_number_of_turns && @map.alive_players.size > 1
      # next turn
      self.next_turn

      p "New turn ##{@turn}"

      # create and queue a http request for each player
      @map.players.each do |id, player|
        player.request = Typhoeus::Request.new(player.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => @map.time_limit_per_turn,
            :cache_timeout => 0,
            :params        => {
              :self=>id,
              :game=>self.id,
              :turn=>self.turn,
              :json=>self.snapshot
            })

        player.request.on_complete do |response|
          player.response = response
        end

        @hydra.queue( player.request )
      end

      # blocking call, waiting for all requests
      @hydra.run

      # let's move!
      @map.players.each do |player_id, player|
        rep = player.response

        if rep.success?
          begin
            self.move( player_id.to_s, rep.body )
          rescue
            p "Can't parse json"
          end
        elsif rep.timed_out?
          p "Request timed out"
        else
          p rep.curl_error_message
        end
      end
    end

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
    @end = Time.now
    
    self.time_start       = @start
    self.time_end         = @end
    self.number_of_turns  = @turn
    self.json             = to_json

    self.save!
  end

  def to_json
    temp = Hash.new{ |h,k|  h[k] = [] }

    (0..@turn).each do |turn|
      temp[turn]
    end

    temp
  end
end
