class NodeType
  attr_accessor :name, :soldiers_per_turn, :points

  def initialize json
    @name               = json['name']              || 'node'
    @points             = json['points']            || 0
    @soldiers_per_turn  = json['soldiers_per_turn'] || 0
  end
end