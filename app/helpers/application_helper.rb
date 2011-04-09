module ApplicationHelper
  def menu
    temp = {}
    temp[ArtificialIntelligence]  = artificial_intelligences_path
    temp[Game]                    = games_path
    temp[Map]                     = maps_path
    temp
  end
end
