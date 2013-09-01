class TournamentsController < ApplicationController
  inherit_resources
  respond_to :json, :html

  before_filter :ensure_logged_in, :only => [:edit, :update, :create, :new]
  before_filter :verify_ownership, :only => [:edit, :update]

  def create
    @tournament = current_user.tournaments.build(params[:tournament])
    create!
  end

  protected
  def verify_ownership
    unless current_user == resource.user
      redirect_to resource, :alert => t("tournaments.cannot_edit_flash")
    end
  end
end
