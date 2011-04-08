class ArtificialIntelligencesController < InheritedResources::Base

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def index
    @artificial_intelligences = ArtificialIntelligence.find(:all, :select=>"artificial_intelligences.*, SUM(artificial_intelligence_games.score) AS score", :joins=>:artificial_intelligence_games, :order=>"score DESC")
  end

  protected
    def collection
      @artificial_intelligences ||= end_of_association_chain.page(params[:page])
    end
  
end
