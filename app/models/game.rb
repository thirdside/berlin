class Game < ActiveRecord::Base
  belongs_to :map, :counter_cache=>true
  belongs_to :user

  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :artificial_intelligences, :through=>:artificial_intelligence_games

  include Likable

  def number_of_players
    artificial_intelligence_games.count
  end

  def winners
    self.artificial_intelligence_games.winners.includes(:artificial_intelligence).map(&:artificial_intelligence)
  end
end
