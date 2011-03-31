module ApplicationHelper
  def menu
    {
        ArtificialIntelligence => [
          {:action=>:index, :href=>artificial_intelligences_path},
          {:action=>:new, :href=>new_artificial_intelligence_path}
        ],

        Game => [
          {:action=>:index, :href=>games_path}
        ]
    }
  end
end
