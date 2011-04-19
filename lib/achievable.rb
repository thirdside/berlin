module Achievable
  module ClassMethods
    ActiveRecord::Base.has_many :achievements, :as => :achievable
  end

  def self.included base
    base.extend( ClassMethods )
  end

  def award achievement
    self.achievements << achievement.new
  end

  def awarded? achievement
    !self.achievements.where( :type => achievement ).count.zero?
  end
end