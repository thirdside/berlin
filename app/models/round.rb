class Round < ActiveRecord::Base
  belongs_to :tournament
  belongs_to :map

  has_many :games, :dependent => :destroy

  attr_accessible :players_per_game
end
