class RoundsController < ApplicationController
  inherit_resources
  extend RescueFromMismatch

  respond_to :html
  respond_to :json, :only => [:create]

  actions :index, :show, :new, :create
  belongs_to :tournament

  before_filter :ensure_owns_tournament, :only => [:create]

  def create
    map = Map.find(params[:round][:map_id])
    Game.assert_ai_count(map, params[:round][:players_per_game])
    create! { |success, failure|
      success.html{ redirect_to resource.tournament }
    }
  end

  protected
  def ensure_owns_tournament
    tournament = Tournament.find(params[:tournament_id])
    cannot_edit_resource(tournament) unless tournament.user == current_user || tournament.organisation.try(:user) == current_user
  end
end
