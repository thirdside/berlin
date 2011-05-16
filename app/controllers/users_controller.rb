class UsersController < InheritedResources::Base

  include Pageable

  has_scope :order, :default => "users.username"
  
  def artificial_intelligences
    @user = User.find(params[:id])
    
    @artificial_intelligences = @user.artificial_intelligences
  end
  
  def games
    @user = User.find(params[:id])
    
    @games = @user.games
  end
  
  protected
    def collection
      @users ||= end_of_association_chain.page(params[:page])
    end
end
