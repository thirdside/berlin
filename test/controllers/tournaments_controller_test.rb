require 'test_helper'

class TournamentsControllerTest < ActionController::TestCase
  test ":create creates a tournament assigns it to the current user" do
    sign_in :user, users(:kr155)

    post :create, :tournament => tournament_params, :format => :json
    assert_response :created

    json = ActiveSupport::JSON.decode(response.body)['tournament']
    assert_equal users(:kr155).id, json['user_id']
    assert_equal 'Test', json['name']
  end

  test ":update cannot modify a tournament once it has started" do
    sign_in :user, users(:kr155)

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

  test ":create tournament with organisation" do
    basic_auth

    thirdside = organisations(:thirdside)

    post :create, :organisation_id => thirdside.id, :tournament => tournament_params, :format => :json
    assert_response :created
    tournament = ActiveSupport::JSON.decode(response.body)['tournament']
    assert 'Test', tournament['name']
    assert thirdside.id, tournament['organisation_id']
    assert users(:organisation_user).id, tournament['user_id']
  end

  protected
  def tournament_params
    {
      :name => "Test",
      :artificial_intelligence_ids => [artificial_intelligences(:haiku).id, artificial_intelligences(:nitrous).id]
    }
  end
end
