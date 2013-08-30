class Game < ActiveRecord::Base
  include Likable

  belongs_to :map, :counter_cache => true
  belongs_to :user
  belongs_to :round

  has_one :tournament, :through => :round

  has_many :artificial_intelligence_games, :dependent => :destroy
  has_many :artificial_intelligences, :through => :artificial_intelligence_games

  scope :ordered,   ->{ order("games.created_at DESC") }
  scope :practices, ->{ where(:is_practice => true) }
  scope :officials, ->{ where(:is_practice => false) }
  scope :for_user,  ->(user){ where("is_practice = ? OR (is_practice = ? AND user_id = ?)", false, true, user.try(:id)) }

  after_create :send_notification

  before_save :ensure_is_practice_is_set

  def number_of_players
    artificial_intelligence_games_count
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

    def ensure_is_practice_is_set
      self.is_practice = false if self.is_practice.nil?
      nil
    end

    def send_notification
      self.artificial_intelligences.map(&:user_id).uniq.each do |user|
        Notification.push user, self
      end
    end
end
