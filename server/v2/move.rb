class Move

  attr_accessor :from, :to, :number_of_soldiers  

  def self.parse json
    json = JSON.parse( json )

    from                = json['from']
    to                  = json['to']
    number_of_soldiers  = json['number_of_soldiers']

    Move.new from, to, number_of_soldiers
  end

  def initialize from, to, number_of_soldiers
    @from               = Node.find from.to_i
    @to                 = Node.find to.to_i
    @number_of_soldiers = number_of_soldiers.to_i
  end

  def valid?
    # Nodes exist?
    return false unless @from && @to

    # Positive number of soldiers to move?
    return false unless @number_of_soldiers > 0

    # Nodes are adjacent?
    return false unless @from.adjacent? @to

    true
  end

  def to_json
    {:from=>@from.id, :to=>@to.id, :number_of_soldiers=>@number_of_soldiers}
  end
end
