class MapsController < ApplicationController
  inherit_resources

  actions :index, :show, :new, :create

  include Pageable

  def show
    @map = Map.where(:id => params[:id]).first

    @games = @map.games.officials.recent.includes(:winners, :map)

    respond_to do |format|
      format.html
      format.json { render :json => @map.json }
    end
  end
end
