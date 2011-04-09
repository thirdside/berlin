class MapsController < InheritedResources::Base

  respond_to :html
  respond_to :json, :only=>:show

  include Pageable
end
