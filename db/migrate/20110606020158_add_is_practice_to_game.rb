class AddIsPracticeToGame < ActiveRecord::Migration
  def self.up
    add_column :games, :is_practice, :boolean, :default=>false, :nullable=>false
  end

  def self.down
    remove_column :games, :is_practice
  end
end
