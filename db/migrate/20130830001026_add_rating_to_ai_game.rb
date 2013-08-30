class AddRatingToAiGame < ActiveRecord::Migration
  def change
    add_column :artificial_intelligence_games, :rating_change, :float, :default => nil
  end
end
