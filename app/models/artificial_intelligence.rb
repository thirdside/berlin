class ArtificialIntelligence < ActiveRecord::Base  
  belongs_to :user, :counter_cache=>true

  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :games, :through=>:artificial_intelligence_games

  # TODO Each AI need to be aware of their nodes and armies...
end
