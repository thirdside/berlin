require 'test_helper'

class ArtificialIntelligencesControllerTest < ActionController::TestCase
  setup do
    @artificial_intelligence = artificial_intelligences(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:artificial_intelligences)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create artificial_intelligence" do
    assert_difference('ArtificialIntelligence.count') do
      post :create, :artificial_intelligence => @artificial_intelligence.attributes
    end

    assert_redirected_to artificial_intelligence_path(assigns(:artificial_intelligence))
  end

  test "should show artificial_intelligence" do
    get :show, :id => @artificial_intelligence.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @artificial_intelligence.to_param
    assert_response :success
  end

  test "should update artificial_intelligence" do
    put :update, :id => @artificial_intelligence.to_param, :artificial_intelligence => @artificial_intelligence.attributes
    assert_redirected_to artificial_intelligence_path(assigns(:artificial_intelligence))
  end

  test "should destroy artificial_intelligence" do
    assert_difference('ArtificialIntelligence.count', -1) do
      delete :destroy, :id => @artificial_intelligence.to_param
    end

    assert_redirected_to artificial_intelligences_path
  end
end
