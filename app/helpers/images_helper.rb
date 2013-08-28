module ImagesHelper
  def icon image, options={}
    image_tag "icons/#{image}.png", { :border => 0 }.merge( options )
  end
end
