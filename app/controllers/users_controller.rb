class UsersController < InheritedResources::Base

  include Pageable

  has_scope :order, :default => "users.username"
  
  before_filter :current_user_only, :only => [:edit, :destroy, :update]

  def artificial_intelligences
    @user = User.find(params[:id])
    
    @artificial_intelligences = @user.artificial_intelligences
  end
  
  def games
    @user = User.find(params[:id])
    
    @games = @user.games
  end

  private

  def current_user_only
    redirect_to(users_path) unless current_user && current_user.id.to_s == params[:id]
  end
end
