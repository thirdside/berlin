require 'test_helper'

class ParticipationTest < ActiveSupport::TestCase
  test "there can only be one participation per AI per tournament" do
    tournament = tournaments(:first)
    p = Participation.create do |p|
      p.tournament = tournaments(:first)
      p.artificial_intelligence = artificial_intelligences(:haiku)
    end

    assert !p.valid?
    assert !p.persisted?
    assert_equal ["has already been taken"], p.errors[:artificial_intelligence]
  end
end
