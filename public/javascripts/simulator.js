/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * website: thirdside.ca
 * date: 07/03/2011
 */

var TS = TS || Class.create({});

TS.Node = Class.create({
	initialize: function (id, type, x, y)
	{
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

TS.NodeGraph = Class.create({
	initialize: function (map)
	{
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

TS.Map = Class.create({
	initialize: function (container, config_url)
	{
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

Object.extend(TS.NodeGraph, {
	DAMPING : .5,
	TIMESTEP : .5
})