class CreateAwards < ActiveRecord::Migration
  def self.up
    create_table :awards do |t|
      t.references :awardable, :polymorphic=>true
      t.references :achievement

      t.timestamps
    end

    add_index :awards, [:awardable_id, :awardable_type]
    add_index :awards, :achievement_id
  end

  def self.down
    drop_table :awards
  end
end
