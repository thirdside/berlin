require 'rubygems'
require 'typhoeus'
require 'yajl/json_gem'
require 'active_record'

# config
# TODO check if we can import rails config, so we don't have to redeclare everything here
ActiveRecord::Base.establish_connection(
  :adapter=> 'mysql',
  :database=> 'berlin_development',
  :username=> 'root',
  :password=> 'password',
  :pool=> 5,
  :timeout=> 5000)

# models
%w( game map node_type node game artificial_intelligence artificial_intelligence_game ).each do |model|
  require File.expand_path( File.dirname( __FILE__ ) ) + "/../app/models/#{model}"
end

ais = ArtificialIntelligence.all * 3

map = Map.first
map.init( ais )

game = Game.new
game.map = map
game.run
