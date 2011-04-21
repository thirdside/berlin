class Map
  attr_accessor :nodes, :paths

  def initialize
    @nodes = []
    @paths = []
  end

  def move! move
    from  = Node.find move.from
    to    = Node.find move.to

    from.add_soldiers move.number_of_soldiers * -1
    to.add_soldiers move.number_of_soldiers
  end
end
