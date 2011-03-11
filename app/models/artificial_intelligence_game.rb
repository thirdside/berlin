class ArtificialIntelligenceGame < ActiveRecord::Base
  belongs_to :artificial_intelligence, :counter_cache=>true
  belongs_to :game
end
