class CreateGames < ActiveRecord::Migration
  def self.up
    create_table :games do |t|
      t.references :map, :null=>false
      t.timestamp :time_start
      t.timestamp :time_end
      t.integer :number_of_turns
      t.integer :artificial_intelligence_games_count, :default=>0
      t.text :json, :null=>false, :limit => 16777216

      t.timestamps
    end
    
    add_index :games, :map_id
  end

  def self.down
    drop_table :games
  end
end
