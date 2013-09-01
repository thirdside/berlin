require 'test_helper'

class Berlin::Server::GameTest < ActiveSupport::TestCase
  test "end_of_game calls send_game_over and complete_game" do
    Berlin::Server::Game.any_instance.expects(:send_game_over)
    Berlin::Server::Game.any_instance.expects(:complete_game)

    Berlin::Server::Game.new.end_of_game
  end
end