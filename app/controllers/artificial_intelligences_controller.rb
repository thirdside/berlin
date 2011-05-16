class ArtificialIntelligencesController < InheritedResources::Base
  
  belongs_to :user, :optional => true
  
  actions :index, :show, :new, :create

  before_filter :authenticate_user!, :only=>[:new, :create]

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def create
    params[:artificial_intelligence][:user_id] = current_user.id

    create!
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
