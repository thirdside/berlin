module LinksHelper
  def link_to_show model
    link_to icon('magnifier'), model
  end
  
  def link_to_edit model
    link_to icon('magnifier'), model
  end
  
  def link_to_delete model
    link_to icon('magnifier'), model, :method=>:delete
  end
end
