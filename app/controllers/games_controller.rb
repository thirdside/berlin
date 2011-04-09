require 'net/http'
require 'uri'

class GamesController < InheritedResources::Base

  before_filter :authenticate_user!, :only=>[:new, :create]

  include Pageable

  has_scope :order, :default => "games.id DESC"
  
  def show
    @game = Game.find(params[:id])

    respond_to do |format|
      format.html
      format.json { render :json => @game.json }
    end
  end

  def new
    if params[:artificial_intelligence_id]
      if ArtificialIntelligence.exists?( params[:artificial_intelligence_id] )
         @selected_ai = ArtificialIntelligence.find( params[:artificial_intelligence_id] )
      end
    end

    new!
  end

  def create
    map = Map.find(params[:game][:map_id])
    ais = ArtificialIntelligence.find(params[:game][:artificial_intelligence_ids])
    rep = nil
    msg = nil
    err = nil

    begin
      case BERLIN_SERVER[:protocol]
        when 'http'
          # Format : /fight?map_id=X&ais_id[]=Y&ais_id[]=Z
          url  = BERLIN_SERVER[:url].dup
          url += "?#{BERLIN_SERVER[:params][:map]}=#{map.id}"
          url += ais.map{ |ai| "&#{BERLIN_SERVER[:params][:ais]}[]=#{ai.id}" }.join
          rep = Net::HTTP.get_response( URI.parse( url ) )
      end
    rescue Exception => e
      rep = e.inspect
    end

    case rep
      when Net::HTTPSuccess
        msg = I18n.t('games.success')
      when Net::HTTPForbidden
        err = I18n.t('games.failure')
      else
        err = rep.inspect
    end

    redirect_to games_path, :notice=>msg, :alert=>err
  end
end
