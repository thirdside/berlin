class Like < ActiveRecord::Base
  belongs_to :user
  belongs_to :likable, :polymorphic=>true, :counter_cache=>true
end
