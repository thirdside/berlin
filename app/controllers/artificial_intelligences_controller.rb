class ArtificialIntelligencesController < InheritedResources::Base

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def index
    @artificial_intelligences = ArtificialIntelligence.find(:all, :select=>"artificial_intelligences.*, SUM(artificial_intelligence_games.score) AS score", :joins=>:artificial_intelligence_games, :order=>"score DESC")
  end
  
end
