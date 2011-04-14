class ArtificialIntelligence < ActiveRecord::Base

  LANGUAGES = %w(java php ruby python c c++ c# go)

  belongs_to :user, :counter_cache=>true

  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :games, :through=>:artificial_intelligence_games

  scope :ordered, :order=>"artificial_intelligences.name"

  validates :name, :presence=>true, :uniqueness=>true, :length => { :minimum => 1 }

  # TODO Each AI need to be aware of their nodes and armies...
  def score
    self.artificial_intelligence_games.map(&:score).to_stat.average
  end
end
