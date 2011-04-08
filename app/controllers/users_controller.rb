class UsersController < InheritedResources::Base

  has_scope :order, :default => "users.username"

  protected
    def collection
      @users ||= end_of_association_chain.page(params[:page])
    end
end
