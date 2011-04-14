require 'test_helper'

class GameTest < ActiveSupport::TestCase
  # called before every single test
  def setup
    map = Map.order('RAND()').first
    ais = ArtificialIntelligence.order('RAND()').limit(2)
    
    map.init( ais )

    @game = Game.new
    @game.map = map
  end

  # called after every single test
  def teardown
    @map = nil
    @ais = nil
  end

  test "Game should contain a map" do
    assert @game.map.present?
  end

  test "Soldiers should be added to a node" do
    node = Node.find(1)
    army = node.number_of_soldiers

    node.add_soldiers node.owner, 2

    assert army + 2 == node.number_of_soldiers
  end

  test "Snapshot should produce a complete snapshot of the game" do
    snapshot = @game.snapshot

    assert @game.uuid = snapshot['info']['game_id']
    assert
  end
end