class MapsController < InheritedResources::Base

  include Pageable

  def show
    @map = Map.find(params[:id], :include=>{:games=>:artificial_intelligence_games})
    @games = @map.games.page(params[:page])

    respond_to do |format|
      format.html
      format.json { render :json => @map.json }
    end
  end
end
