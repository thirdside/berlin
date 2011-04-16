require 'yajl/json_gem'

%w( map move node node_type path game artificial_intelligence ).each do |file|
  require File.expand_path( File.dirname( __FILE__ ) ) + "/../#{file}"
end

# GAME
describe Game, "#map=" do
  it "should set the map for the game" do
    map = Map.new
    game = Game.new
    game.map = map
    game.map.should == map
  end
end

describe Game, "#ais<<" do
  it "should register an ai for the game" do
    ai = ArtificialIntelligence.new
    game = Game.new
    game.ais << ai
    game.ais.should == [ai] 
  end
end

describe Game, "#next_turn" do
  it "should advance to the next turn" do
    game = Game.new
    game.turn.should == 0
    game.next_turn
    game.turn.should == 1
  end
end

describe Game, "#register_move" do
  it "should register a valid move for a given player" do
    game = Game.new
    ai = ArtificialIntelligence.new
    ai.id = 1
    map = Map.new
    node = Node.new 1
    move = Move.new 1, 1, 10
    map.nodes << node
    game.ais << ai

    game.register_move ai, move
    game.moves[0][1].should == []
    node.adjacents << node
    game.register_move ai, move
    game.moves[0][1].should == [move]
    game.next_turn
    game.moves[1][1].should == []
    game.register_move ai, move
    game.moves[1][1].should == [move]
  end
end

# MAP
describe Map, "#nodes<<" do
  it "should register a node" do
    map = Map.new
    node = Node.new 1
    map.nodes << node
    map.nodes.should == [node]
    map.nodes << node
    map.nodes.should == [node, node]
  end
end

describe Map, "#paths<<" do
  it "should register a path" do
    map = Map.new
    path = Path.new nil, nil
    map.paths << path
    map.paths.should == [path]
    map.paths << path
    map.paths.should == [path, path]
  end
end

# PATH
describe Path, "#parse" do
  it "returns a Path as parsed from the json map" do    
    path = Path.parse( '{"from": 0, "to": 0}' )

    path.from.should == nil
    path.to.should == nil

    node1 = Node.new 1
    node2 = Node.new 2

    path = Path.parse( '{"from": 1, "to": 2}' )

    path.from.should == node1
    path.to.should == node2
  end
end

# NODE TYPE
describe NodeType, "#parse" do
  it "returns a NodeType as parsed from the json map" do
    type = NodeType.parse( '{"name": "TestNode", "points": 1, "soldiers_per_turn": 10}' )

    type.name.should == "TestNode"
    type.points.should == 1
    type.soldiers_per_turn.should == 10

    type = NodeType.parse( '{"name": 0, "points": "test", "soldiers_per_turn": "hello"}' )

    type.name.should == "0"
    type.points.should == 0
    type.soldiers_per_turn.should == 0
  end
end

# NODE
describe Node, "#adjacents<<" do
  it "should register an adjacent node" do
    node1 = Node.new 1
    node2 = Node.new 2

    node1.adjacents << node2
    node1.adjacents.should == [node2]
  end
end

# MOVE
describe Move, "#parse" do
  it "returns a Move as parsed from a user provided JSON" do
    node1 = Node.new 1
    node2 = Node.new 2

    move = Move.parse( '{"from": 1, "to": 2, "number_of_soldiers": 10}' )
    
    move.from.should == node1
    move.to.should == node2
    move.number_of_soldiers.should == 10

    move = Move.parse( '{"from": 3, "to": "bonjour", "number_of_soldiers": "salut"}' )
    
    move.from.should == nil
    move.to.should == nil
    move.number_of_soldiers.should == 0
  end
end

describe Move, "#to_json" do
  it "returns a json formatted move" do
    move = Move.new 1, 2, 10
    move.to_json.should == {:from=>1, :to=>2, :number_of_soldiers=>10}
  end
end

describe Move, "#valid?" do
  it "returns true if Move is valid, i.e. nodes are adjacent and AI has enough soldiers" do
    move = Move.new 1, 2, 10

    # Nodes don't exist
    move.valid?.should == false

    node1 = Node.new 1
    node2 = Node.new 2

    move = Move.new 1, 2, 10

    # Nodes aren't adjacent
    move.valid?.should == false

    node1.adjacents << node2

    move.valid?.should == true
  end
end
