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

  def state
    {:node_id=>@id, :player_id=>owner, :number_of_soldiers=>number_of_soldiers}
  end

  def number_of_soldiers
    armies.empty? ? 0 : armies.to_a.first[1]
  end

  def points
    @type.points
  end

  def points?
    points > 0
  end

  def armies
    a = {}
    
    @armies.select{ |player_id, number_of_soldiers| number_of_soldiers > 0 }.each do |army|
      a[army[0]] = army[1]
    end

    a
  end

  def combat?
    armies.size > 1
  end

  def soldiers_per_turn
    @type.soldiers_per_turn
  end

  def move_soldiers player_id, node, number_of_soldiers
    return if number_of_soldiers < 1
    
    # be sure to not move more soldiers than we have
    number_of_soldiers = [@armies[player_id], number_of_soldiers].min

    # move soldiers from one node to another
    self.add_soldiers player_id, number_of_soldiers * -1
    node.add_soldiers player_id, number_of_soldiers
  end

  def add_soldiers player_id, number_of_soldiers
    @armies[player_id] += number_of_soldiers
  end

  def occupied?
    armies.size > 0
  end

  def owned?
    owner.present?
  end

  def link_to node
    @links << node
  end

  def is_type? type
    @type.name == type.to_s
  end
  
  def adjacents
    @links
  end

  def adjacent? node
    self.adjacents.include? node
  end

end