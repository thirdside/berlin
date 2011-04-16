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
    rep = nil

    begin
      map = Map.find(params[:game][:map_id])
      ais = ArtificialIntelligence.find(params[:game][:artificial_intelligence_ids])

      case BERLIN_SERVER[:protocol]
        when 'http'
          # Format : /fight?map_id=X&ai_ids[]=Y&ai_ids[]=Z
          url  = BERLIN_SERVER[:url].dup
          url += "?#{BERLIN_SERVER[:params][:map]}=#{map.id}"
          url += ais.map{ |ai| "&#{BERLIN_SERVER[:params][:ais]}[]=#{ai.id}" }.join
          rep = Net::HTTP.get_response( URI.parse( url ) )
      end
    rescue Exception => e
      redirect_to( new_game_path, :alert=>e.inspect ) and return
    end

    case rep
      when Net::HTTPSuccess
        redirect_to games_path, :notice=>I18n.t('games.success')
      else
        case rep
          when Net::HTTPForbidden
            err = I18n.t('games.problem')
          else
            err = I18n.t('games.failure')
        end

        redirect_to new_game_path, :alert=>err
    end
  end
end
