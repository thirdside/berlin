class CreateAchievements < ActiveRecord::Migration
  def self.up
    create_table :achievements do |t|
      t.string :type
      t.string :internal_code
      t.integer :condition_1
      t.integer :condition_2
      t.integer :condition_3

      t.timestamps
    end
  end

  def self.down
    drop_table :achievements
  end
end
