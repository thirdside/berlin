module ApplicationHelper
  def menu
    {
      ArtificialIntelligence  => artificial_intelligences_path,
      Game                    => games_path,
      Map                     => maps_path,
      User                    => users_path,
      Tournament              => tournaments_path
    }
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
