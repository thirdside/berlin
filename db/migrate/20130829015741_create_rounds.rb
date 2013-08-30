class CreateRounds < ActiveRecord::Migration
  def change
    create_table :rounds do |t|
      t.references :tournament
      t.references :map
      t.integer :players_per_game

      t.timestamps
    end
  end
end
