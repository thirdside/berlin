class Map < ActiveRecord::Base
  has_many :games, :dependent=>:destroy, :order=>"games.time_start DESC"
  has_many :artificial_intelligence_games, :through=>:games

  def best_artificial_intelligence
    self.artificial_intelligence_games.group("artificial_intelligence_id").select("SUM(artificial_intelligence_games.score) / COUNT(artificial_intelligence_games.id) AS ratio").order("ratio DESC").first.try(:artificial_intelligence)
  end
end
