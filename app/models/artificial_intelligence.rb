class ArtificialIntelligence < ActiveRecord::Base

  LANGUAGES = %w(Ruby PHP Python C/C++ Lua JavaScript C# Go Java Other)

  include Awardable
  include Player

  belongs_to :user, :counter_cache => true

  has_many :timeouts, :class_name => "ArtificialIntelligenceTimeout", :dependent => :destroy
  has_many :artificial_intelligence_games, :dependent => :destroy
  has_many :games, :through => :artificial_intelligence_games
  has_many :participations, :dependent => :destroy
  has_many :tournaments, :through => :participations

  scope :ordered, ->{ order("artificial_intelligences.name") }
  scope :active,  ->{ where(:is_active => true) }

  validates :name, :presence => true, :uniqueness => true, :length => { :minimum => 1 }
  validates :url, :presence => true, :format => { :with => /\A(http|https):\/\// }
  validates :language, :presence => true, :inclusion => LANGUAGES

  attr_accessible :name, :url, :is_active, :language, :user_id

  def belongs_to? user
    self.user_id == user.id rescue false
  end

  def parsed_url
    u = URI.parse( self.url )
    u.path.empty? ? URI.parse( self.url + "/" ) : u
  end

  def activity_icon
    self.is_active ? "light-green.png" : "light-red.png"
  end
end
