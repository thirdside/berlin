class GamesPlayedAchievement < Achievement

  def reached? games_played
    games_played >= self.read_attribute( :condition_1 )
  end

  def self.check_conditions_for resource
    self.all.each do |achievement|
      if !resource.awarded?( achievement ) && achievement.reached?( resource.artificial_intelligence_games.size )
        resource.award( achievement )
      end
    end
  end
end

