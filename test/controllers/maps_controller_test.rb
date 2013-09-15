require 'test_helper'

class MapsControllerTest < ActionController::TestCase

  test ":show allows json" do
    get :show, :id => maps(:one).id, :format => :json
    assert_response :ok
  end
end
