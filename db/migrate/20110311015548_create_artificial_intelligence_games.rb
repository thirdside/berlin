class CreateArtificialIntelligenceGames < ActiveRecord::Migration
  def self.up
    create_table :artificial_intelligence_games do |t|
      t.references  :artificial_intelligence
      t.references  :game
      t.integer     :player_id
      t.boolean     :winner
      t.float       :score
      t.timestamps
    end
    
    add_index :artificial_intelligence_games, [:artificial_intelligence_id, :game_id], :name=>"ai_and_game_index"
  end

  def self.down
    drop_table :artificial_intelligence_games
  end
end
