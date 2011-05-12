class LikesController < ApplicationController
  def create
    @like = Like.new(params[:like])
    @like.user = current_user
    @like.save

    redirect_to :back
  end
end