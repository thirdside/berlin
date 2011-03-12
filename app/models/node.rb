class Node
  @@nodes = []

  attr_accessor :id, :type, :owner, :links, :armies

  def self.find id
    @@nodes.detect{ |node| node.id == id }
  end

  def initialize json, type
    @id     = json['id']
    @type   = type
    @links  = []
    @armies = Hash.new{ |h,k| h[k] = 0 }

    @@nodes << self
  end
  
  def soldiers_per_turn
    @type.soldiers_per_turn
  end

  def set_number_of_soldiers player_id, number_of_soldiers
    @armies[player_id] += number_of_soldiers
  end

  def occupied?
    !owner.nil?
  end

  def link_to node
    @links << node
  end

  def is_type? type
    self.type == type.to_s
  end

  def adjacents
    @links
  end
end