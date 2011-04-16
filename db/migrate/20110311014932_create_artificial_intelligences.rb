class CreateArtificialIntelligences < ActiveRecord::Migration
  def self.up
    create_table :artificial_intelligences do |t|
      t.references :user, :null=>false
      t.string  :name, :null=>false
      t.string  :language
      t.string  :url_ready, :null=>false
      t.string  :url_on_turn, :null=>false
      t.integer :artificial_intelligence_games_count, :default=>0
      
      t.timestamps
    end
    
    add_index :artificial_intelligences, :user_id
  end

  def self.down
    drop_table :artificial_intelligences
  end
end
