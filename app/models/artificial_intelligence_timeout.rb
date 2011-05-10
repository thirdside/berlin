class ArtificialIntelligenceTimeout < ActiveRecord::Base
  belongs_to :artificial_intelligence
  
  def time
    self.created_at
  end
end
