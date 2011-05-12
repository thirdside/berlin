module Likable
  module ClassMethods
    ActiveRecord::Base.has_many :likes, :as=>:likable
  end

  def self.included base
    base.extend( ClassMethods )
  end

  def liked_by? user
    !self.likes.where(:user_id=>user.id).count.zero?
  end
end