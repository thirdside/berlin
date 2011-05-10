class CreateArtificialIntelligenceTimeouts < ActiveRecord::Migration
  def self.up
    create_table :artificial_intelligence_timeouts do |t|
      t.references :artificial_intelligence

      t.timestamps
    end
  end

  def self.down
    drop_table :artificial_intelligence_timeouts
  end
end
