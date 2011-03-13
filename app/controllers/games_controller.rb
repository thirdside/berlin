class GamesController < InheritedResources::Base
  def show
    @game = Game.find(params[:id])

    respond_to do |format|
      format.html
      format.json { render :json => @game.json }
    end
  end
end
