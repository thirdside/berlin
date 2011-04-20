module Awardable
  module ClassMethods
    ActiveRecord::Base.has_many :awards, :as => :awardable, :dependent => :destroy
    ActiveRecord::Base.has_many :achievements, :through => :awards
  end

  def self.included base
    base.extend( ClassMethods )
  end

  def award achievement
    self.awards.create( :achievement_id => achievement.id )
  end

  def awarded? achievement
    self.achievement_ids.include?( achievement.id )
  end
end