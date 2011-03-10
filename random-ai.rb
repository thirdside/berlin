require 'rubygems'
require 'sinatra'
require 'json'

post '/' do
  ( {:from=>0, :to=>0, :number_of_soldiers=>0} ).to_json
end
