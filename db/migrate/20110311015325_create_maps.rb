class CreateMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.text :json

      t.timestamps
    end
  end

  def self.down
    drop_table :maps
  end
end
