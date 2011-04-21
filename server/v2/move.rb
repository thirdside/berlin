class Move

  attr_accessor :from, :to, :number_of_soldiers  

  def self.parse player_id, json
    json = JSON.parse( json )

    from                = json['from']
    to                  = json['to']
    number_of_soldiers  = json['number_of_soldiers']

    Move.new player_id, from, to, number_of_soldiers
  end

  def initialize player_id, from, to, number_of_soldiers
    @player_id          = player_id
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

    # Player has enough soldiers on from node?
    return false unless @from.number_of_soldiers_for( @player_id )

    true
  end

  def to_hash
    {:player_id=>@player_id, :from=>@from.id, :to=>@to.id, :number_of_soldiers=>@number_of_soldiers}
  end
end
