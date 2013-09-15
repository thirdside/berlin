class UsersController < ApplicationController
  inherit_resources
  belongs_to :organisation, :optional => true

  respond_to :html
  respond_to :json, :only => [:create, :update, :show, :index]

  include Pageable

  has_scope :order, :default => "users.username"

  before_filter :ensure_can_edit, :only => [:edit, :destroy, :update]


  def artificial_intelligences
    @user = User.find(params[:id])

    @artificial_intelligences = @user.artificial_intelligences.ordered
  end

  def games
    @user = User.find(params[:id])
    
    @games = @user.games.ordered
  end
end
