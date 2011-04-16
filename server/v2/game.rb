class Game
  
  attr_accessor :map, :ais, :turn, :moves
  
  def initialize
    @map = nil
    @ais = []

    @moves = Hash.new{ |h,k| h[k] = Hash.new{ |hh,kk| hh[kk] = [] } }

    @turn = 0
  end

  def next_turn
    @turn += 1
  end

  def register_move ai, move
    moves[@turn][ai.id] << move if move.valid?
  end
end
