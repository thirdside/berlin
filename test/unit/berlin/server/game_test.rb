require 'test_helper'

class Berlin::Server::GameTest < ActiveSupport::TestCase
  test "#end_of_game calls send_game_over and complete_game" do
    Berlin::Server::Game.any_instance.expects(:send_game_over)
    Berlin::Server::Game.any_instance.expects(:complete_game)

    three_player_game.end_of_game
  end

  test "#expected_score returns the elo-version expected score" do
    game = three_player_game

    ai_1 = stub(:rating => 1900)
    ai_2 = stub(:rating => 1500)

    assert_equal 0.91, game.expected_score(ai_1, ai_2)
    assert_equal 0.09, game.expected_score(ai_2, ai_1)
  end

  test "#ranking returns a hash of scores/winners" do
    game = three_player_game
    game.map.nodes[0..2].each do |node|
      node.owner = 0
    end
    game.map.nodes.last.owner = 1

    assert_equal({
      1=>{:score=>0.25, :winner=>false},
      0=>{:score=>0.75, :winner=>true},
      2=>{:score=>0.0, :winner=>false}
    }, game.ranking)
  end

  test "#calculate_new_ratings sets new ratings for participations" do
    game = three_player_game
    game.stubs(:ranking => {
      0 => {:score => 0.8, :winner => true},
      1 => {:score => 0.2},
      2 => {:score => 0}
    })

    game.calculate_new_ratings

    scores = [
      1500,
      (1500 + (0.8 - 0.5 + 0.8 - 0.5) * 32).round(2),
      (1500 + (0.2 - 0.5 + 0.2 - 0.5) * 32).round(2),
      (1500 + (0.0 - 0.5 + 0.0 - 0.5) * 32).round(2)
    ].map(&:to_i)
    assert_equal scores.sort, rounds(:started).tournament.participations.map(&:rating).sort
  end

  protected

  def three_player_game
    game = Berlin::Server::Game.find(games(:pending).id)
  end
end
