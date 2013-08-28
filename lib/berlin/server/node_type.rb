class Berlin::Server::NodeType
  attr_accessor :name, :points, :soldiers_per_turn

  def self.parse json
    json = JSON.parse( json ) if json.is_a? String

    name              = json['name']
    points            = json['points']
    soldiers_per_turn = json['soldiers_per_turn']

    new name, points, soldiers_per_turn
  end

  def initialize name, points, soldiers_per_turn
    @name = name.to_s
    @points = points.to_i
    @soldiers_per_turn = soldiers_per_turn.to_i
  end

  def to_hash
    {:name => @name, :points => @points, :soldiers_per_turn => @soldiers_per_turn}
  end
end