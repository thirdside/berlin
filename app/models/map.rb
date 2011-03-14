class Map < ActiveRecord::Base
  attr_accessor :parsed, :types, :nodes, :number_of_players, :time_limit_per_turn, :players, :maximum_number_of_turns
  
  after_initialize :build!
  
  def build!
    # Fuuuuu Rails
    return if defined? Rails.env

    @parsed   = self.json.present? ? JSON.parse( self.json ) : {}
    @players  = {}
    @types    = {}
    @nodes    = {}

    # taken from parsed json
    @maximum_number_of_turns  = @parsed['infos']['maximum_number_of_turns'] || 100
    @number_of_players        = @parsed['infos']['number_of_players']       || []
    @time_limit_per_turn      = @parsed['infos']['time_limit_per_turn']     || 1000

    # get each node types
    @parsed['types'].each do |type|
      @types[type['name']] = NodeType.new(type)
    end

    # build each node
    @parsed['nodes'].each do |node|
      @nodes[node['id']] = Node.new(node, @types[node['type']])
    end

    # build paths
    @parsed['paths'].each do |path|
      @nodes[path['from']].link_to(@nodes[path['to']])
      
      unless self.directed?
        @nodes[path['to']].link_to(@nodes[path['from']])
      end
    end
  end

  def init players
    raise "This map can't be played with #{players.size} players. Available numbers of players are : #{@number_of_players.join(', ')}" unless @number_of_players.include? players.size
    
    players.each_with_index do |player, index|
      @players[index.to_s] = player 
    end
    
    @parsed['setup'][@players.size.to_s].each do |player_id, nodes|
      nodes.each do |node|
        @nodes[node['node']].owner = player_id
        @nodes[node['node']].add_soldiers player_id, node['number_of_soldiers']
      end
    end
  end

  def number_of_soldiers_per_player
    total = {}

    @players.keys.each do |player_id|
      total[player_id] = 0
    end

    @nodes.values.each do |node|
      @players.keys.each do |player_id|
        total[player_id] += node.armies[player_id] if node.armies[player_id].present?
      end
    end

    total
  end

  def number_of_nodes_per_player
    total = {}

    @players.keys.each do |player_id|
      total[player_id] = 0
    end

    @nodes.values.each do |node|
      @players.keys.each do |player_id|
        total[player_id] += 1 if node.owner == player_id
      end
    end

    total
  end

  def alive_players
    soldiers  = number_of_soldiers_per_player.select{ |player_id, total| total > 0 }.keys
    nodes     = number_of_nodes_per_player.select{ |player_id, total| total > 0 }.keys

    @players.select{ |player_id, player| soldiers.include?( player_id ) || nodes.include?( player_id ) }
  end

  def states
    @nodes.values.map{ |node| node.state }
  end

  def directed?
    (@parsed['infos']['directed'] || false) == true
  end
end
