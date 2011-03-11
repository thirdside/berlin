class Game < ActiveRecord::Base
  belongs_to :map
  belongs_to :winner, :class_name=>"ArtificialIntelligence"
end
