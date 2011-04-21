class Node

  @@nodes = {}

  attr_accessor :id, :type, :adjacents, :owner

  def self.find id
    @@nodes[id]
  end

  def self.parse json
    json = JSON.parse( json )

    id    = json['id']
    type  = json['type']

    Node.new id, type
  end

  def initialize id, type = nil
    @@nodes[id] = self

    @id         = id.to_i
    @type       = NodeType.find type.to_s
    @owner      = nil
    @armies     = Hash.new{ |h,k| h[k] = 0 }
    @adjacents  = []
  end

  def add_soldiers player_id, number_of_soldiers
    @armies[player_id] += number_of_soldiers
  end

  def remove_soldiers player_id, number_of_soldiers
    add_soldiers player_id, number_of_soldiers * -1
  end

  def number_of_soldiers
    @armies[@owner]
  end

  def number_of_soldiers_for player_id
    @armies[player_id]
  end

  def to_hash
    {:id=>@id, :type=>@type.name}
  end

  def adjacent? node
    @adjacents.include? node
  end

  def owned?
    !!@owner
  end

  def armies
    @armies.select{ |player_id, number_of_soldiers| number_of_soldiers > 0 }
  end

  def occupied?
    !armies.count.zero?
  end

  def combat?
    armies.count > 1
  end

  def spawn!
    if owned?
      add_soldiers @owner, @type.soldiers_per_turn
    end
  end

  def fight!
    while combat?
      casualties = armies.values.min
      
      armies.keys.each do |player_id|
        remove_soldiers player_id, casualties
      end
    end

    if occupied?
      @owner = armies.keys.first
    end
  end
end