class GamesController < InheritedResources::Base
  
  has_scope :order, :default => "games.id DESC"
  
  def show
    @game = Game.find(params[:id])

    respond_to do |format|
      format.html
      format.json { render :json => @game.json }
    end
  end

  protected
    def collection
      @games ||= end_of_association_chain.page(params[:page])
    end
end
