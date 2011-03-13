class ArtificialIntelligence < ActiveRecord::Base
  attr_accessor :request, :response
  
  belongs_to :user

  # TODO Each AI need to be aware of their nodes and armies...
end
