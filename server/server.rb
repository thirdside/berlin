require 'rubygems'
require 'typhoeus'
require 'yajl/json_gem'
require 'active_record'
require 'uuidtools'

# options
options = Hash[*ARGV]

# config
default_env = ENV['RAILS_ENV'] ? ENV['RAILS_ENV'] : 'development'
environment = options['-e'] ? options['-e'] : default_env
config_path = File.expand_path( File.dirname( __FILE__ ) ) + "/../config/database.yml"
config_yaml = YAML::load( File.open( config_path ) )

# db connexion
ActiveRecord::Base.establish_connection( config_yaml[ environment ] )

# models
%w( game map node_type node artificial_intelligence artificial_intelligence_game ).each do |model|
  require File.expand_path( File.dirname( __FILE__ ) ) + "/../app/models/#{model}"
end

map = Map.first
map.init( ArtificialIntelligence.find(:all, :limit=>2) )

game = Game.new
game.map = map
game.run
