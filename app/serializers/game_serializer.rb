class GameSerializer < ActiveModel::Serializer
  attributes  :id, :number_of_turns, :time_start, :time_end, :created_at, :map_id,
              :updated_at, :round_id, :status, :last_error, :is_practice, :replay

  has_one :map
  has_many :artificial_intelligences

  def replay
    ActiveSupport::JSON.decode object.json
  end
end
