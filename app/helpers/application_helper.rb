module ApplicationHelper
  def menu
    temp = {}
    temp[ArtificialIntelligence] = artificial_intelligences_path
    temp[Game]                   = games_path
    temp[Map]                    = maps_path
    temp[User]                   = users_path
    temp
  end

  def errors_for model
    unless model.errors.empty?
      html = ""

      model.errors.full_messages.each do |error|
        html << content_tag( :li, error, {:class => :error}, false )
      end

      content_tag( :ul, html, {:class => :errors}, false )
    end
  end
end
