class MapsController < ApplicationController
  inherit_resources
  respond_to :html
  respond_to :json, :only => [:show, :index]

  skip_before_filter :ensure_api_authenticated, :only => [:show, :index]

  actions :index, :show, :new, :create

  include Pageable

  def show
    @map = Map.includes(:games => :artificial_intelligence_games).find(params[:id])

    @games = @map.games.officials.recent.includes(:winners, :map)

    respond_to do |format|
      format.html { render :show }
      format.json { render :json => @map, :callback => params[:callback] }
    end
  end
end
