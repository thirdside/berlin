class User < ActiveRecord::Base
  has_many :artificial_intelligences
  has_many :artificial_intelligence_games, :through=>:artificial_intelligences

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, :email, :password, :password_confirmation, :remember_me

  validates_uniqueness_of :username

  def score
    self.artificial_intelligence_games.map(&:score).to_stat.average
  end

  def game_ids
    self.artificial_intelligence_games.map(&:game_id).uniq
  end
end
