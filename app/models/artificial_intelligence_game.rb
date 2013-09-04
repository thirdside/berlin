class ArtificialIntelligenceGame < ActiveRecord::Base

  attr_accessible :is_practice, :game, :artificial_intelligence, :player, :score, :winner, :rating

  after_create :check_for_achievements

  belongs_to :artificial_intelligence, :counter_cache => true
  belongs_to :game, :counter_cache => true

  scope :ordered,             ->{ order("artificial_intelligence_games.created_at DESC") }
  scope :winners,             ->{ where(:winner => true) }
  scope :for_official_games,  ->{ includes(:game).where(:games => {:is_practice => false}) }
  scope :for_practice_games,  ->{ includes(:game).where(:games => {:is_practice => true}) }
  scope :recent,              ->(n = 30){ ordered.limit( n ) }

  def date
    self.created_at.to_date
  end

  def time
    self.created_at
  end

  protected
  def check_for_achievements
    GamesPlayedAchievement.check_conditions_for( self.artificial_intelligence )
    VictoriesAchievement.check_conditions_for( self.artificial_intelligence )
  end
end
