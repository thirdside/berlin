class CreateAchievements < ActiveRecord::Migration
  def self.up
    create_table :achievements do |t|
      t.references :achievable, :polymorphic=>true
      t.string :type

      t.timestamps
    end

    add_index :achievements, [:achievable_id, :achievable_type]
  end

  def self.down
    drop_table :achievements
  end
end
