/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * website: thirdside.ca
 * date: 07/03/2011
 */

// Originally Mentel.Base from Aurelien Blond and Guillaume Malette
var TS = TS || Class.create({}, {
	initialize: function ()
	{
		this._observers = {};
	},

	prepareObservers: function (eventName)
	{
		this._observers[eventName] = this._observers[eventName] || new Array();
		return this._observers[eventName];
	},

	observe: function (eventName, observer) 
	{
		if (Object.isString(eventName) && Object.isFunction(observer)) 
		{
			var observers = this.prepareObservers(eventName);

			if(!observers.include(observer))
				observers.push(observer);
		}
	},

	stopObserving: function (eventName, observer)
	{
		if (Object.isString(eventName) && Object.isFunction(observer)) 
		{
			var observers = this.prepareObservers(eventName);
			observers = observers.without(observer);
		} else if (Object.isString(eventName))
			this._observers = this._observers.without(eventName);
		else
			this._observers = new Array();
	},

	fire: function (eventName) {
		if (Object.isString(eventName)) 
		{
			var args = $A(arguments).slice(1);

			var observers = this.prepareObservers(eventName);
			observers.each(function(observer) {
				observer.apply(null, args);
			}, this);
		}
	}
});

/**
 * Timer Util Class
 * @see TS
 */
TS.Timer = Class.create(TS, {
	initialize: function ($super)
	{
		$super();
		this.stop();
	},
	
	/**
	 * Starts the timer
	 * delay: time in ms between ticks 
	 * repeat: number of times to run, negative for infinite. 
	 */
	start: function (delay, repeat)
	{
		this.stop();
		var d			= new Date();
		this.startTime	= d.getTime();
		this.repeat		= repeat;
		this.delay		= delay;
		this.interval	= setInterval(this.onTick.bind(this), this.delay);
	},
	
	onTick: function ()
	{
		var d = new Date();
		this.lastTick = d.getTime();
		this.tickCount++;
		
		this.fire("timer", {time: this.lastTick, count: this.tickCount})
		
		if (this.tickCount >= this.repeat && this.repeat > 0)
		{
			this.stop();
		}
	},
	
	stop: function ()
	{
		if (this.interval)
			clearInterval(this.interval);
			
		this.interval	= null;
		this.startTime	= null;
		this.lastTick	= null;
		this.tickCount	= 0;
		this.repeat		= 0;
	}
});

TS.Node = Class.create(TS, {
	initialize: function ($super, id, type, x, y)
	{
		$super();
		this.position	= {x: x, y: y};
		this.velocity	= {x: 0, y: 0};
		this.mass		= 3;
		this.id			= id;
		this.type		= type;
		this.links		= new Array();
	},
	
	linkTo: function (otherNode)
	{
		this.links.push(otherNode.id);
	},
	
	setSoldiers: function(playerId, nbSoldiers)
	{
		this.playerId = playerId,
		this.nbSoldiers = nbSoldiers;
	},

	repulsion: function (otherNode)
	{
		
	},
   
	attraction: function (otherNode)
	{
		
	}
});

TS.NodeGraph = Class.create(TS, {
	initialize: function ($super, map)
	{
		$super();
		this.nodes = {};
		this.map = map;
		this.directed = map.map.directed || false;
		
		// Create nodes
		this.map.nodes.each(function(node){
			this.nodes[node.id] = new TS.Node(node.id, node.type, node.x, node.y);
		}, this);
		
		// Add paths between the nodes
		this.map.paths.each(function(path){
			this.nodes[path.from].linkTo(this.nodes[path.to]);
			if (!this.directed)
				this.nodes[path.to].linkTo(this.nodes[path.from]);
		}, this);
	},

	// Place the nodes on the graph
	computeNodePositions: function ()
	{
		this.setupNodes();
		var total_energy = 0;
		while (total_energy > 100)
		{
			this.nodes.each(function(node){
				var attraction = {x: 0, y: 0};
				var repulsion = {x: 0, y: 0};
				this.nodes.each(function(otherNode){
					if (otherNode == node) {return;}
					repulsion = node.repulsion(otherNode);
					if (node.isConnected(otherNode))
					{
						attraction = node.attraction(otherNode);
					}
				}, this);
			
				var net_force = {x: attraction.x + repulsion.x, y: attraction.y + repulsion.y};
				node.velocity = {x: net_force.x * NodeGraph.DAMPING * NodeGraph.TIMESTEP, y: net_force.y * NodeGraph.DAMPING * NodeGraph.TIMESTEP};
				node.position = {x: node.position.x + node.velocity.x * NodeGraph.TIMESTEP, y: node.position.y + node.velocity.y * NodeGraph.TIMESTEP}
				var node_energy = node.mass * Math.sqrt(Math.sqrt(Math.pow(node.velocity.x, 2) + Math.pow(node.velocity.y, 2)), 2);
			}, this);
		}
	},
	
	// Initial setup. Ensures that two nodes aren't on the same position
	setupNodes: function()
	{
		for (i= 0; i < this.nodes.length; i++)
		{
			nodes[i].move(i, i);
		}
	}
});

TS.AIMap = Class.create(TS, {
	initialize: function ($super, container, config_url)
	{
		$super();
		this.config_url	= config_url;
		this.container	= $(container);
		this.layers		= {};
		this.graphics	= {};
		
		// load config
		new Ajax.Request( config_url, {method: 'get', onComplete: this.onConfigLoaded.bindAsEventListener(this)});
	},
	
	// Callback after the Map's config are loaded
	onConfigLoaded: function (request)
	{
		this.config = request.responseText.evalJSON();
		
		if (!this.config) {alert("Map Error"); return};
		
		this.nodeGraph = new TS.NodeGraph(this.config);
		
		// Create a canvas element for each display layer
		$A(['background', 'paths', 'nodes', 'players', 'moves', 'info']).each(function(layer) {
			this.layers[layer] = new Element('canvas', {id: layer, width: this.config.map.width,  height: this.config.map.height});
		}, this);
		
		// Preload all the images
		this.config.types.each(function(type){
			var img = new Image();
			img.onload = this.onNodeImageLoad.bindAsEventListener(this, type.name);
			img.src = type.image;
		}, this);
		
		this.fire("ready");
	},
	
	// Callback after each image is loaded
	onNodeImageLoad: function (event, type)
	{
		this.graphics.nodes = this.graphics.nodes || {};
		this.graphics.nodes[type] = event.findElement();
		
		if (Object.keys(this.graphics.nodes).length == this.config.types.size())
			this.draw(Object.keys(this.layers));
	},

	// Returns a context associated with a layer's canvas
	getContext: function (layer)
	{
		return this.layers[layer] ? this.layers[layer].getContext('2d') : null;	
	},
	
	// Called every time a new turn happens
	onTurn: function ()
	{
		
	}, 
	
	// Draws the layers to the screen
	draw: function (drawableLayers)
	{
		drawableLayers = $A(drawableLayers);
		
		Object.keys(this.nodeGraph.nodes).each(function(nodeId){
			
			var node = this.nodeGraph.nodes[nodeId];
			
			// Draw nodes only if necessary (1st time)		
			if (drawableLayers.include('nodes'))
			{
				var img = this.graphics.nodes[node.type];
				// Draw Nodes
				this.getContext('nodes').drawImage(
						img,
						node.position.x - img.width / 2,
						node.position.y - img.height / 2
				);
			}
			
			// Draw paths only if necessary (1st time)
			if (drawableLayers.include('paths'))
			{
				node.links.each(function(otherNodeId) {
					var to = this.nodeGraph.nodes[otherNodeId];
						
					// Draw Paths
					var ctx = this.getContext('paths');
					ctx.beginPath();
					ctx.moveTo(node.position.x, node.position.y);
					ctx.lineTo(to.position.x, to.position.y);
					ctx.lineWidth = 2;
					ctx.stroke();
				}, this);
			}
		}, this);
		
		// Add all the layers to the display area
		drawableLayers.each(function(layer) {
			this.container.insert(this.layers[layer]);
		}, this);
		
		/*
		// PLAYERS
		this.contexts.get('layer3').globalAlpha = 0.8;
		var soldiers_box_width	  = 50;
		var soldiers_box_height	 = 25;
		var soldiers_box_padding_x  = 10;
		var soldiers_box_padding_y  = 7;

		this.config.players.each(function(player){
			player.starting_nodes.each(function(starting_node){
				var node = this.nodes.get(starting_node.node);

				this.contexts.get('layer3').fillStyle = player.color;
				this.contexts.get('layer3').fillRect (node.x + soldiers_box_padding_x, node.y + soldiers_box_padding_y, soldiers_box_width, soldiers_box_height);

				this.contexts.get('layer3').fillStyle	= '#000000';
				this.contexts.get('layer3').font		 = '20px sans-serif';
				this.contexts.get('layer3').textAlign	= 'center';
				this.contexts.get('layer3').textBaseline = 'top';
				this.contexts.get('layer3').fillText(starting_node.soldiers, node.x + soldiers_box_width / 2 + soldiers_box_padding_x, node.y + soldiers_box_padding_y);
			}, this);
		}, this);
		*/
	}
});

TS.AIPlayback = Class.create(TS, {
	initialize: function ($super, container, map_url, game_description_url)
	{
		$super();
		this.map = new TS.AIMap(container, map_url);
		this.map.observe('ready', this.onMapReady.bindAsEventListener(this));
		this.ready = {map:false, self:false};
		new Ajax.Request( game_description_url, {method: 'get', onComplete: this.onGameDescriptionLoaded.bindAsEventListener(this)});
	},
	
	onMapReady: function ()
	{
		this.ready.map = true;
		if (this.isReady())
		{
			this.start();
		}
	},
	
	onGameDescriptionLoaded: function (request)
	{
		this.ready.self = true;
		
		this.gameDescription = request.responseText.evalJSON();
		
		if (this.isReady())
		{
			this.start();
		}
	},
	
	isReady: function ()
	{
		return this.ready.all();
	}
})

Object.extend(TS.NodeGraph, {
	DAMPING : .5,
	TIMESTEP : .5
})