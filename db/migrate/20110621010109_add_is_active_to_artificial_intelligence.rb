class AddIsActiveToArtificialIntelligence < ActiveRecord::Migration
  def self.up
    add_column :artificial_intelligences, :is_active, :boolean, :default => false
  end

  def self.down
    remove_column :artificial_intelligences, :is_active
  end
end
