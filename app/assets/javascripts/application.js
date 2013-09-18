//= require prototype
//= require scriptaculous/builder
//= require scriptaculous/effects
//= require scriptaculous/dragdrop
//= require scriptaculous/controls
//= require scriptaculous/slider
//= require scriptaculous/sound

//= require thirdside
//= require raphael/raphael
//= require raphael/g.raphael
//= require raphael/g.pie
//= require raphael/raphael-animate-along
//= require graphico
//= require swfobject
//= require fullscreen

//= require tournament_ranking

//= require simulator/drawable
//= require simulator/animated
//= require simulator/node
//= require simulator/svg
//= require simulator/player
//= require simulator/playback_description
//= require simulator/playback
//= require simulator/simulator
//= require_self


// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
TS.NewGameHelper = Class.create(TS, {
	initialize: function (map_container, map_select, available_ais, selected_ais, hidden_ais, create_button, feel_lucky, map_path, number_of_players)
	{
		this.available_ais = $(available_ais);
		this.selected_ais = $(selected_ais);
		this.hidden_ais = $(hidden_ais);
		this.map_container = $(map_container);
		this.map_path = map_path || "/maps/#{id}.json";
		this.map_select = $(map_select);
		this.create_button = $(create_button);
		this.feel_lucky = $(feel_lucky);
		this.number_of_players = number_of_players ? $(number_of_players) : null;

		this.map_select.observe('change', this.onMapChange.bindAsEventListener(this));

    if (feel_lucky)
    {
		  this.feel_lucky.observe('click', this.onFeelLuckyClick.bindAsEventListener(this));
    }

    if (available_ais)
    {
  		Sortable.create('available_ais', {tag: 'div', dropOnEmpty: true, constraint: null, containment: ['available_ais', 'selected_ais']});
  		Sortable.create('selected_ais', {tag: 'div', dropOnEmpty: true, constraint: null, containment: ['available_ais', 'selected_ais'], onUpdate: this.onSelectedAIsChange.bindAsEventListener(this)});
    }

		this.updateMap(this.map_select.value);
	},

	onFeelLuckyClick: function (e)
	{
	  e.stop();
	  var previous = this.map_select.value;
	  var options = this.map_select.childElements();
	  var value = options[ Math.floor ( Math.random() * options.length ) ];
    value.selected = true;

	  if (previous != value.value)
	   this.onMapChange();
	},

	onSelectedAIsChange: function (selected)
	{
		this.hidden_ais.update();

		selected.childElements().each(function(div) {
			var element = new Element('input', {type: 'hidden', name: 'game[artificial_intelligence_ids][]'});
			element.value = div.id.split('_').last();
			this.hidden_ais.insert( element );
		}, this);

		this.updateAIsCount();
	},

	onMapChange: function (e)
	{
		this.updateMap(this.map_select.value);
	},

	updateMap: function (id)
	{
		this.map_container.update();
		this.map = new TS.AIMap(this.map_container, this.map_path.interpolate({id: id}));
		this.map.observe('ready', this.onMapReady.bindAsEventListener(this));
	},

	onMapReady: function (e)
	{
		var desc = new TS.PlaybackDescription(
			this.map.config,
			this.map.nodeGraph,
			null,
			this.map.layers['background'],
			this.map.graphics);

		this.updateAIsCount();

		desc.initializePreview();
		this.map.doTurn(null, desc.preview, true);
	},

	updateAIsCount: function ()
	{
	  if (this.number_of_players != null)
	    this.number_of_players.update(this.map.config.infos.number_of_players);

    if (this.create_button)
      this.create_button[this.map.config.infos.number_of_players.include(this.hidden_ais.childElements().size()) ? "enable" : "disable"]();
	}
});
