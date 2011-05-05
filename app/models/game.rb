class Game < ActiveRecord::Base
  attr_accessor :uuid, :turn, :moves, :states, :spawns

  belongs_to :map, :counter_cache=>true

  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :artificial_intelligences, :through=>:artificial_intelligence_games

  def number_of_players
    artificial_intelligence_games.count
  end

  def winners
    self.artificial_intelligence_games.winners.includes(:artificial_intelligence).map(&:artificial_intelligence)
  end
end
