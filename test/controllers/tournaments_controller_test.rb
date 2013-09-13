require 'test_helper'

class TournamentsControllerTest < ActionController::TestCase

  setup do
    sign_in :user, users(:kr155)
  end

  test ":create creates a tournament assigns it to the current user" do
    post :create, :tournament => {
      :name => "Test",
      :artificial_intelligence_ids => [artificial_intelligences(:haiku).id, artificial_intelligences(:nitrous).id]
    }, :format => :json
    json = ActiveSupport::JSON.decode(response.body)
    assert_equal users(:kr155).id, json['user_id']
  end

  test ":update cannot modify a tournament once it has started" do
    tournament = tournaments(:started)
    put :update, :id => tournament.id, :tournament => { :name => "Toto" }
    assert_equal "Started", tournament.reload.name
  end

  test ":artificial_intelligence_games returns only those for finished games" do
    tournament = tournaments(:started)
    get :artificial_intelligence_games, :id => tournament.id, :format => :json
    expected = [
      artificial_intelligence_games(:finished_haiku).id,
      artificial_intelligence_games(:finished_berlino).id,
      artificial_intelligence_games(:finished_nitrous).id,
    ].sort
    assert_equal expected, ActiveSupport::JSON.decode(response.body)['artificial_intelligence_games'].map{|a| a['id']}.sort
  end

  test ":artificial_intelligence_games returns the names of the ais" do
    tournament = tournaments(:started)
    get :artificial_intelligence_games, :id => tournament.id, :format => :json

    assert_equal [
      'Haiku',
      'Berlino',
      'Nitrous',
    ].sort, ActiveSupport::JSON.decode(response.body)['artificial_intelligence_games'].map{|a| a['name']}.sort
  end
end
