class Game < ActiveRecord::Base
  include Likable

  class NotEnoughArtificialIntelligences < Exception; end

  attr_accessible :map_id, :artificial_intelligence_ids, :is_practice

  belongs_to :map, :counter_cache => true
  belongs_to :user
  belongs_to :round

  has_one :tournament, :through => :round

  has_many :artificial_intelligence_games, :dependent => :destroy
  has_many :artificial_intelligences, :through => :artificial_intelligence_games
  has_many :winners, ->{ where(:artificial_intelligence_games => {:winner => true}) }, :through => :artificial_intelligence_games, :source => :artificial_intelligence

  scope :ordered,   ->{ order("games.created_at DESC") }
  scope :practices, ->{ where(:is_practice => true) }
  scope :officials, ->{ where(:is_practice => false) }
  scope :for_user,  ->(user){ where("is_practice = ? OR (is_practice = ? AND user_id = ?)", false, true, user.try(:id)) }
  scope :pending,   ->{ where(:status => [:pending, :errored]) }
  scope :finished,  ->{ where(:status => :finished) }
  scope :aborted,   ->{ where(:status => :aborted) }
  scope :recent,    ->{ ordered.limit(30) }

  after_create :send_notification

  before_save :ensure_is_practice_is_set

  state_machine :status, :initial => :pending do
    event :finish do
      transition any => :finished
    end

    event :error do
      transition :pending => :errored
    end

    event :final_error do
      transition :error => :aborted
    end
  end

  def number_of_players
    artificial_intelligence_games_count
  end

  def self.queue_game(user, params)
    game = user.games.create(params) do |g|
      g.map = Map.find(params[:map_id])
      g.round = Round.where(:id => params[:round_id]).first
      g.time_start = DateTime.now
    end

    ais = ArtificialIntelligence.where(:id => params[:artificial_intelligence_ids]).shuffle

    raise NotEnoughArtificialIntelligences "at least two AIs are required to start a game" unless ais.length >= 2

    ais.each.with_index do |ai, index|
      game.artificial_intelligence_games.create(
        :artificial_intelligence  => ai,
        :player_id                => index
      )
    end

    Delayed::Job.enqueue GameRunnerJob.new(game.id)
    game
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
