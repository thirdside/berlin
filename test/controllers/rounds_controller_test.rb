require 'test_helper'

class RoundsControllerTest < ActionController::TestCase
  test ":create returns an error if the number of AI doesn't match the map" do
    basic_auth

    rounds_params = {
      :map => maps(:two_or_three_players),
      :players_per_game => 4
    }

    assert_no_difference 'Round.count' do
      post :create, :tournament_id => tournaments(:started).id, :round => rounds_params, :format => :json
    end

    assert_response :unprocessable_entity
  end
end
