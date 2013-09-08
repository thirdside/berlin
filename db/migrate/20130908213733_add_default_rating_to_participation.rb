class AddDefaultRatingToParticipation < ActiveRecord::Migration
  def up
    change_column :participations, :rating, :integer, :default => 1500
  end

  def down
    change_column :participations, :rating, :float, :default => nil
  end
end
