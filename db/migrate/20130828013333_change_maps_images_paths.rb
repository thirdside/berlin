class ChangeMapsImagesPaths < ActiveRecord::Migration
  def up
    Map.find_each do |map|
      map.json = map.json.gsub(/\/images/, "/assets")
      map.save
    end
  end

  def down
  end
end
