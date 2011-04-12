class ArtificialIntelligenceGame < ActiveRecord::Base
  belongs_to :artificial_intelligence, :counter_cache=>true
  belongs_to :game, :counter_cache=>true

  def date
    self.created_at.to_date
  end
end
