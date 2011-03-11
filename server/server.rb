require 'rubygems'
require 'typhoeus'
require 'yajl/json_gem'
require 'active_record'

# config
# TODO check if we can import rails config, so we don't have to redeclare everything here
ActiveRecord::Base.establish_connection(
  :adapter=> 'mysql',
  :database=> 'berlin_development',
  :username=> 'root',
  :password=> 'password',
  :pool=> 5,
  :timeout=> 5000)

# models
%w( map game artificial_intelligence artificial_intelligence_game ).each do |model|
  require File.expand_path( File.dirname( __FILE__ ) ) + "/../app/models/#{model}"
end

class ArtificialIntelligence
  attr_accessor :request, :response
end

class Game
  attr_accessor :id, :map, :turn, :moves, :ais
  
  @@path = File.expand_path( File.dirname( __FILE__ ) ) + '/../public/maps/'
  
  def initialize map, ais
    raise ArgumentError if map.blank? || ais.blank?
    
    @id     = 1
    @ais    = ais
    @moves  = []
    @turn   = 0
    @start  = Time.new
    @end    = nil
    @hydra  = Typhoeus::Hydra.new
    @map    = map
  end
  
  # return a complete json of the actual map
  def snapshot
    @map.to_json
  end

  # move a player from one node to another
  def move json
    #todo do the move, check for validity, etc...
    p "move!"
    moves << {:player=>0, :from=>0, :to=>0, :soldiers=>0}
  end

  # next turn
  def next_turn
    @turn += 1
  end
  
  # let's run!
  def run
    while self.turn < @map.maximum_number_of_turns      
      # create and queue a http request for each player
      @ais.each do |ai|
        ai.request = Typhoeus::Request.new(ai.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => @map.time_limit_per_turn,
            :cache_timeout => 0,
            :params        => {
              :game=>self.id,
              :turn=>self.turn,
              :json=>self.snapshot
            })

        ai.request.on_complete do |response|
          ai.response = response
        end

        @hydra.queue( ai.request )
      end
      
      # blocking call, waiting for all requests
      @hydra.run
      
      # let's move!
      @ais.each do |ai|
        rep = ai.response
        
        if rep.success?
          begin
            self.move( JSON.parse( rep.body ) )
          rescue
            p "Can't parse json"
          end
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

game = Game.new(Map.first, ArtificialIntelligence.all)
game.run
