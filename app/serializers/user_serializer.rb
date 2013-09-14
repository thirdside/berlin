class UserSerializer < ActiveModel::Serializer
  attributes :id, :username, :organisation_id
  has_many :artificial_intelligences
end
