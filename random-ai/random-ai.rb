# BERLIN :: Ruby Artificial Intelligence example
# This ruby example is based on sinatra which provides an easy way to deploy a website.
# By showing you how to deal with the communication layer, you can concentrate on the
# intelligence part of your program. All classes are kept in this file for simplicity.
# Please keep in mind that this is only an example and shouldn't be pushed in production.

require 'rubygems'
require 'sinatra'
require 'yajl/json_gem'

# Let's keep track of all played games
@@games = {}

get '/infos' do
    create_or_update_game
end

post '/onturn' do
  game = create_or_update_game
  # Respond with a json of our moves
  game.turn_moves.to_json
end

def create_or_update_game
  # First, we parse the received request
  map = JSON.parse( params[:map] )
  infos = JSON.parse( params[:infos] )
  state = JSON.parse( params[:state] )
  action = params[:action] ? params[:action] : nil
  
  # Then, let's see if we can find that game. If not, register it.
  game_id = infos['game_id']
  @@games[game_id] ||= Game.new game_id, map, infos
  game = @@games[game_id]

  if action == "game_over"
    # Release the game to avoid memory leaks
    @@games[game_id] = nil
  elsif state
    # Now, we want to update the current state of the game with the new content
    game.update state
  end
  
  game
end

# This class will hold all the "intelligence" of the program. By
# analyzing the current state of the map, we'll be able to determine
# the best moves to do.
class Game
  attr_reader :id

  # @id = Uniq game ID (params[:game])
  # @map = Current state of the game (params[:json])
  def initialize id, map, infos
    @id         = id
    @map        = Map.new map, infos
  end

  # Let's update the map with the latest state
  def update state
    @map.update state
  end

  # For this example, we removed the 'Intelligence' part of the 'Artificial Intelligence' term...
  # We respond with random moves from one node to another without any intelligence...
  # Usually, it's this part of the code that you'd like to improve a bit. ;-)
  # Expected return format : [{"from": NodeID, "to": NodeID, "number_of_soldiers": X}, {...}, ...]
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

# Map will keep track of all the useful information needed to play, such as
# nodes, points, soldiers, etc. Game will then be able to pick any information
# it wants from map to decide what are the best moves to do.
class Map
  attr_accessor :nodes
  attr_reader :player_id
  
  def initialize map, infos
    @player_id  = infos['player_id']
    @nodes      = {}
    @directed   = infos['directed'] || false

    # Let's parse json['nodes'] and register all nodes we can find.
    # We'll keep track of them in @nodes so we can find them later.
    # At this step (Map creation...), we still don't know who possess
    # the node and how many soldiers there is. We'll get back to that later.
    # json['nodes'] => [{:id => STRING}, ...]
    map['nodes'].each do |node|
      @nodes[node['id']] = Node.new node['id']
    end

    # Same thing here, with paths.
    # json['paths'] => [{:from => INTEGER, :to => INTEGER}, ...]
    map['paths'].each do |path|
      @nodes[path['from']].link_to @nodes[path['to']]

      # Don't forget! If the map is not directed, we must create the reverse link!
      @nodes[path['to']].link_to @nodes[path['from']] unless directed?
    end
  end

  # By checking node.player_id, we are able to know if we own the node or not.
  def owned_nodes
    @nodes.select do |id, node|
      node.player_id == player_id
    end
  end

  # Node.number_of_soldiers returns, well, the number of soldiers a node has.
  # We can noe loop on our owned nodes in order to find our controlled nodes.
  def controlled_nodes
    owned_nodes.select do |id, node|
      node.number_of_soldiers > 0
    end
  end

  # Is the map directed?
  def directed?
    @directed
  end

  # Let's update the current state with the latest provided info! With this step,
  # we'll now know who possess the node and how many soldiers there is.
  # state contains an array of nodes, so we just have to loop on it.
  # state => [{:node_id => STRING, :number_of_soldiers => INTEGER, :player_id => INTEGER}, ...]
  def update state
    state.each do |n|
      node                    = @nodes[n['node_id']]
      node.number_of_soldiers = n['number_of_soldiers']
      node.player_id          = n['player_id']
    end
  end
end

# Node will help us to keep track of possible moves.
# We'll be able to use it in order to know if two
# nodes are adjacent, how much points worth a node, etc.
class Node
  attr_accessor :id, :player_id, :number_of_soldiers
  
  def initialize id
    @id                 = id
    @number_of_soldiers = 0
    @player_id          = 0
    @links              = []
  end

  # Register a given node as an adjacent one.
  def link_to other_node
    @links << other_node
  end

  # Is other_node adjacents to current node?
  def adjacent? other_node
    @links.include? other_node
  end

  # What are current node's neighbors?
  def adjacent_nodes
    @links.dup
  end
end