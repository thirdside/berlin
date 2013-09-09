class GameRunnerJob < Struct.new(:game_id)
  def perform
    game = Berlin::Server::Game.find(game_id)
    game.run
  end

  def max_attempts
    return 10
  end

  def error(job, exception)
    record_error(job, exception)
  end

  def failure(job)
    record_error(job)
  end

  def record_error(job, exception = nil)
    job = YAML.load(job.handler)
    game = Game.find(job.game_id)

    if exception
      game.error
      game.last_error = "#{exception.to_s}\n\n#{exception.backtrace.join("\n")}"[0...1024]
    else
      game.final_error
    end

    game.save
  end
end
