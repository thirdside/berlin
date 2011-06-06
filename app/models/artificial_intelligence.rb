class ArtificialIntelligence < ActiveRecord::Base

  LANGUAGES = %w(Ruby PHP Python C/C++ Lua JavaScript C# Go Java Other)

  include Awardable
  include Player

  belongs_to :user, :counter_cache=>true
  
  has_many :timeouts, :class_name=> "ArtificialIntelligenceTimeout", :dependent=>:destroy
  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :games, :through=>:artificial_intelligence_games

  scope :ordered, :order=>"artificial_intelligences.name"

  validates :name, :presence=>true, :uniqueness=>true, :length => { :minimum => 1 }
  validates :url, :presence=>true, :format => { :with => /^(http|https):\/\// }
  validates :language, :presence=>true, :inclusion=>LANGUAGES
  
  def belongs_to? user
    self.user_id == user.id
  end
  
  def parsed_url
    u = URI.parse( self.url )
    u.path.empty? ? URI.parse( self.url + "/" ) : u
  end
end
