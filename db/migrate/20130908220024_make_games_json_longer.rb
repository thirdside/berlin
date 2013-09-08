class MakeGamesJsonLonger < ActiveRecord::Migration
  def up
    change_column :games, :json, :text, :limit => 33554432
  end

  def down
    change_column :games, :json, :text, :limit => 16777216
  end
end
