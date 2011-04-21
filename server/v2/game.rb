class Game
  
  attr_accessor :map, :ais, :turn, :moves
  
  def initialize
    @map = nil
    @ais = []

    # @history => {1=>{:moves=>[], :spawns=>[], :init_state=>[], :post_state=>[]}}
    @turns = Hash.new{ |h,k| h[k] = Hash.new{ |hh,kk| hh[kk] } }

    @turn = 0
  end

  def next_turn
    @turn += 1
  end

  def register_move move
    @turns[@turn][:moves] << move if move.valid?
  end

  def move!
    @turns[@turn][:moves].each do |move|
      @map.move! move
    end
  end

  def spawn!
    @map.nodes.each do |node|
      node.spawn!
    end
  end

  def fight!
    @map.nodes.select{ |node| node.occupied? }.each do |node|
      node.fight!
    end
  end

  def run
  end
end
