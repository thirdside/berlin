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
    @type       = NodeType.find type.to_i
    @adjacents  = []
  end

  def adjacent? node
    @adjacents.include? node
  end
end