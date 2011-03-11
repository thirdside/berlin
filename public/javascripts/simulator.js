/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * website: thirdside.ca
 * date: 07/03/2011
 */


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
		this.nbSoldiers	= 0;
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
		this.moves		= [];
		
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
	
	clearContext: function (layer)
	{
		if (this.getContext(layer))
			this.getContext(layer).clearRect(0, 0, this.layers[layer].width, this.layers[layer].height);
	},
	
	// Called every time a new turn happens
	onTurn: function (turn)
	{
		if (turn)
		{
			this.moves = turn.moves;
			turn.node_state.each(function(nodeState) {
				var node = this.nodeGraph.nodes[nodeState.node_id];
				node.setSoldiers(nodeState.player_id, nodeState.nb_soldiers);
			}, this);
		} else
		{
			this.moves = [];
		}
		this.draw(['moves', 'players']);
	}, 
	
	// Draws the layers to the screen
	draw: function (drawableLayers)
	{
		drawableLayers = $A(drawableLayers);
		
		drawableLayers.each(function (layer){
			this.clearContext(layer);
		}, this);
		
		Object.keys(this.nodeGraph.nodes).each(function(nodeId) {
			
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
					this.drawArrow(ctx, node.position.x, node.position.y, to.position.x, to.position.y, 16, "#444444", true)
				}, this);
			}
			
			if (drawableLayers.include('players'))
			{
				// PLAYERS
				var ctx = this.getContext('players');
				ctx.globalAlpha = 0.8;
				var soldiers_box_width	  = 50;
				var soldiers_box_height	 = 25;
				var soldiers_box_padding_x  = 10;
				var soldiers_box_padding_y  = 7;

				ctx.fillStyle = "#333333";
				ctx.fillRect (node.position.x + soldiers_box_padding_x, node.position.y + soldiers_box_padding_y, soldiers_box_width, soldiers_box_height);

				ctx.fillStyle	= '#000000';
				ctx.font		 = '20px sans-serif';
				ctx.textAlign	= 'center';
				ctx.textBaseline = 'top';
				ctx.fillText(node.nbSoldiers, node.position.x + soldiers_box_width / 2 + soldiers_box_padding_x, node.position.y + soldiers_box_padding_y);
			}
			
			if (drawableLayers.include('moves'))
			{
				this.moves.each(function (move) {
					this.drawMove(move);
				}, this);
			}
		}, this);
		
		// Add all the layers to the display area
		drawableLayers.each(function(layer) {
			this.container.insert(this.layers[layer]);
		}, this);
	},
	
	drawMove: function (move)
	{
		var ctx = this.getContext("players");
		var nodeFrom = this.nodeGraph.nodes[move.from];
		var nodeTo = this.nodeGraph.nodes[move.to];
		this.drawArrow(ctx, nodeFrom.position.x, nodeFrom.position.y, nodeTo.position.x, nodeTo.position.y, 15, "#ff00ff");
	},
	
	drawArrow: function (ctx, fromX, fromY, toX, toY, size, color, noarrow)
	{
		noarrow = noarrow || false;
		color = color || "#000000";
		
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(fromX, fromY);
		ctx.lineTo(toX, toY);
		ctx.lineWidth = 5;
		ctx.stroke();
		
		if (!noarrow)
		{
			ctx.beginPath();
			ctx.fillStyle = color;
			var angle = Math.atan2(toY - fromY, toX - fromX);
			var angle1 = angle + Math.PI / 8;
			var angle2 = angle - Math.PI / 8;
			ctx.lineTo(Math.round(toX - Math.cos(angle1) * size), Math.round(toY - Math.sin(angle1) * size));
			ctx.lineTo(Math.round(toX - Math.cos(angle2) * size), Math.round(toY - Math.sin(angle2) * size));
			ctx.lineTo(toX, toY);
			ctx.stroke();
			ctx.fill();
		}
		
	}
});

TS.AIPlayback = Class.create(TS, {
	initialize: function ($super, container, map_url, game_description_url)
	{
		$super();
		this.turnNumber = 0;
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
		return $H(this.ready).all();
	}, 
	
	start: function ()
	{
		if (!this.timer)
		{
			this.timer = new TS.Timer();
			this.timer.observe("timer", this.onTimer.bind(this));
		}
		
		this.timer.start(500, -1);
	},
	
	onTimer: function ()
	{
		if (this.gameDescription.turns.length > this.turnNumber)
		{
			if (this.turn)
			{
				this.turn = null;
			} else
			{
				this.turn = this.gameDescription.turns[this.turnNumber]
				this.turnNumber++;
			}
		} else
		{
			this.turn = null;
			this.timer.stop();
		}
		this.map.onTurn(this.turn);
	}
})

Object.extend(TS.NodeGraph, {
	DAMPING : .5,
	TIMESTEP : .5
})