require 'test_helper'

class RoundTest < ActiveSupport::TestCase
  test "creating a round queues games to be played" do
    tournament = tournaments(:started)
    Delayed::Job.expects(:enqueue).times(6)
    assert_difference 'Game.count', +6 do
      Round.create(:map => maps(:two_or_three_players), :players_per_game => 2) do |r|
        r.tournament = tournament
      end
    end
  end
end
