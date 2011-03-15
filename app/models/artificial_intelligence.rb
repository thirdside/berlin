class ArtificialIntelligence < ActiveRecord::Base  
  belongs_to :user

  has_many :artificial_intelligence_games, :dependent=>:destroy
  has_many :games, :through=>:artificial_intelligence_games

  def victory_percent options={}
    percent = self.artificial_intelligence_games.sum( :score ).percentage_of( self.games.count )
    percent = options[:string] ? "#{percent.to_i}%" : percent
  end

  # TODO Each AI need to be aware of their nodes and armies...
end
