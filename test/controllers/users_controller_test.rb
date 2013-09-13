require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  test ":create creates a user using json" do
    basic_auth
    post :create, :user => {:username => "Toto", :email => "email@toto.com", :password => "totototo"}, :format => :json

    assert_response :created

    user = ActiveSupport::JSON.decode(response.body)['user']

    assert_equal "Toto", user['username']
    assert_equal [], user['artificial_intelligences']
  end
end
