class CreateArtificialIntelligences < ActiveRecord::Migration
  def self.up
    create_table :artificial_intelligences do |t|
      t.references :user, :null=>false
      t.string :url
      t.integer :artificial_intelligence_games_count
      
      t.timestamps
    end
    
    add_index :artificial_intelligences, :user_id
  end

  def self.down
    drop_table :artificial_intelligences
  end
end
