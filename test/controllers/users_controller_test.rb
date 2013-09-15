require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  test ":create creates a user using json" do
    basic_auth
    post :create, :user => user_params, :format => :json

    assert_response :created

    user = ActiveSupport::JSON.decode(response.body)['user']

    assert_equal "Toto", user['username']
    assert_equal [], user['artificial_intelligences']
  end

  test ":create creates a user with an organisation using json" do
    basic_auth
    thirdside = organisations(:thirdside)
    post :create, :organisation_id => thirdside.id, :user => user_params, :format => :json

    assert_response :created
    user = ActiveSupport::JSON.decode(response.body)['user']

    assert_equal "Toto", user['username']
    assert_equal thirdside.id, user['organisation_id']
  end

  test ":update with an organisation using json" do
    basic_auth
    user = users(:organisation_user)
    patch :update, :id => user.id, :user => {:username => "Petate"}, :format => :json
    assert_response :no_content
    assert "Petate", user.reload.username
  end

  protected
  def user_params
    {:username => "Toto", :email => "email@toto.com", :password => "totototo"}
  end
end
