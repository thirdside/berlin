class Map
  attr_accessor :nodes, :paths

  def initialize
    @nodes = []
    @paths = []
  end

  def move! move
    from  = Node.find move.from
    to    = Node.find move.to

    from.remove_soldiers move.player_id, move.number_of_soldiers
    to.add_soldiers move.player_id, move.number_of_soldiers
  end
end
