class MapsController < InheritedResources::Base

  actions :index, :show, :new, :create

  include Pageable

  def show
    @map = Map.find(params[:id], :include => {:games => :artificial_intelligence_games})
    @games = @map.games.officials.page(params[:page])

    respond_to do |format|
      format.html
      format.json { render :json => @map.json }
    end
  end
end
