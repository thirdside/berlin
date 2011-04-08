class MapsController < InheritedResources::Base

  include Pageable

  def show
    @map = Map.find(params[:id])

    respond_to do |format|
      format.json { render :json => @map.json }
    end
  end
end
