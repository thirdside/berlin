class DocController < ApplicationController
  def index
    @doc = I18n.t :doc
  end
  
  def tutorial
    
  end
end
