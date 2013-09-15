require 'test_helper'

class GameTest < ActiveSupport::TestCase
  test "#queue_game creates a game and queues it" do
    params = {
      :map_id => maps(:two_or_three_players).id,
      :artificial_intelligence_ids => [artificial_intelligences(:haiku).id, artificial_intelligences(:nitrous).id]
    }

    Delayed::Job.expects(:enqueue)
    assert_difference 'Game.count' do
      game = Game.queue_game(users(:kr155), params)
      assert_equal 2, game.artificial_intelligences.count
    end
  end

  test "#queue_game throws ArtificialIntelligenceCountMismatch if map doesn't support number of AIs" do
    ids = [:haiku, :nitrous, :berlino, :leaf].map{ |s| artificial_intelligences(s).id }
    assert_raises Game::ArtificialIntelligenceCountMismatch do
      Game.queue_game(nil, :artificial_intelligence_ids => ids, :map_id => maps(:two_or_three_players).id)
    end
  end
end
