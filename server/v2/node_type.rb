class NodeType

  @@types = {}

  attr_accessor :name, :points, :soldiers_per_turn

  def self.find id
    @@types[name]
  end

  def self.parse json
    json = JSON.parse( json )

    name              = json['name']
    points            = json['points']
    soldiers_per_turn = json['soldiers_per_turn']

    NodeType.new name, points, soldiers_per_turn
  end

  def initialize name, points, soldiers_per_turn
    @@types[name] = self

    @name = name.to_s
    @points = points.to_i
    @soldiers_per_turn = soldiers_per_turn.to_i
  end
end