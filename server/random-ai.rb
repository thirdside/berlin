require 'rubygems'
require 'sinatra'
require 'yajl/json_gem'

@@games = {}

get '/ready' do
  "ready!"
end

post '/onturn' do
  json = JSON.parse( params[:json] )
  game_id = params[:game]
  
  @@games[game_id] ||= Game.new game_id, json, params[:self]
  game = @@games[game_id]
  game.update json
  
  turn = params[:turn]
  
  game.turn_moves.to_json
end


class Game
  attr_reader :id, :player_id
  def initialize id, map_info, player_id
    @id = id
    @player_id = player_id
    @map = Map.new map_info, @player_id
  end
  
  def update json
    @map.update json['states']
  end
  
  def turn_moves
    @map.controlled_nodes.map do |id, node|
      {
        :from => node.id,
        :to => node.adjacent_nodes.sample.id,
        :number_of_soldiers => rand(node.number_of_soldiers + 1)
      }
    end
  end
end

class Map
  attr_accessor :nodes
  attr_reader :player_id
  
  def initialize config, player_id
    @player_id = player_id
    @nodes = {}
    @directed = config['infos']['directed'] || false
    config['nodes'].each do |n|
      @nodes[n['id']] = Node.new n['id']
    end
    
    config['paths'].each do |path|
      @nodes[path['from']].link_to @nodes[path['to']]
      @nodes[path['to']].link_to @nodes[path['from']] unless directed?
    end
  end
  
  def owned_nodes
    @nodes.select do |id, node|
      node.player_id == player_id
    end
  end
  
  def controlled_nodes
    owned_nodes.select do |id, node|
      node.number_of_soldiers > 0
    end
  end
  
  def directed?
    return @directed
  end
  
  def update state
    state.each do |n|
      node = @nodes[n['node_id']]
      node.number_of_soldiers = n['number_of_soldiers']
      node.player_id = n['player_id']
    end
  end
end

class Node
  attr_accessor :id, :player_id, :number_of_soldiers
  
  def initialize id
    @id = id
    @number_of_soldiers = 0
    @player_id = 0
    @links = []
  end
  
  def link_to other_node
    @links << other_node
  end
  
  def adjacent? other_node
    @links.include? other_node
  end
  
  def adjacent_nodes
    @links.dup
  end
end