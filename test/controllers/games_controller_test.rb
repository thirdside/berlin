require 'test_helper'

class GamesControllerTest < ActionController::TestCase

  setup do
    sign_in :user, users(:kr155)
  end

  test ":create creates a new pending game" do
    params = {
      :map_id => maps(:two_or_three_players).id,
      :artificial_intelligence_ids => [artificial_intelligences(:haiku).id, artificial_intelligences(:nitrous).id]
    }

    assert_difference 'Game.count' do
      post :create, :game => params
    end

    assert_response :redirect
    assert_redirected_to games_path
  end
end
