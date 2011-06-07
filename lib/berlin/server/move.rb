class Berlin::Server::Move

  attr_accessor :player_id, :from, :to, :number_of_soldiers

  def self.parse player_id, json
    json = JSON.parse( json ) if json.is_a? String

    from                = json['from']
    to                  = json['to']
    number_of_soldiers  = json['number_of_soldiers']

    new player_id, from, to, number_of_soldiers
  end

  def initialize player_id, from, to, number_of_soldiers
    @player_id          = player_id
    @from               = from.to_i
    @to                 = to.to_i
    @number_of_soldiers = number_of_soldiers.to_i
  end

  def to_hash
    {:player_id=>@player_id, :from=>@from, :to=>@to, :number_of_soldiers=>@number_of_soldiers}
  end
end