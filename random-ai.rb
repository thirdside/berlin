require 'rubygems'
require 'sinatra'
require 'yajl/json_gem'

get '/ready' do
  "ready!"
end

post '/onturn' do
  game = params[:game]
  turn = params[:turn]
  json = JSON.parse( params[:json] )

  ( {:from=>0, :to=>0, :number_of_soldiers=>0} ).to_json
end
