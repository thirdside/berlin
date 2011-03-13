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
  
  [
    {:from=>1, :to=>2, :number_of_soldiers=>1},
    {:from=>2, :to=>1, :number_of_soldiers=>1}
  ].to_json
end
