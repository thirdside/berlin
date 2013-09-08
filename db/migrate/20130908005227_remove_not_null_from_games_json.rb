class RemoveNotNullFromGamesJson < ActiveRecord::Migration
  def up
    change_column :games, :json, :text, :null => true
  end

  def down
    change_column :games, :json, :text, :null => false
  end
end
