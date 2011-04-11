class ArtificialIntelligencesController < InheritedResources::Base

  before_filter :authenticate_user!, :only=>[:new, :create]

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def create
    params[:artificial_intelligence][:user_id] = current_user.id

    create!
  end

end
