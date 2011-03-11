class Map < ActiveRecord::Base
  def json
    @json ||= JSON.parse( self.read_attribute( :json ) )
  end
  
  def info
    self.json['info'] || []
  end
  
  def maximum_number_of_turns
    self.info['maximum_number_of_turns'] || 1000
  end
  
  def time_limit_per_turn
    self.info['time_limit_per_turn'] || 5000
  end
  
  def directed?
    self.info['info']['directed'] == 'true'
  end
end
