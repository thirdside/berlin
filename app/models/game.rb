class Game < ActiveRecord::Base
  attr_accessor :turn, :moves

  belongs_to :map
  belongs_to :winner, :class_name=>"ArtificialIntelligence"

  def after_initialize
    @moves  = Hash.new{ |h,k| h[k] = Hash.new{ |i,l| i[l] = [] } }
    @turn   = 0
    @start  = Time.new
    @end    = nil
    @hydra  = Typhoeus::Hydra.new
  end

  # return a complete json of the actual map
  def snapshot
    @map.to_json
  end

  # move a player from one node to another
  def move player_id, json
    p "Let's move!"
    json = JSON.parse( json )
    
    # add this move to the move list
    @moves[@turn][player_id] << json
    p "Moved!"
  end

  # next turn
  def next_turn
    @turn += 1
  end

  # let's run!
  def run
    raise "Heugh? With what map?" if @map.nil?

    while self.turn < @map.maximum_number_of_turns
      # create and queue a http request for each player
      @map.players.each do |id, player|
        player.request = Typhoeus::Request.new(player.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => @map.time_limit_per_turn,
            :cache_timeout => 0,
            :params        => {
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
      @map.players.each do |id, player|
        rep = player.response

        if rep.success?
          #begin
            self.move( id, rep.body )
          #rescue
          #  p "Can't parse json"
          #end
        elsif rep.timed_out?
          p "Request timed out"
        else
          p rep.curl_error_message
        end
      end

      break
      self.next_turn
    end
  end
end
