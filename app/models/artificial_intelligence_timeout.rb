class ArtificialIntelligenceTimeout < ActiveRecord::Base
  belongs_to :artificial_intelligence
  
  after_create :set_artificial_intelligence_as_inactive
  
  def time
    self.created_at
  end
  
  protected
    def set_artificial_intelligence_as_inactive
      self.artificial_intelligence.update_attribute( :is_active, false )
    end
end
