class AddOrganisationToUsersAndTournaments < ActiveRecord::Migration
  def change
    add_column :users, :organisation_id, :integer, :default => nil
    add_column :tournaments, :organisation_id, :integer, :default => nil
  end
end
