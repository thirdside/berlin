class UserSerializer < ActiveModel::Serializer
  attributes :id, :username
  has_many :artificial_intelligences
end
