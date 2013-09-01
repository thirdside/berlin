class ArtificialIntelligencesController < ApplicationController
  inherit_resources

  belongs_to :user, :optional => true

  before_filter :authenticate_user!, :only => [:new, :create]

  include Pageable

  has_scope :order, :default => "artificial_intelligences.id DESC"

  def show
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])
  end

  def create
    params[:artificial_intelligence][:user_id] = current_user.id

    create!
  end

  def destroy
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])

    if @artificial_intelligence.belongs_to? current_user
      destroy!
    else
      redirect_to :action => :index
    end
  end

  def edit
    @artificial_intelligence = ArtificialIntelligence.find(params[:id])

    if @artificial_intelligence.belongs_to? current_user
      edit!
    else
      redirect_to :action => :index
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
