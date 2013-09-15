class TournamentsController < ApplicationController
  inherit_resources
  belongs_to :organisation, :optional => true

  respond_to :html, :except => [:artificial_intelligence_games]
  respond_to :json

  before_filter :ensure_logged_in, :only => [:edit, :update, :create, :new]
  before_filter :ensure_can_edit, :ensure_not_started, :only => [:edit, :update]

  def show
    @tournament = Tournament.includes(:rounds => {:games => [:winners, :map]}, :participations => [:artificial_intelligence]).find(params[:id])
  end

  def artificial_intelligence_games
    ai_games = resource.artificial_intelligence_games
      .select("artificial_intelligence_games.*, artificial_intelligences.name as name")
      .joins(:game, :artificial_intelligence)
      .where(:games => {:status => :finished})
      .order(:id => :asc)

    respond_with(:artificial_intelligence_games => ai_games)
  end

  def create
    @tournament = current_user.tournaments.build(params[:tournament])
    create!
  end

  protected

  def ensure_not_started
    if resource.rounds.any?
      redirect_to resource, :alert => t("tournaments.already_started")
    end
  end
end
