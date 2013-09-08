class TS.TournamentRankingChart

  constructor: (@id) ->
    new Ajax.Request "/tournaments/#{@id}/artificial_intelligence_games.json",
      method: 'get'
      onComplete: (data) => @onRankings(data)

  onRankings: (request) ->
    @series = {}
    @dataLabels = {}
    request.responseJSON.forEach (ai_game) =>
      data = (@series[ai_game.name] ||= [])
      data.push Math.round(ai_game.rating || 1500)
      @dataLabels[ai_game.name] ||= ai_game.name
    , {}

    @createGraph()

  createGraph: ->
    @graph new Grafico.LineGraph $('chart_container'), @series,
      markers: "value"
      datalabels: @dataLabels
      label_color:           "#444"
