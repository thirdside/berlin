// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults


TS.NewGameHelper = Class.create(TS, {
	initialize: function (map_container, map_select, available_ais, selected_ais, hidden_ais, map_path)
	{
		this.available_ais = $(available_ais);
		this.selected_ais = $(selected_ais);
		this.hidden_ais = $(hidden_ais);
		this.map_container = $(map_container);
		this.map_path = map_path || "/maps/#{id}.json";
		this.map_select = $(map_select);
		
		this.map_select.observe('change', this.onMapChange.bindAsEventListener(this));
		
		Sortable.create('available_ais', {tag: 'div', dropOnEmpty: true, constraint: null, containment: ['available_ais', 'selected_ais']});
		Sortable.create('selected_ais', {tag: 'div', dropOnEmpty: true, constraint: null, containment: ['available_ais', 'selected_ais'], onUpdate: this.onSelectedAIsChange.bindAsEventListener(this)});
		
		
		this.updateMap(this.map_select.value);
	},
	
	onSelectedAIsChange: function (selected)
	{
		this.hidden_ais.update();
		
		selected.childElements().each(function(div) {
			var element = new Element('input', {type: 'hidden', name: 'game[artificial_intelligence_ids][]'});
			element.value = div.id.split('_').last();
			this.hidden_ais.insert( element );
		}, this);
	},
	
	onMapChange: function (e)
	{
		this.updateMap(e.findElement().value);
	},
	
	updateMap: function (id)
	{
		this.map_container.update();
		this.map = new TS.AIMap(this.map_container, this.map_path.interpolate({id: id}));
		this.map.observe('ready', this.onMapReady.bindAsEventListener(this));
	},
	
	onMapReady: function ()
	{
		
	}
});
