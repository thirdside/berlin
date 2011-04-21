class Move

  attr_accessor :from, :to, :number_of_soldiers  

  def self.parse artificial_intelligence, json
    json = JSON.parse( json )

    from                = json['from']
    to                  = json['to']
    number_of_soldiers  = json['number_of_soldiers']

    Move.new artificial_intelligence, from, to, number_of_soldiers
  end

  def initialize artificial_intelligence, from, to, number_of_soldiers
    @artificial_intelligence  = artificial_intelligence
    @from                     = Node.find from.to_i
    @to                       = Node.find to.to_i
    @number_of_soldiers       = number_of_soldiers.to_i
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

  def to_hash
    {:artificial_intelligence_id=>@artificial_intelligence.id, :from=>@from.id, :to=>@to.id, :number_of_soldiers=>@number_of_soldiers}
  end
end
