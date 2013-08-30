class AddRoundToGame < ActiveRecord::Migration
  def change
    add_column :games, :round_id, :integer, :default => nil
  end
end
