class ArtificialIntelligencesController < ApplicationController
  inherit_resources
  respond_to :html
  respond_to :json, :only => [:create, :update, :show, :index]
  belongs_to :user, :optional => true

  before_filter :authenticate_user!, :only => [:new, :create]
  before_filter :ensure_can_edit, :only => [:edit, :update, :destroy]

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def show
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])

    @official_games = @artificial_intelligence.games.officials.recent.includes(:map, :winners)
    @practice_games = @artificial_intelligence.games.practices.recent.includes(:map, :winners)
  end

  def create
    if (user_id = params[:user_id])
      owner = User.find_by_id!(user_id)
      unless owner == current_user || owner.organisation.try(:user) == current_user
        return cannot_edit_resource
      end
    else
      owner = current_user
    end

    params[:artificial_intelligence][:user_id] = owner.id

    create!
  end

  def ping
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])

    @ping = Ping::DEFAULT

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
