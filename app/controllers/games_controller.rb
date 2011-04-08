class GamesController < InheritedResources::Base

  include Pageable

  has_scope :order, :default => "games.id DESC"
  
  def show
    @game = Game.find(params[:id])

    respond_to do |format|
      format.html
      format.json { render :json => @game.json }
    end
  end
end
