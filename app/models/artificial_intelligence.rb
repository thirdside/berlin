class ArtificialIntelligence < ActiveRecord::Base
  attr_accessor :request, :response
  
  belongs_to :user
end
