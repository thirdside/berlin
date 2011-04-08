module ApplicationHelper
  def menu
    temp = {}
    temp[User]                    = user_path( current_user ) if user_signed_in?
    temp[ArtificialIntelligence]  = artificial_intelligences_path
    temp[Game]                    = games_path
    temp
  end
end
