require 'rubygems'
require 'typhoeus'
require 'yajl/json_gem'

class Player
  @@count = 0
  @@players = []
  
  attr_accessor :id, :url, :request, :response
  
  def self.count
    @@count
  end
  
  def self.all
    @@players
  end
  
  def initialize
    @@count += 1
    @url = 'http://localhost:4567/onturn'
    @id = @@count
    @@players << self
  end
end

class Game
  attr_accessor :id, :path, :map, :turn, :maximum_number_of_turns, :moves, :players
  
  @@path = './public/maps/'
  
  def initialize path, players
    @id     = 1
    @path   = @@path + path
    @players = players
    @moves  = []
    @turn   = 0
    @maximum_number_of_turns = 0
    @hydra  = Typhoeus::Hydra.new
    
    self.build
  end

  # build the map according to the provided file
  def build
    @map = JSON.parse( File.open( @path ).readlines.to_s ) if File.exist?( @path )
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
    while self.turn < 100
      # create and queue a http request for each player
      @players.each do |player|
        player.request = Typhoeus::Request.new(player.url,
            :method        => :post,
            :headers       => {:Accept => "application/json"},
            :timeout       => 5000,
            :cache_timeout => 0,
            :params        => {
              :turn=>self.turn,
              :game=>self.id,
              :json=>self.snapshot
            })

        player.request.on_complete do |response|
          player.response = response
        end

        @hydra.queue(player.request)
      end

      # blocking call, waiting for all requests
      @hydra.run

      # let's move!
      @players.each do |player|
        if player.response.success?
          begin
            response = self.move( JSON.parse( player.response.body ) )
          rescue
            p "Can't parse json"
          end
        elsif player.response.timed_out?
          p "Request timed out"
        else
          p player.response.curl_error_message
        end
      end

      break
      self.next_turn
    end
  end
end

players = [Player.new]
game = Game.new('1.map', players)
game.run
