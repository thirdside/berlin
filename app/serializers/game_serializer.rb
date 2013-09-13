class GameSerializer < ActiveModel::Serializer
  attributes  :id, :number_of_turns, :time_start, :time_end, :created_at,
              :updated_at, :round_id, :status, :last_error, :is_practice, :replay

  def replay
    ActiveSupport::JSON.decode object.json
  end
end
