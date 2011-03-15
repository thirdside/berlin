class CreateGames < ActiveRecord::Migration
  def self.up
    create_table :games do |t|
      t.references :map
      t.timestamp :time_start
      t.timestamp :time_end
      t.integer :number_of_turns
      t.text :json

      t.timestamps
    end

    add_index :games, :map_id
  end

  def self.down
    drop_table :games
  end
end
