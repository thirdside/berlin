/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 07/03/2011
 */


TS.AIMap = Class.create(TS, {
	initialize: function ($super, container, config_url, options)
	{
		$super();
		
		this.options = Object.extend({
			engine: "SVG"
		}, options || {});		
		
		this.config_url		= config_url;
		this.container		= $(container);
		this.layers			= {};
		this.graphics		= {};
		this.color			= new TS.Color();
		this.size       	= {width: this.container.getWidth(), height: this.container.getHeight()};
		
		// load config
		new Ajax.Request( config_url, {method: 'get', onComplete: this.onConfigLoaded.bindAsEventListener(this)});
	},
	
	/*
	 * Callback after the visualizer's config is loaded
	 */
	onConfigLoaded: function (request)
	{
		this.config       = request.responseText.evalJSON();
		this.background   = new Image();
		this.imagesToLoad = this.config.types.size() + 1; //+1 for background
		
		if (!this.config) {alert("Map Error"); return};
		
		this.nodeGraph = new TS.NodeGraph(this.config);
		
		// Create a canvas element for each display layer
		$A(['background', 'paths', 'nodes', 'moves', 'soldiers', 'spawns', 'info']).each(function(layer) {
			this.layers[layer] = new TS[this.options.engine](
				this.container,
				{x:0, y:0},
				{width: this.size.width,
				height: this.size.height},
				this.config.infos.translate);
		}, this);

		
		// Preload all the images
		this.config.types.each(function(type){
			var img = new Image();
			img.onload = this.onImageLoaded.bindAsEventListener(this, type.name);
			img.src = type.image;
		}, this);
		
		// Preload the background
		this.background.onload = this.onImageLoaded.bindAsEventListener(this, 'background');
		this.background.src = this.config.infos.background;
		
		this.fire("ready");
	},
	
	/*
	 * Callback after each image is loaded
	 */
	onImageLoaded: function (event, type)
	{
		// keep track of nodes types		
		if (type != 'background') {
			this.graphics.nodes = this.graphics.nodes || {};
			this.graphics.nodes[type] = event.findElement();
		}
		
		// draw layers when all the images are loaded
		this.imagesToLoad--;
		
		// when all the images are loaded, prepare the static layers
		if (this.imagesToLoad == 0) {
			this.layers['background'].background(this.background);
			this.drawPaths();
		}
	},
	
	/*
	 * Called every time a new turn happens
	 */
	doTurn: function (turnBefore, turnNow, forward)
	{
		// if a turnBefore exists, we must play the departure animations
		if (turnBefore)
		{
			Object.keys(turnBefore).each(function(layerName) {
				var layer = this.layers[layerName];
				var data = turnBefore[layerName];
				
				// clear the layer
				layer.clear();
				
				// add the objects
				data.objects.each(function (object) {
					layer.addObject(
						object,
						data[forward ? 'forward_departure' : 'backward_departure'][object.id].start);
				}, this);			
	
				// add the animations			
				Object.keys(data[forward ? 'forward_departure' : 'backward_departure']).each(function (animationId) {
					var animation = data[forward ? 'forward_departure' : 'backward_departure'][animationId];
					layer.addAnimation(animationId, animation.end, animation.length);
				}, this);
			}, this);
		}
		
		
		Object.keys(turnNow).each(function(layerName) {
			var layer = this.layers[layerName];
			var data = turnNow[layerName];
			
			// clear the layer
			layer.clear();
			
			// add the objects
			data.objects.each(function (object) {
				layer.addObject(
					object,
					data[forward ? 'forward_arrival' : 'backward_arrival'][object.id].start);
			}, this);			

			// add the animations			
			Object.keys(data[forward ? 'forward_arrival' : 'backward_arrival']).each(function (animationId) {
				var animation = data[forward ? 'forward_arrival' : 'backward_arrival'][animationId];
				layer.addAnimation(animationId, animation.end, animation.length);
			}, this);
		}, this);
	},
	
	// Draws the layers to the screen
//	draw: function (drawableLayers, turn)
//	{
//		turn = turn || {};
//		drawableLayers = $A(drawableLayers);
//		
//		drawableLayers.each(function (layerName){
//			var layer = this.getLayer(layerName);
//			
//			if (layer.redraw)
//				layer.clear();
//		}, this);
//		
//		// Draw moves
//		if (drawableLayers.include('moves') && turn.moves)
//		{
//			Object.keys(turn.moves).each(function (moveId) {
//				var move = turn.moves[moveId];
//				var fromNode = this.nodeGraph.nodes[move.from];
//				var toNode = this.nodeGraph.nodes[move.to];
//				var color = this.getPlayerColor(move.player_id);
//				var backPointer = false;
//				var link = fromNode.getLink(toNode.id);
//				
//				if (link == null) {
//					link = toNode.getLink(fromNode.id);
//					backPointer = true;
//				}
//				
//				var controlRatio = link.controlRatio;
//				
//				this.getLayer('moves').move(
//					fromNode.position,
//					toNode.position,
//					move.number_of_soldiers,
//					{
//						'color': color,
//						'controlRatio': controlRatio,
//						'backPointer': backPointer
//					});
//			}, this);
//		}
//		
//		// Draw the background
//		if (drawableLayers.include('background'))
//		{
//			this.getLayer('background').background(this.background);
//		}
//		
//		// Draw nodes
//		if (drawableLayers.include('nodes'))
//		{
//			Object.keys(this.nodeGraph.nodes).each(function(nodeId) {
//				var node = this.nodeGraph.nodes[nodeId];
//			
//				var img = this.graphics.nodes[node.type];
//
//				if (node.type == 'node')
//					this.getLayer('nodes').node(img, node.position, {'color': this.getPlayerColor(node.playerId)});
//					
//				else if (node.type == 'city')
//					this.getLayer('nodes').city(img, node.position, {
//						'color': this.getPlayerColor(node.playerId),
//						'layout': node.layout
//					});
//					
//			}, this);
//		}
//			
//			
//		// Draw paths
//		if (drawableLayers.include('paths'))
//		{
//			Object.keys(this.nodeGraph.nodes).each(function(nodeId) {
//				var node = this.nodeGraph.nodes[nodeId];
//			
//				node.links.each(function(link) {
//					var to = this.nodeGraph.nodes[link.toId];
//					
//					this.getLayer('paths').path(node.position, to.position, {'controlRatio': link.controlRatio});
//					
//				}, this);
//			}, this);
//		}
//		
//		// Draw soldiers count at nodes
//		if (drawableLayers.include('soldiersCount'))
//		{
//			Object.keys(this.nodeGraph.nodes).each(function(nodeId) {
//				var node = this.nodeGraph.nodes[nodeId];
//				
//				if (node.nbSoldiers || node.playerId != null)
//				{
//					this.getLayer('soldiersCount').soldiersCount(node.position, node.nbSoldiers);
//				}
//			}, this);
//		}
//		
//		if (drawableLayers.include('soldiersIncrement') && turn.spawns)
//		{
//			turn.spawns.each(function(spawn){
//				var node = this.nodeGraph.nodes[spawn.node_id];
//				
//				this.getLayer('soldiersIncrement').soldiersSpawn(node.position, '+' + spawn.number_of_soldiers);
//
//			}, this);
//		}
//	},

    drawPaths: function()
	{
		Object.keys(this.nodeGraph.nodes).each(function(nodeId) {
			var node = this.nodeGraph.nodes[nodeId];
		
			node.links.each(function(link) {
				var to = this.nodeGraph.nodes[link.toId];
				
				this.layers['paths'].path(node.position, to.position, {'controlRatio': link.controlRatio});
				
			}, this);
		}, this);		
	}
});
