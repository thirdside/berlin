class Organisation < ActiveRecord::Base
  belongs_to :user
  has_many :users

  attr_accessible :name
end
