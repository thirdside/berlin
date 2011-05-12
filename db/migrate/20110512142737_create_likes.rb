class CreateLikes < ActiveRecord::Migration
  def self.up
    create_table :likes do |t|
      t.references :likable, :polymorphic=>true
      t.references :user

      t.timestamps
    end

    add_index :likes, [:user_id, :likable_id, :likable_type], :unique => true

    # add counter cache on games table, which is likable
    add_column :games, :likes_count, :integer, :default=>0
  end

  def self.down
    # remove counter cache on games table, which is likable
    remove_column :games, :likes_count

    drop_table :likes
  end
end
