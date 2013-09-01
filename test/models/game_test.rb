require 'test_helper'

class GameTest < ActiveSupport::TestCase
  test "start_new_game calls init and run on a new Server::Game" do
    Berlin::Server::Game.any_instance.expects(:init)
    Berlin::Server::Game.any_instance.expects(:run)
    
    Game.start_new_game({})
  end
end