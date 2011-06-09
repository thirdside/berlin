class Game < ActiveRecord::Base
  belongs_to :map, :counter_cache=>true
  belongs_to :user

  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :artificial_intelligences, :through=>:artificial_intelligence_games

  include Likable
  
  scope :ordered, order("games.created_at DESC")
  scope :practices, where("games.is_practice IS TRUE")
  scope :officials, where("games.is_practice IS NOT TRUE")
  
  after_create :send_notification

  def number_of_players
    artificial_intelligence_games.count
  end

  def winners
    self.artificial_intelligence_games.winners.includes(:artificial_intelligence).map(&:artificial_intelligence)
  end
  
  def self.start_new_game options
    game = Berlin::Server::Game.new
    game.init( options )
    game.run
  end
  
  protected
    def send_notification
      self.artificial_intelligences.map(&:user_id).uniq.each do |user|
        Notification.push user, self
      end
    end
end
