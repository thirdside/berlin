class Organisation < ActiveRecord::Base
  belongs_to :user
  has_many :users
  has_many :tournaments

  attr_accessible :name, :user

  validates_presence_of :name, :user
end
