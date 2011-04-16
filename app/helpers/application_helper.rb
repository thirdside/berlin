module ApplicationHelper
  def menu
    temp = {}
    temp[ArtificialIntelligence.model_name.human]  = artificial_intelligences_path
    temp[Game.model_name.human]                    = games_path
    temp[Map.model_name.human]                     = maps_path
    temp[User.model_name.human]                    = users_path
    temp[Doc.model_name]                           = doc_path
    temp
  end

  def errors_for model
    unless model.errors.empty?
      html = ""

      model.errors.full_messages.each do |error|
        html << content_tag( :li, error, {:class=>:error}, false )
      end

      content_tag( :ul, html, {:class=>:errors}, false )
    end
  end
end
