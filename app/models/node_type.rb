class NodeType
  attr_accessor :soldiers_per_turn

  def initialize json
    @soldiers_per_turn = json['soldiers_per_turn'] || 0
  end
end