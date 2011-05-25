class ArtificialIntelligencesController < InheritedResources::Base
  
  belongs_to :user, :optional => true

  before_filter :authenticate_user!, :only=>[:new, :create]

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def create
    params[:artificial_intelligence][:user_id] = current_user.id

    create!
  end
  
  def update
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])
    
    if current_user.id == @artificial_intelligence.user_id
      if @artificial_intelligence.update_attributes(params[:artificial_intelligence])
        redirect_to @artificial_intelligence, :notice => t('activerecord.messages.update') and return
      end
    end
    
    render :edit
  end

  def ping
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])

    begin
      redirect_to @artificial_intelligence, :notice => @artificial_intelligence.ping
    rescue Exception => e
      redirect_to @artificial_intelligence, :alert => e.inspect
    end
  end

end
