class Round < ActiveRecord::Base
  belongs_to :tournament
  belongs_to :map

  has_many :games, :dependent => :nullify

  attr_accessible :players_per_game, :map, :map_id

  after_create :queue_games

  validates_presence_of :map, :tournament
  validates_numericality_of :players_per_game

  protected

  def queue_games
    tournament.artificial_intelligences.combination(players_per_game).each do |ais|
      Game.queue_game(tournament.user,
        :artificial_intelligence_ids => ais.map(&:id),
        :map_id => map.id,
        :round_id => self.id
      )
    end
  end
end
