require 'test_helper'

class RoundsControllerTest < ActionController::TestCase
  test ":create returns an error if the number of AI doesn't match the map" do
    basic_auth

    rounds_params = {
      :map_id => maps(:two_or_three_players).id,
      :players_per_game => 4
    }

    assert_no_difference 'Round.count' do
      post :create, :tournament_id => tournaments(:organisation).id, :round => rounds_params, :format => :json
    end

    assert_response :unprocessable_entity
  end

  test ":create using the API fails with wrong user" do
    basic_auth
    rounds_params = {
      :map_id => maps(:two_or_three_players).id,
      :players_per_game => 2
    }

    assert_no_difference 'Round.count' do
      post :create, :tournament_id => tournaments(:started).id, :round => rounds_params, :format => :json
    end

    assert_response :unauthorized
  end

  test ":create using the API with correct user" do
    basic_auth
    rounds_params = {
      :map_id => maps(:two_or_three_players).id,
      :players_per_game => 2
    }

    assert_difference 'Round.count' do
      post :create, :tournament_id => tournaments(:organisation).id, :round => rounds_params, :format => :json
    end

    assert_response :created
  end
end
