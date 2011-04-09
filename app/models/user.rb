class User < ActiveRecord::Base
  has_many :artificial_intelligences
  has_many :artificial_intelligence_games, :through=>:artificial_intelligences

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, :email, :password, :password_confirmation, :remember_me

  def score options={}
    s = self.artificial_intelligence_games.map(&:score).to_stat.average
    options[:percentage] ? s.percentage_of( 1 ).to_decimals( 1 ) : s
  end
end
