module RescueFromMismatch
  def self.extended(base)
    base.rescue_from Game::ArtificialIntelligenceCountMismatch do |e|
      respond_to do |format|
        format.json { render :text => e.message, :status => :unprocessable_entity }
        format.html { redirect_to :action => :new, :notice => e.message }
      end
    end
  end
end
