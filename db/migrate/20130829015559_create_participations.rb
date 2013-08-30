class CreateParticipations < ActiveRecord::Migration
  def change
    create_table :participations do |t|
      t.references :tournament
      t.references :artificial_intelligence
      t.float :rating

      t.timestamps
    end

    add_index :participations, [:tournament_id, :artificial_intelligence_id],
      :unique => true, :name => :index_participations_on_tournament_and_artificial_intelligence
  end
end
