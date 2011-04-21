require 'yajl/json_gem'
require 'utilities'

require '../node.rb'
require '../node_type.rb'

describe Node do

  before :each do
    @type = NodeType.new "Castle", 0, 2
    @node = Node.new 1, "Castle"
  end

  describe "#parse" do
    it "returns a newly created Node from json" do
      node = Node.parse('{"id": 1, "type": "Castle"}')
      node.id == 1
      node.type == @type
    end
  end

  describe "#owned?" do
    it "returns true if an owner is set for the given node" do
      @node.owned?.should == false
      @node.owner = 1
      @node.owned?.should == true
    end
  end

  describe "#adjacents<< node" do
    it "should add node as an adjacent one" do
      node = Node.new( 2, "Castle" )
      @node.adjacent?( node ).should == false
      @node.adjacents << node
      @node.adjacent?( node ).should == true
    end
  end

  describe "#number_of_soldiers_for" do
    it "returns the number of soldiers for a given player" do
      @node.number_of_soldiers_for(1).should == 0
    end
  end

  describe "#number_of_soldiers" do
    it "returns the number of soldiers for the owner" do
      @node.add_soldiers 3, 25
      @node.number_of_soldiers.should == 0
      @node.owner = 3
      @node.number_of_soldiers.should == 25
    end
  end

  describe "#add_soldiers" do
    it "should add soldiers for a given player" do
      @node.number_of_soldiers_for(1).should == 0
      @node.add_soldiers 1, 10
      @node.number_of_soldiers_for(1).should == 10
    end
  end

  describe "#remove_soldiers" do
    it "should remove soldiers for a given player" do
      @node.number_of_soldiers_for(1).should == 0
      @node.remove_soldiers 1, 10
      @node.number_of_soldiers_for(1).should == -10
    end
  end

  describe "#spawn!" do
    it "should add node.type.soldiers_per_turn" do
      @node.owner = 1
      @node.number_of_soldiers.should == 0
      @node.spawn!
      @node.number_of_soldiers.should == 2
    end
  end

  describe "#armies" do
    it "returns a hash {:player_id => number_of_soldiers}" do
      @node.armies.should == {}
      @node.add_soldiers 1, 5
      @node.armies.should == {1=>5}
      @node.add_soldiers 2, 10
      @node.armies.should == {1=>5, 2=>10}
      @node.remove_soldiers 2, 10
      @node.armies.should == {1=>5}
    end
  end

  describe "#combat?" do
    it "returns a boolean telling us if there's more than one army on the node" do
      @node.combat?.should == false
      @node.add_soldiers 1, 5
      @node.combat?.should == false
      @node.add_soldiers 2, 5
      @node.combat?.should == true
    end
  end

  describe "#occupied?" do
    it "returns true if there's at least one army on the node" do
      @node.occupied?.should == false
      @node.add_soldiers 1, 10
      @node.occupied?.should == true
      @node.remove_soldiers 1, 10
      @node.occupied?.should == false
    end
  end

  describe "#fight!" do
    it "returns a boolean telling us if there's more than one army on the node" do
      @node.add_soldiers 1, 5
      @node.add_soldiers 2, 6
      @node.owned?.should == false
      @node.combat?.should == true
      @node.fight!
      @node.combat?.should == false
      @node.owned?.should == true
      @node.owner.should == 2
    end
  end

end