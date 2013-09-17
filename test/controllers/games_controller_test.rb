require 'test_helper'

class GamesControllerTest < ActionController::TestCase

  setup do
    sign_in :user, users(:kr155)
  end

  test ":create creates a new pending game" do
    assert_difference 'Game.count' do
      post :create, :game => game_params
    end

    assert_response :redirect
    assert_redirected_to games_path
  end

  test ":create using a mismatching number of AIs and map returns an error" do
    params = game_params
    params[:artificial_intelligence_ids].push(artificial_intelligences(:leaf).id, artificial_intelligences(:berlino).id)

    assert_no_difference 'Game.count' do
      post :create, :game => params, :format => :json
    end

    assert_response :unprocessable_entity
  end

  test ":show over json returns the map_id and the map" do
    get :show, :id => games(:finished).id, :format => :json
    game = ActiveSupport::JSON.decode(response.body)['game']

    assert_equal ['id', 'number_of_turns', 'time_start', 'time_end', 'created_at', 'map_id', 'map',
              'updated_at', 'round_id', 'status', 'last_error', 'is_practice', 'replay'].sort, game.keys.sort
  end

  protected

  def game_params
    {
      :map_id => maps(:two_or_three_players).id,
      :artificial_intelligence_ids => [artificial_intelligences(:haiku).id, artificial_intelligences(:nitrous).id]
    }
  end
end
