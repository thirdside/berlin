class TournamentSerializer < ActiveModel::Serializer
  attributes :id, :name, :user_id, :organisation_id

  has_many :artificial_intelligences
end
