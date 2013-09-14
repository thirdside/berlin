class UsersController < ApplicationController
  inherit_resources

  include Pageable

  has_scope :order, :default => "users.username"
  
  before_filter :current_user_only, :only => [:edit, :destroy, :update]

  def artificial_intelligences
    @user = User.where(:id => params[:id]).first
    
    @artificial_intelligences = @user.artificial_intelligences.ordered
  end
  
  def games
    @user = User.where(:id => params[:id]).first
    
    @games = @user.games.ordered
  end

  private

  def current_user_only
    redirect_to(users_path) unless current_user && current_user.id.to_s == params[:id]
  end
end
