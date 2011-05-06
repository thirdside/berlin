module Berlin
  module Server
    class Node

      attr_accessor :id, :type, :adjacents, :owner, :map

      def self.parse map, json
        json = JSON.parse( json ) if json.is_a? String

        id    = json['id']
        type  = json['type']

        new map, id, type
      end

      def initialize map, id, type = nil
        @map        = map
        @id         = id.to_i
        @type       = map.find_node_type type.to_s
        @owner      = nil
        @armies     = Hash.new{ |h,k| h[k] = 0 }
        @adjacents  = []
      end

      def add_soldiers player_id, number_of_soldiers
        @armies[player_id] += number_of_soldiers
      end

      def remove_soldiers player_id, number_of_soldiers
        add_soldiers player_id, number_of_soldiers * -1
      end

      def number_of_soldiers
        @armies[@owner]
      end

      def number_of_soldiers_for player_id
        @armies[player_id]
      end

      def to_hash
        {:id=>@id, :type=>@type.name}
      end

      def state
        {:node_id=>@id, :player_id=>@owner, :number_of_soldiers=>number_of_soldiers}
      end

      def adjacent? node
        @adjacents.include? node
      end

      def owned?
        !!@owner
      end

      def armies
        @armies.select{ |player_id, number_of_soldiers| number_of_soldiers > 0 }
      end

      def occupied?
        !armies.count.zero?
      end

      def points
        @type.points
      end

      def combat?
        armies.count > 1
      end

      def spawn!
        if owned?
          add_soldiers @owner, @type.soldiers_per_turn
        end
      end

      def fight!
        while combat?
          casualties = armies.values.min

          armies.keys.each do |player_id|
            remove_soldiers player_id, casualties
          end
        end

        if occupied?
          @owner = armies.keys.first
        end
      end
    end
  end
end