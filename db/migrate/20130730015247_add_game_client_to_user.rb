class AddGameClientToUser < ActiveRecord::Migration
  def self.up
    add_column :users, :game_client, :string, default: 'canvas'
  end

  def self.down
    remove_column :users, :game_client
  end
end
