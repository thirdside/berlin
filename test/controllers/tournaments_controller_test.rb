require 'test_helper'

class TournamentsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    sign_in :user, users(:kr155)
  end

  test "creating a tournament assigns it to the current use" do
    post :create, :name => "Test", :artificial_intelligence_ids => artificial_intelligences(:haiku), :format => :json
    json = ActiveSupport::JSON.decode(response.body)
    assert_equal users(:kr155).id, json['user_id']
  end
  
  test "cannot modify a tournament once it has started" do
    tournament = tournaments(:started)
    put :update, :id => tournament.id, :tournament => { :name => "Toto" }
    assert_equal "Started", tournament.reload.name
  end
end
