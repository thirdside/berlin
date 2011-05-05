module Berlin
  module Server
    class Map < Map
      after_initialize :build

      attr_reader :nodes, :paths, :maximum_number_of_turns, :number_of_players, :time_limit_per_turn

      def build
        @nodes = []
        @paths = []
        @types = {}

        # parse json to get extra variables
        parsed = JSON.parse( self.json )

        # parsed from json
        @maximum_number_of_turns  = parsed['infos']['maximum_number_of_turns']  || 100
        @number_of_players        = parsed['infos']['number_of_players']        || []
        @time_limit_per_turn      = parsed['infos']['time_limit_per_turn']      || 1000
        @directed                 = parsed['infos']['directed']                 || false
        @setup                    = parsed['setup']

        # get each node types
        parsed['types'].each do |type|
          @types[type['name']] = NodeType.parse( type )
        end

        # build each node
        parsed['nodes'].each do |node|
          @nodes << Node.parse( self, node )
        end

        # build paths
        parsed['paths'].each do |path|
          @paths << Path.parse( path )

          node1 = find_node path['from']
          node2 = find_node path['to']

          if node1 && node2
            node1.adjacents << node2
            
            unless directed?
              node2.adjacents << node1
            end
          end
        end
      end

      # called when players are all registered
      def init players
        @setup[players.size.to_s].each do |player_id, nodes|
          player_id = player_id.to_i
          
          nodes.each do |node|
            find_node( node['node'] ).owner = player_id
            find_node( node['node'] ).add_soldiers player_id, node['number_of_soldiers']
          end
        end
      end

      def states
        @nodes.map(&:state)
      end

      def directed?
        @directed
      end

      def add_node node
        @nodes << node
      end

      def add_path path
        @paths << path
      end

      def number_of_soldiers_for player_id
        @nodes.map{ |node| node.number_of_soldiers_for( player_id ) }.inject(:+) || 0
      end

      def number_of_nodes_for player_id
        @nodes.select{ |node| node.owner == player_id }.size
      end

      def find_node id
        if id.is_a? Node
          @nodes.detect{ |node| node == id }
        else
          @nodes.detect{ |node| node.id == id }
        end
      end

      def find_node_type id
        @types[id]
      end

      def valid_move? move
        node1 = self.find_node move.from
        node2 = self.find_node move.to

        # Nodes exist?
        return false unless node1 && node2

        # Positive number of soldiers to move?
        return false unless move.number_of_soldiers > 0

        # Nodes are adjacent?
        return false unless node1.adjacent? node2

        # Player has enough soldiers on from node?
        return false unless node1.number_of_soldiers_for( move.player_id ) >= move.number_of_soldiers

        true
      end

      def move! move
        node1 = self.find_node move.from
        node2 = self.find_node move.to
        
        # remove soldiers from the from node
        node1.remove_soldiers move.player_id, move.number_of_soldiers
        # add soldiers to the to node
        node2.add_soldiers move.player_id, move.number_of_soldiers
      end
    end
  end
end