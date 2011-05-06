class Award < ActiveRecord::Base
  belongs_to :awardable, :polymorphic => true
  belongs_to :achievement

  scope :grouped, select('COUNT(awards.id) as total').group('awards.achievement_id')
end
