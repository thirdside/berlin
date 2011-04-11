class ArtificialIntelligence < ActiveRecord::Base

  belongs_to :user, :counter_cache=>true

  has_many :artificial_intelligence_games, :dependent=>:destroy, :order=>"artificial_intelligence_games.created_at DESC"
  has_many :games, :through=>:artificial_intelligence_games

  scope :ordered, :order=>"artificial_intelligences.name"

  # TODO Each AI need to be aware of their nodes and armies...
  def score
    self.artificial_intelligence_games.map(&:score).to_stat.average
  end
end
