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
    @maximum_number_of_turns  = @parsed['map']['maximum_number_of_turns'] || 100
    @number_of_players        = @parsed['map']['number_of_players']       || []
    @time_limit_per_turn      = @parsed['map']['time_limit_per_turn']     || 1000

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
      @players[index] = player 
    end
    
    @parsed['spawn_points'][@players.size.to_s].each do |player_id, nodes|
      nodes.each do |node|
        @nodes[node['node']].owner = player_id
        @nodes[node['node']].add_soldiers player_id, node['number_of_soldiers']
      end
    end
  end

  def directed?
    (@parsed['map']['directed'] || false) == true
  end
end
