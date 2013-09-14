class Tournament < ActiveRecord::Base
  belongs_to :user
  belongs_to :organisation

  has_many :rounds, :dependent => :destroy
  has_many :games, :through => :rounds
  has_many :artificial_intelligence_games, :through => :games

  has_many :participations, :dependent => :destroy
  has_many :artificial_intelligences, :through => :participations

  attr_accessible :name, :artificial_intelligence_ids

  validates_presence_of :name
end
