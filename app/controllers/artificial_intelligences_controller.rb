class ArtificialIntelligencesController < InheritedResources::Base
  
  belongs_to :user, :optional => true

  before_filter :authenticate_user!, :only=>[:new, :create]

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def create
    params[:artificial_intelligence][:user_id] = current_user.id

    create!
  end
  
  def destroy
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])
    
    if @artificial_intelligence.belongs_to? current_user
      destroy!
    else
      redirect_to :action=>:index
    end
  end
  
  def edit
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])
    
    if @artificial_intelligence.belongs_to? current_user
      edit!
    else
      redirect_to :action=>:index
    end
  end
  
  def update
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])
    
    if @artificial_intelligence.belongs_to? current_user
      update!
    else
      render :edit
    end
  end

  def ping
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])
    
    @ping = {
      'action' => "ping",
      
      'infos' => '{
  "game_id": "7c7905c6-2423-4a91-b5e7-44ff10cddd5d",
  "current_turn": 0,
  "maximum_number_of_turns": 10,
  "number_of_players": 2,
  "time_limit_per_turn": 5000,
  "directed": false,
  "player_id": 1
}',
      
      'map' => '{
  "types": [
    {"name": "node", "points": 0, "soldiers_per_turn": 0},
    {"name": "city", "points": 1, "soldiers_per_turn": 1}
  ],
    
  "nodes": [
    {"id": 1, "type": "city"},
    {"id": 2, "type": "node"},
    {"id": 3, "type": "node"},
    {"id": 4, "type": "city"},
    {"id": 5, "type": "node"},
    {"id": 6, "type": "node"},
    {"id": 7, "type": "city"},
    {"id": 8, "type": "node"},
    {"id": 9, "type": "city"}
  ],

  "paths": [
    {"from": 1, "to": 2},
    {"from": 2, "to": 3},
    {"from": 3, "to": 4},
    {"from": 4, "to": 5},
    {"from": 5, "to": 6},
    {"from": 6, "to": 7},
    {"from": 7, "to": 8},
    {"from": 8, "to": 9},
    {"from": 9, "to": 1},
    {"from": 3, "to": 6},
    {"from": 7, "to": 2}
  ]
}',
      
      'state' => '[
  {"node_id": 1, "player_id": 1,    "number_of_soldiers": 5},
  {"node_id": 2, "player_id": null,  "number_of_soldiers": 0},
  {"node_id": 3, "player_id": null,  "number_of_soldiers": 0},
  {"node_id": 4, "player_id": null,  "number_of_soldiers": 0},
  {"node_id": 5, "player_id": null,  "number_of_soldiers": 0},
  {"node_id": 6, "player_id": null,  "number_of_soldiers": 0},
  {"node_id": 7, "player_id": null,  "number_of_soldiers": 0},
  {"node_id": 8, "player_id": null,  "number_of_soldiers": 0},
  {"node_id": 9, "player_id": 2,    "number_of_soldiers": 5}
]'
    }
    
    if params[:ping].present?
      @ping.merge!( params[:ping] )
      
      @response = Net::HTTP.post_form(@artificial_intelligence.parsed_url,
        "action" => @ping['action'],
        "infos" => @ping['infos'],
        "map" => @ping['map'],
        "state" => @ping['state']
      ).body
    end
  end

end
