class ArtificialIntelligence < ActiveRecord::Base  
  belongs_to :user

  # TODO Each AI need to be aware of their nodes and armies...
end
