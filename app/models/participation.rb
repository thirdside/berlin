class Participation < ActiveRecord::Base
  belongs_to :artificial_intelligence
  belongs_to :tournament

  validates_uniqueness_of :artificial_intelligence, :scope => :tournament
end
