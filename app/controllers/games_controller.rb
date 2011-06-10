class GamesController < InheritedResources::Base

  actions :index, :show, :new, :create

  before_filter :authenticate_user!, :only=>[:new, :create]

  has_scope :order, :default => "games.id DESC"
  
  def index
    @games = Game.officials.page( params[:page] )
  end
  
  def show
    @game = Game.find(params[:id])

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
    begin
      Game.delay.start_new_game( :debug => params[:debug],
                          :user_id => current_user.id,
                          :is_practice => params[:game][:is_practice],
                          :ais_ids => params[:game][:artificial_intelligence_ids], 
                          :map_id => params[:game][:map_id] )
    rescue Exception => e
      redirect_to( new_game_path, :alert=>e.inspect ) and return
    end

    redirect_to games_path, :notice=>I18n.t('games.success')
  end
end
