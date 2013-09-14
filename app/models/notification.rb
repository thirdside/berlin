class Notification < ActiveRecord::Base
  belongs_to :user
  belongs_to :notifiable, :polymorphic => true

  scope :unread,  ->{ where("read_at IS NULL") }
  scope :ordered, ->{ order("created_at DESC") }

  attr_accessible :user_id, :notifiable, :read_at

  def self.push id, n
    self.create :user_id => id, :notifiable => n
  end

  def time
    self.created_at
  end
end
