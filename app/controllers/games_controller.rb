class GamesController < InheritedResources::Base

  before_filter :authenticate_user!, :only=>[:new, :create]

  include Pageable

  has_scope :order, :default => "games.id DESC"
  
  def show
    @game = Game.find(params[:id])

    respond_to do |format|
      format.html
      format.json { render :json => @game.json }
    end
  end

  def new
    if params[:artificial_intelligence_id]
      if ArtificialIntelligence.exists?( params[:artificial_intelligence_id] )
         @selected_ai = ArtificialIntelligence.find( params[:artificial_intelligence_id] )
      end
    end

    new!
  end

  def create
    raiser params
  end
end
