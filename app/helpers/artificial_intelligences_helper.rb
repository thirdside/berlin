module ArtificialIntelligencesHelper
  def show_score score
    score.percentage_of( 1 ).to_decimals( 2 )
  end
end
