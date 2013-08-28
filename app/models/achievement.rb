class Achievement < ActiveRecord::Base
  has_many :awards, :dependent=>:destroy

  scope :of_type, lambda { |type| where("type = ?", type) }
end
