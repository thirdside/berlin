class RoundsController < ApplicationController
  inherit_resources
  extend RescueFromMismatch

  respond_to :html
  respond_to :json, :only => [:create]

  actions :index, :show, :new, :create
  belongs_to :tournament

  def create
    create! { |success, failure|
      success.html{ redirect_to resource.tournament }
    }
  end
end
