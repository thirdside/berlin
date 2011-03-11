class Map < ActiveRecord::Base
  def json
    @json ||= JSON.parse( self.read_attribute( :json ) )
  end
  
  def maximum_number_of_turns
    self.json['info']['maximum_number_of_turns'] || 1000
  end
  
  def time_limit_per_turn
    self.json['info']['time_limit_per_turn'] || 5000
  end
  
  def directed?
    self.json['info']['directed'] == 'true'
  end
end
