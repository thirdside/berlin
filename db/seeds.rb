# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)

DIR = File.expand_path( File.dirname( __FILE__ ) )

Map.create(:name => "DefaultMap1", :version => 1, :json => File.open( DIR + '/../public/maps/1.map' ).readlines.join)
Map.create(:name => "DefaultMap2", :version => 1, :json => File.open( DIR + '/../public/maps/2.map' ).readlines.join)

user = User.create(:username => "admin", :locale => "fr", :email => "admin@berlin.net", :password => "12345678", :password_confirmation => "12345678")
user.is_admin = true
user.save

ArtificialIntelligence.create(:user_id => 1, :name => "AI1", :language => 'Java', :url => "http://localhost:4567/")
ArtificialIntelligence.create(:user_id => 1, :name => "AI2", :language => 'PHP', :url => "http://localhost:4568/")

GamesPlayedAchievement.create({:condition_1 => 1, :internal_code => 'pre_newb'}, :without_protection => true)
GamesPlayedAchievement.create({:condition_1 => 10, :internal_code => 'newb'}, :without_protection => true)
GamesPlayedAchievement.create({:condition_1 => 25, :internal_code => 'post_newb'}, :without_protection => true)

VictoriesAchievement.create({:condition_1 => 1, :internal_code => 'first_victory'}, :without_protection => true)
VictoriesAchievement.create({:condition_1 => 10, :internal_code => 'young_wolf'}, :without_protection => true)
VictoriesAchievement.create({:condition_1 => 25, :internal_code => 'not_bad'}, :without_protection => true)
