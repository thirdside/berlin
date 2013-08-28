class CreateMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.string :name, :null => false
      t.string :version
      t.integer :games_count, :default => 0
      t.text :json, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :maps
  end
end
