class GamesPlayedAchievement < Achievement

  class FirstGame < GamesPlayedAchievement
    def self.requirement; 1; end
  end

  class TenGames < GamesPlayedAchievement
    def self.requirement; 10; end;
  end

  class FiftyGames < GamesPlayedAchievement
    def self.requirement; 50; end;
  end

  class HundredGames < GamesPlayedAchievement
    def self.requirement; 100; end;
  end

  class FiveHundredGames < GamesPlayedAchievement
    def self.requirement; 500; end;
  end

  class ThousandGames < GamesPlayedAchievement
    def self.requirement; 1000; end;
  end

  def self.check_conditions_for resource
    self.subclasses.each do |award|
      if !resource.awarded?( award ) and resource.artificial_intelligence_games.size > award.requirement
        resource.award( award )
      end
    end
  end
end

