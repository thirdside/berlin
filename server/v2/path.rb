class Path

  @@paths = []

  attr_accessor :from, :to

  def self.parse json
    json = JSON.parse( json )

    from  = json['from']
    to    = json['to']

    Path.new from, to
  end

  def initialize from, to
    @@paths << self
    
    @from = Node.find from
    @to   = Node.find to
  end

end