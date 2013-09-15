class MapSerializer < ActiveModel::Serializer
  attributes :id, :name, :representation

  def representation
    ActiveSupport::JSON.decode object.json
  end
end
