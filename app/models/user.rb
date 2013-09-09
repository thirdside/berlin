class User < ActiveRecord::Base

  include Player

  has_many :artificial_intelligences, :dependent => :destroy
  has_many :artificial_intelligence_games, :through => :artificial_intelligences
  has_many :awards, :through => :artificial_intelligences
  has_many :games, :dependent => :nullify
  has_many :likes, :dependent => :destroy
  has_many :notifications, :dependent => :destroy
  has_many :tournaments, :dependent => :destroy

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable, :authentication_keys => [:login]

  # Virtual attribute for sign in
  attr_accessor :login

  # Setup accessible (or protected) attributes for your model
  attr_accessible :login, :username, :email, :password, :password_confirmation, :remember_me, :game_client

  validates :username, :presence => true, :uniqueness => true, :length => { :minimum => 4, :maximum => 100 }

  def game_ids
    self.artificial_intelligence_games.map(&:game_id).uniq
  end

  protected
  def self.find_first_by_auth_conditions(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions).where(["lower(username) = :value OR lower(email) = :value", { :value => login.downcase }]).first
    else
      where(conditions).first
    end
  end
end
