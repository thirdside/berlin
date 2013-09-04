class TS.TournamentRankingChart

  constructor: (@id) ->
    new Ajax.Request "/tournaments/#{@id}/artificial_intelligence_games.json",
      method: 'get'
      onComplete: (data) => @onRankings(data)

  onRankings: (request) ->
    @series = {}
    @dataLabels = {}
    request.responseJSON.forEach (ai_game) =>
      data = (@series[ai_game.artificial_intelligence_id] ||= [])
      data.push ai_game.rating || 1500
      @dataLabels[ai_game.artificial_intelligence_id] ||= if ai_game.artificial_intelligence_id is 3 then "haiku" else "nitrous"
    , {}

    @createGraph()

  createGraph: ->
    @graph new Grafico.LineGraph $('chart_container'), @series,
      markers: "value"
      datalabels: @dataLabels
      label_color:           "#444"