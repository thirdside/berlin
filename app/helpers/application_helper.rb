module ApplicationHelper
  def menu
    temp = {}
    temp[User]                    = users_path
    temp[ArtificialIntelligence]  = artificial_intelligences_path
    temp[Game]                    = games_path
    temp
  end
end
