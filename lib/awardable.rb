module Awardable
  def self.included base
    base.has_many :awards, :as => :awardable, :dependent => :destroy
    base.has_many :achievements, :through => :awards
  end

  def award achievement
    self.awards.create( :achievement_id => achievement.id )
  end

  def awarded? achievement
    self.achievement_ids.include?( achievement.id )
  end
end
