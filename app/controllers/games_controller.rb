class GamesController < ApplicationController
  inherit_resources

  actions :index, :show, :new, :create

  before_filter :authenticate_user!, :only => [:new, :create]

  has_scope :order, :default => "games.id DESC"

  def index
    @games = if current_user
      Game.finished.for_user( current_user )
    else
      Game.finished.officials
    end.page( params[:page] )
  end

  def show
    @game = Game.where(:id => params[:id]).includes(:winners).first

    respond_to do |format|
      format.html
      format.json { render :json => @game.json }
    end
  end

  def random
    redirect_to Game.order('RAND()').first
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
    Game.queue_game(current_user, params.require(:game))

    redirect_to games_path, :notice => I18n.t('games.success')
  end
end
