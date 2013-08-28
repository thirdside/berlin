class Berlin::Server::Path
  attr_accessor :from, :to

  def self.parse json
    json = JSON.parse( json ) if json.is_a? String

    from  = json['from']
    to    = json['to']

    new from, to
  end

  def initialize from, to
    @from = from.to_i
    @to   = to.to_i
  end

  def to_hash
    {:from => @from, :to => @to}
  end
end