class User < ActiveRecord::Base
  has_many :artificial_intelligences
  has_many :artificial_intelligence_games, :through=>:artificial_intelligences
end
