class AddRatingToAiGame < ActiveRecord::Migration
  def change
    add_column :artificial_intelligence_games, :rating, :float, :default => nil
  end
end
