class NotificationsController < InheritedResources::Base
  def index
    index!
    
    @notifications.unread.update_all(:read_at=>Time.now)
  end
  
  protected
    def begin_of_association_chain
      current_user
    end
end
