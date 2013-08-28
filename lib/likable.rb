module Likable
  def self.included base
    base.has_many :likes, :as => :likable
  end

  def liked_by? user
    !self.likes.where(:user_id => user.id).count.zero?
  end
end
