module Player
  def score
    self.artificial_intelligence_games.for_official_games.pluck(:score).compact.to_stat.average
  end

  def games_played
    self.artificial_intelligence_games.for_official_games.count
  end

  def won_games
    self.artificial_intelligence_games.for_official_games.winners.count
  end

  def victory_percentage
    self.won_games.percentage_of( self.games_played ).to_decimals
  end
end
