class AddStatusAndLastErrorToGames < ActiveRecord::Migration
  def change
    add_column :games, :status, :string, :limit => 20
    add_column :games, :last_error, :text
  end
end
