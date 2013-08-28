class Award < ActiveRecord::Base
  belongs_to :awardable, :polymorphic => true
  belongs_to :achievement

  scope :grouped, select('COUNT(awards.id) as total, awards.achievement_id as achievement_id').group('awards.achievement_id')
end
