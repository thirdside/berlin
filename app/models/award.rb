class Award < ActiveRecord::Base
  belongs_to :awardable, :polymorphic => true
  belongs_to :achievement
end
