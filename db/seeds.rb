# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)

DIR = File.expand_path( File.dirname( __FILE__ ) )

Map.create(:name=>"DefaultMap", :version=>1, :json=>File.open( DIR + '/../public/maps/1.map' ).readlines.join)

ArtificialIntelligence.create(:user_id=>1, :name=>"AI1", :language=>'Java', :version=>1, :url_ready=>"http://localhost:4567/ready", :url_on_turn=>"http://localhost:4567/onturn")
ArtificialIntelligence.create(:user_id=>1, :name=>"AI2", :language=>'PHP', :version=>1, :url_ready=>"http://localhost:4568/ready", :url_on_turn=>"http://localhost:4568/onturn")