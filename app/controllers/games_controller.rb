class GamesController < ApplicationController
  inherit_resources
  extend RescueFromMismatch

  respond_to :html
  respond_to :json, :only => [:create, :show, :index]

  skip_before_filter :ensure_api_authenticated, :only => [:show]

  actions :index, :show, :new, :create

  before_filter :authenticate_user!, :only => [:new, :create, :rematch]

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
      format.html { render :show }
      format.json { render :json => @game, :callback => params[:callback] }
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

  def rematch
    @game = Game.where(:id => params[:id]).first

    Game.queue_game(current_user, {:map_id => @game.map_id, :artificial_intelligence_ids => @game.artificial_intelligence_ids, :is_practice => @game.is_practice})

    redirect_to games_path, :notice => I18n.t('games.success')
  end

  def create
    Game.queue_game(current_user, params.require(:game))

    redirect_to games_path, :notice => I18n.t('games.success')
  end
end
