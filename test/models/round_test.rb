require 'test_helper'

class RoundTest < ActiveSupport::TestCase
  test "creating a round queues games to be played" do
    tournament = tournaments(:started)

    Game.expects(:delay).returns(stub(:start_new_game => true)).times(6)
    Round.create(:map => maps(:two_or_three_players), :players_per_game => 2) do |r|
      r.tournament = tournament
    end
  end
end
