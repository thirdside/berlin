class TournamentsController < ApplicationController
  inherit_resources
  respond_to :json, :html

  before_filter :ensure_logged_in, :only => [:edit, :update, :create, :new]
  before_filter :ensure_ownership, :ensure_not_started, :only => [:edit, :update]

  def show
    @tournament = Tournament.includes(:rounds => {:games => [:winners, :map]}).find(params[:id])
  end

  def artificial_intelligence_games
    ai_games = resource.artificial_intelligence_games.order(:created_at => :asc)
    respond_with(ai_games)
  end

  def create
    @tournament = current_user.tournaments.build(params[:tournament])
    create!
  end

  protected
  def ensure_ownership
    unless current_user == resource.user
      redirect_to resource, :alert => t("tournaments.cannot_edit_flash")
    end
  end

  def ensure_not_started
    if resource.rounds.any?
      redirect_to resource, :alert => t("tournaments.already_started")
    end
  end
end
