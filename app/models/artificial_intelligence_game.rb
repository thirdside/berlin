class ArtificialIntelligenceGame < ActiveRecord::Base

  after_create :check_for_achievements

  belongs_to :artificial_intelligence, :counter_cache=>true
  belongs_to :game, :counter_cache=>true

  scope :winners, where("artificial_intelligence_games.winner IS TRUE")

  def date
    self.created_at.to_date
  end

  protected
    def check_for_achievements
      GamesPlayedAchievement.check_conditions_for( self.artificial_intelligence )
    end
end
