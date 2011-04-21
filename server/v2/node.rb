class Node

  @@nodes = {}

  attr_accessor :id, :type, :adjacents

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
    @armies     = []
    @adjacents  = []
  end

  def add_soldiers artificial_intelligence, number_of_soldiers
    @armies[artificial_intelligence.id] += number_of_soldiers
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
end