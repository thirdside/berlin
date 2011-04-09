class ArtificialIntelligencesController < InheritedResources::Base

  before_filter :authenticate_user!, :only=>[:new, :create]

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def index
    @artificial_intelligences = ArtificialIntelligence.select("artificial_intelligences.*, SUM(artificial_intelligence_games.score) AS score").joins("LEFT JOIN artificial_intelligence_games ON artificial_intelligence_games.artificial_intelligence_id = artificial_intelligences.id").order("score DESC")
  end

  def create
    params[:artificial_intelligence][:user_id] = current_user.id

    create!
  end

end
