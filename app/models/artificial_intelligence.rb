class ArtificialIntelligence < ActiveRecord::Base

  LANGUAGES = %w(Ruby PHP Python C/C++ Lua JavaScript C# Go Java Other)

  include Awardable

  belongs_to :user, :counter_cache=>true
  
  has_many :timeouts, :class_name=> "ArtificialIntelligenceTimeout", :dependent=>:destroy
  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :games, :through=>:artificial_intelligence_games

  scope :ordered, :order=>"artificial_intelligences.name"

  validates :name, :presence=>true, :uniqueness=>true, :length => { :minimum => 1 }
  validates :url, :presence=>true, :format => { :with => /^(http|https):\/\// }
  validates :language, :presence=>true, :inclusion=>LANGUAGES

  def score
    self.artificial_intelligence_games.map(&:score).to_stat.average
  end

  def won_games
    self.artificial_intelligence_games.winners.count
  end

  def ping
    Net::HTTP.post_form(URI.parse( self.url ),
        "action" => "ping",
        "infos" => {
          "game_id" => "7c7905c6-2423-4a91-b5e7-44ff10cddd5d",
          "current_turn" => nil,
          "maximum_number_of_turns" => 10,
          "number_of_players" => 2,
          "time_limit_per_turn" => 5000,
          "directed" => false,
          "player_id" => 1
        }.to_json,

        "map" => {
          "types" => [
            {"name" => "node", "points" => 0, "soldiers_per_turn" => 0},
            {"name" => "city", "points" => 1, "soldiers_per_turn" => 1}
          ],
          
          "nodes" => [
            {"id" => 1, "type" => "city"},
            {"id" => 2, "type" => "node"},
            {"id" => 3, "type" => "node"},
            {"id" => 4, "type" => "city"}
          ],
      
          "paths" => [
            {"from" => 1, "to" => 2},
            {"from" => 2, "to" => 3},
            {"from" => 3, "to" => 4},
            {"from" => 1, "to" => 3},
            {"from" => 1, "to" => 4},
            {"from" => 2, "to" => 4}
          ]
        }.to_json,

        "state" => [
          {"node_id" => 1, "player_id" => 1,    "number_of_soldiers" => 16},
          {"node_id" => 2, "player_id" => nil,  "number_of_soldiers" => 0},
          {"node_id" => 3, "player_id" => nil,  "number_of_soldiers" => 0},
          {"node_id" => 4, "player_id" => 2,    "number_of_soldiers" => 16}
        ].to_json).body
  end
end
