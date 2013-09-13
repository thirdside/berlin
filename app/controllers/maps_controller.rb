class MapsController < ApplicationController
  inherit_resources

  actions :index, :show, :new, :create

  include Pageable

  def show
    @map = Map.includes(:games => :artificial_intelligence_games).find(params[:id])
    @games = @map.games.officials.page(params[:page])

    respond_to do |format|
      format.html
      format.json { render :json => @map.json }
    end
  end
end
