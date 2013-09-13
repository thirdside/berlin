require 'test_helper'

class ArtificialIntelligencesControllerTest < ActionController::TestCase

  test ":create allows creating AIs using json" do
    basic_auth
    params = {:name => 'Pro AI', :language => "Ruby", :url => "http://github.com", :is_active => true}
    post :create, :artificial_intelligence => params, :format => :json
    assert_response :created

    ai = ActiveSupport::JSON.decode(response.body)['artificial_intelligence']
    assert_equal ai['name'], 'Pro AI'
  end
end
