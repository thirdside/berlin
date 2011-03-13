class Map < ActiveRecord::Base
  attr_accessor :parsed, :types, :nodes, :number_of_players, :time_limit_per_turn, :players, :maximum_number_of_turns
  
  def after_initialize
    @parsed   = JSON.parse( self.read_attribute( :json ) )
    @players  = {}
    @types    = {}
    @nodes    = {}

    self.build!
  end
  
  def build!
    @maximum_number_of_turns  = @parsed['infos']['maximum_number_of_turns'] || 100
    @number_of_players        = @parsed['infos']['number_of_players']       || []
    @time_limit_per_turn      = @parsed['infos']['time_limit_per_turn']     || 1000

    @parsed['types'].each do |type|
      @types[type['name']] = NodeType.new(type)
    end

    @parsed['nodes'].each do |node|
      @nodes[node['id']] = Node.new(node, @types[node['type']])
    end

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

  # TODO IMPORTANT!!! we'll need to add a total number of soldiers to player to avoid to recheck each node
  # this is only a quick test code
  def alive_players
    temp = Hash.new{ |h,k| h[k] = 0 }

    @nodes.values.each do |node|
      @players.keys.each do |player_id|
        temp[player_id] += node.armies[player_id] if node.armies[player_id].present?
      end
    end

    temp.select{ |k,v| v > 0 }.map{ |player, total| player }
  end

  def directed?
    (@parsed['infos']['directed'] || false) == true
  end
end
