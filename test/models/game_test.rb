require 'test_helper'

class GameTest < ActiveSupport::TestCase
  test "#queue_game creates a game and queues it" do
    params = {
      :map_id => maps(:two_or_three_players).id,
      :artificial_intelligence_ids => [artificial_intelligences(:haiku).id, artificial_intelligences(:nitrous).id]
    }

    Delayed::Job.expects(:enqueue)
    assert_difference 'Game.count' do
      Game.queue_game(users(:kr155), params)
    end
  end
end
