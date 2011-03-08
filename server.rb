require 'rubygems'
require 'typhoeus'
require 'json'

class Map
  attr_accessor :path, :map, :turn, :maximum_number_of_turns, :moves

  def initialize path
    @path = path
    @moves = []

    self.build
  end

  # build the map according to the provided file
  def build
    @map = JSON.parse( File.open( @path ).readlines.to_s ) if File.exist?( @path )
  end

  # return a complete json of the actual map
  def actual
    {}.to_json
  end

  # move a player from one node to another
  def move
    #todo do the move, check for validity, etc...
    moves << {:player=>0, :from=>0, :to=>0, :soldiers=>0}
  end

  # next turn
  def next
    @turn += 1
  end
end

while true
  # start hydra
  hydra = Typhoeus::Hydra.new
  
  map = Map.new('public/maps/1.json')

  players = [
    {:id=>1, :url=>'http://localhost:3000', :request=>nil, :response=>nil},
    {:id=>2, :url=>'http://localhost:3000', :request=>nil, :response=>nil}
  ]

  # for each turn
  while map.turn < map.maximum_number_of_turns
    # create and queue a http request for each player
    players.each do |player|
      player[:request] = Typhoeus::Request.new(player[:url],
          :body          => map.actual,
          :method        => :post,
          :headers       => {:Accept => "application/json"},
          :timeout       => 1000,
          :cache_timeout => 0,
          :params        => {})

      player[:request].on_complete do |response|
        player[:response] = response
      end

      hydra.queue(player[:request])
    end

    # blocking call, waiting for all requests
    hydra.run

    # let's move!
    players.each do |player|
      if player[:response].success?
        begin
          response = JSON.parse( player[:response].body )
        rescue
          p "Can't parse json"
        end

        map.move( response ) if response
      end
    end
    
    map.next
  end

  # temp
  break
end