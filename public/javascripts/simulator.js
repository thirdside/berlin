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
		this.playerId	= null;
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
		this.directed = map.infos.directed || false;
		
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


Object.extend(TS.NodeGraph, {
	DAMPING : .5,
	TIMESTEP : .5
})


TS.Drawable = Class.create(TS, {
	initialize: function (container, position, size)
	{
		this.container = container;
		this.position = Object.extend({x: 0, y: 0}, position || {});
		this.size = Object.extend({width: 1, height: 1}, size || {});
	},
	
	getRelativePosition: function (percent, side)
	{
		return percent/100*this.size[side];
	},
	
	getQuadraticCurvePoint: function (from, to, ratio)
	{
		var x =
		{
			x: (from.x + (to.x - from.x) / 2 + (to.y - from.y) * ratio),
			y: (from.y + (to.y - from.y) / 2 + (to.x - from.x) * ratio * -1)
		};
		
		return x;
	}
});

TS.Canvas = Class.create(TS.Drawable, {
	initialize: function ($super, container, position, size)
	{
		$super(container, position, size);
		
		this.canvas = new Element(
			'canvas',
			{width: this.size.width, height: this.size.height}); //todo: position?
		
		this.canvas.setStyle({
			position: "absolute",
			top: 0
		});
		
		this.context = this.canvas.getContext('2d');
		
		container.insert(this.canvas);
	},
	
	clear: function ()
	{
		this.context.clearRect(0, 0, this.size.width, this.size.height);
	},
	
	image: function (img, position, options)
	{
		options = Object.extend({
			ratio: 1
		}, options || {});
		
		var dimension = {
			width: img.width * options.ratio,
			height: img.height * options.ratio
		}
		
		this.context.drawImage(
			img,
			this.getRelativePosition(position.x, 'width') - dimension.width / 2,
			this.getRelativePosition(position.y, 'height') - dimension.height / 2,
			dimension.width,
			dimension.height);
	},
	
	drawArrow: function (from, to, options)
	{
		options = Object.extend({
			arrow: false,
			bezier: false,
			color: "#000000",
			controlRatio: .035,
			strokeWidth: 4,
			lineJoin: "round",
			arrowSize: 15
		}, options || {});
		
		var inter = {
			fromX: this.getRelativePosition(from.x, 'width'), 
			fromY: this.getRelativePosition(from.y, 'height'), 
			toX: this.getRelativePosition(to.x, 'width'), 
			toY: this.getRelativePosition(to.y, 'height')
		}		
	
		// draw the line	
		this.context.save();
		this.context.fillStyle = options.color;
		this.context.strokeStyle = options.color;
		this.context.lineWidth = options.strokeWidth;
		
		this.context.beginPath();
		this.context.moveTo(inter.fromX, inter.fromY);
		
		if (options.bezier)
		{
			var controlPoints = this.getQuadraticCurvePoint(
				{x: inter.fromX, y: inter.fromY},
				{x: inter.toX, y: inter.toY},
				options.controlRatio);
			
			this.context.quadraticCurveTo(controlPoints.x, controlPoints.y, inter.toX, inter.toY);
		}
		else 
			this.context.lineTo(inter.toX, inter.toY);
		
		this.context.stroke();
		
		this.context.restore();
		
		// draw the arrow
		if (options.arrow)
		{
			var angle = Math.atan2(inter.toY - inter.fromY, inter.toX - inter.fromX);
			var angle1 = angle + Math.PI / 8;
			var angle2 = angle - Math.PI / 8;
			
			var inter = Object.extend(inter, {
				a1X: Math.round(inter.toX - Math.cos(angle1) * options.arrowSize),
				a1Y: Math.round(inter.toY - Math.sin(angle1) * options.arrowSize),
				a2X: Math.round(inter.toX - Math.cos(angle2) * options.arrowSize),
				a2Y: Math.round(inter.toY - Math.sin(angle2) * options.arrowSize)
			});
			

			this.context.save();
			this.context.fillStyle = options.color;
			this.context.strokeStyle = options.color;
			this.context.lineWidth = options.strokeWidth;

			this.context.beginPath();
			this.context.moveTo(inter.toX, inter.toY);
			this.context.lineTo(inter.a1X, inter.a1Y);
			this.context.stroke();
	
			this.context.beginPath();
			this.context.moveTo(inter.toX, inter.toY);
			this.context.lineTo(inter.a2X, inter.a2Y);
			this.context.stroke();

			this.context.restore();
		}
	},
	
	drawBox: function (position, text, options)
	{
		options = Object.extend({
			stroke_color: "#000000",
			text_color:  "#000000",
			fill_color: "#FFFFFF", 
			padding_x: 10,
			padding_y: 7,
			font_size: 14,
			corner_radius: 6,
			width: null,
			height: null
		}, options || {});		

		
		// text dimension
		var textDimension =
		{
			x: this.getRelativePosition(position.x, 'width'),
			y: this.getRelativePosition(position.y, 'height'),
			width: ("" + text).length * (options.font_size / 2),
			height: options.font_size //todo: arbritary
		};
		
		// rectangle dimension
		var rectangleDimension = {
			x: textDimension.x - textDimension.width / 2 - options.padding_x,
			y: textDimension.y - textDimension.height / 2 - options.padding_y,
			width: textDimension.width + options.padding_x * 2,
			height: textDimension.height + options.padding_y * 2
		};

		// draw the rectangle
		this.context.save();
		this.context.fillStyle = options.fill_color;
		this.context.strokeStyle = options.stroke_color;
		
		this.context.fillRect(
			rectangleDimension.x,
			rectangleDimension.y,
			options.width || rectangleDimension.width,
			options.height || rectangleDimension.height
		);
		
		this.context.restore();

		// draw the text		
		this.context.save();
		this.context.font = options.font_size + 'px Verdana';
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";

		this.context.fillText(
			text,
			textDimension.x,
			textDimension.y);

		this.context.restore();
		
		return null;
	}	
});

TS.SVG = Class.create(TS.Drawable, {
	initialize: function($super, container, position, size)
	{
		$super(container, position, size);
		this.raphael = Raphael(this.position.x, this.position.y, this.size.width, this.size.height);
		container.insert(this.raphael.canvas);
	},
	
	clear: function ()
	{
		this.raphael.clear();
	},
	
	image: function(img, position, options)
	{
		options = Object.extend({
			ratio: 1
		}, options || {});
		
		this.raphael.image(
			img.src,
			this.getRelativePosition(position.x, 'width') - (img.width * options.ratio) / 2,
			this.getRelativePosition(position.y, 'height') - (img.height * options.ratio) / 2,
			img.width * options.ratio,
			img.height * options.ratio
		);
	},
	
	drawArrow: function (from, to, options)
	{
		options = Object.extend({
			arrow: false,
			bezier: false,
			color: "#000000",
			controlRatio: .035,
			strokeWidth: 4,
			lineJoin: "round",
			arrowSize: 15
		}, options || {});
		
		var path = options.bezier? "M#{fromX} #{fromY}S#{controlX} #{controlY} #{toX} #{toY}" : "M#{fromX} #{fromY}L#{toX} #{toY}";
		
		var inter = {
			fromX: this.getRelativePosition(from.x, 'width'), 
			fromY: this.getRelativePosition(from.y, 'height'), 
			toX: this.getRelativePosition(to.x, 'width'), 
			toY: this.getRelativePosition(to.y, 'height')
		}
		
		inter.controlX = inter.fromX + (inter.toX - inter.fromX)/2 + (inter.toY - inter.fromY) * options.controlRatio;
		inter.controlY = inter.fromY + (inter.toY - inter.fromY)/2 + (inter.toX - inter.fromX) * options.controlRatio * -1;
		
		var attr = {stroke: options.color, "stroke-width": options.strokeWidth, "stroke-linejoin": options.lineJoin};
		pathStr = path.interpolate(inter);
		path = this.raphael.path(pathStr);
		path.attr(attr);
		
		if (options.arrow)
		{
			path = "M#{toX} #{toY}L#{a1X} #{a1Y}L#{a2X} #{a2Y}L#{toX} #{toY}";
			var angle = Math.atan2(inter.toY - inter.fromY, inter.toX - inter.fromX);
			var angle1 = angle + Math.PI / 8;
			var angle2 = angle - Math.PI / 8;
			var inter = Object.extend(inter, {
				a1X: Math.round(inter.toX - Math.cos(angle1) * options.arrowSize),
				a1Y: Math.round(inter.toY - Math.sin(angle1) * options.arrowSize),
				a2X: Math.round(inter.toX - Math.cos(angle2) * options.arrowSize),
				a2Y: Math.round(inter.toY - Math.sin(angle2) * options.arrowSize)
			});
			
			pathStr = path.interpolate(inter);
			path = this.raphael.path(pathStr);
			attr.fill = options.color;
			path.attr(attr);
		}
	},
	
	drawBox: function (position, text, options)
	{
		options = Object.extend({
			stroke_color: "#000000",
			text_color:  "#000000",
			fill_color: "#FFFFFF", 
			padding_x: 10,
			padding_y: 7,
			font_size: 14,
			corner_radius: 6,
			width: null,
			height: null
		}, options || {});
		
		t = this.raphael.text(0, 0, text);
		t.attr({"font-size": 14});
				
		var dim = {
			x: this.getRelativePosition(position.x, 'width'),
			y: this.getRelativePosition(position.y, 'height'),
			width: t.getBBox().width + options.padding_x * 2,
			height: t.getBBox().height + options.padding_y * 2
		}
		
		t.attr({x: dim.x, y: dim.y});
		
		r = this.raphael.rect(dim.x - dim.width/2, dim.y - dim.height/2, options.width || dim.width, options.height || dim.height, options.corner_radius);
		r.attr({stroke:options.stroke_color, "fill-opacity": 1, fill: options.fill_color});
		t.insertAfter(r);
		
		return [r, t];
	}
});

TS.AIMap = Class.create(TS, {
	initialize: function ($super, container, config_url, options)
	{
		$super();
		
		this.options = Object.extend({
			engine: "Canvas"
		}, options || {});		
		
		this.config_url	= config_url;
		this.container	= $(container);
		this.layers		= {};
		this.graphics	= {};
		this.color		= new TS.Color();
		this.size = {width: this.container.getWidth(), height: this.container.getHeight()};
		
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
		$A(['background', 'paths', 'nodes', 'moves', 'players', 'info']).each(function(layer) {
			this.layers[layer] = new TS[this.options.engine](this.container, {x:0, y:0}, {width: this.size.width,  height: this.size.height});
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
	getLayer: function (layer)
	{
		return this.layers[layer] ? this.layers[layer] : null;	
	},
	
	// Called every time a new turn happens
	onTurn: function (turn)
	{
		if (turn)
		{
			if (turn.states)
			{
				turn.states.each(function(nodeState) {
					var node = this.nodeGraph.nodes[nodeState.node_id];
					node.setSoldiers(nodeState.player_id, nodeState.number_of_soldiers);
				}, this);
			}
		}
		
		this.draw(['moves', 'players'], turn);
	}, 
	
	// Draws the layers to the screen
	draw: function (drawableLayers, turn)
	{
		turn = turn || {};
		drawableLayers = $A(drawableLayers);
		
		drawableLayers.each(function (layer){
			this.getLayer(layer).clear();
		}, this);
		
		if (drawableLayers.include('moves') && turn.moves)
		{
			Object.keys(turn.moves).each(function (move) {
				this.drawMove(turn.moves[move]);
			}, this);
		}
		
		Object.keys(this.nodeGraph.nodes).each(function(nodeId) {
			
			var node = this.nodeGraph.nodes[nodeId];
			
			// Draw nodes only if necessary (1st time)		
			if (drawableLayers.include('nodes'))
			{
				var img = this.graphics.nodes[node.type];
				// Draw Nodes
				this.getLayer('nodes').image(img, node.position);
			}
			
			// Draw paths only if necessary (1st time)
			if (drawableLayers.include('paths'))
			{
				node.links.each(function(otherNodeId) {
					var to = this.nodeGraph.nodes[otherNodeId];
					
					this.getLayer('paths').drawArrow(
						node.position, 
						to.position,
						{
							arrow: this.nodeGraph.directed,
							color: this.config.infos.path_color || "#444444"
						}
					);
				}, this);
			}
			
			if (drawableLayers.include('players') && node.nbSoldiers || node.playerId != null)
			{
				this.getLayer('players').drawBox( 
					node.position, 
					node.nbSoldiers, 
					{
						fill_color: this.getPlayerColor(node.playerId)
					}
				);
			}
		}, this);
		
		if (drawableLayers.include('players') && turn.spawns)
		{
			turn.spawns.each(function(spawn){
				var node = this.nodeGraph.nodes[spawn.node_id];
				
				paths = this.getLayer('players').drawBox(
					node.position,
					"+" + spawn.number_of_soldiers,
					{
						fill_color: this.getPlayerColor(spawn.player_id)
					}
				);
			}, this);
		}
	},
	
	drawMove: function (move)
	{
		var layer = this.getLayer("players");
		var nodeFrom = this.nodeGraph.nodes[move.from];
		var nodeTo = this.nodeGraph.nodes[move.to];
		
		layer.drawArrow(
			nodeFrom.position,
			nodeTo.position,
			{
				color: this.getPlayerColor(move.player_id),
				bezier: true,
				arrow: true
			}
		);
		
		layer.drawBox(
			{
				x: nodeFrom.position.x + (nodeTo.position.x - nodeFrom.position.x)*.75,
				y: nodeFrom.position.y + (nodeTo.position.y - nodeFrom.position.y)*.75
			},
			move.number_of_soldiers,
			{
				fill_color: this.getPlayerColor(move.player_id)
			}
		);
	},

	getPlayerColor: function (playerId)
	{
		if (!playerId || playerId < 0)
		{
			return "#CCCCCC";
		}
		return this.color.getColor(this.getPlayerIndex(playerId) + 1);
	},
	
	getPlayerIndex: function (playerId)
	{
		if (this.players)
		{
			for (i = 0; i < this.players.length; i++)
			{
				if (this.players[i].id == playerId) 
				{
					return i;
				}
			}
		}
		
		return -1;
	},
	
	getPlayerInfo: function (playerId)
	{
		var info = {
			soldiers: 0, 
			city: 0,
			id: playerId,
			nodePoints: 0,
			color: this.getPlayerColor(playerId), 
			name: this.players[this.getPlayerIndex(playerId)].name
		};
		
		Object.keys(this.nodeGraph.nodes).each(function(nodeId) {
			var node = this.nodeGraph.nodes[nodeId];
		
			if (node.playerId == playerId)
			{
				if (!info[node.type])
					info[node.type] = 0;
				
				info.nodePoints += 1
				info[node.type] += 1;
				info.soldiers += node.nbSoldiers;
			}
		}, this);
		 
		return info;
	}
});

TS.AIPlayback = Class.create(TS, {
	initialize: function ($super, containers, map_url, game_description_url)
	{
		$super();
		this.turnNumber = 0;
		this.template = '<li><div class="color-box" style="background-color: #{color};"></div><span>#{name}: #{city}, #{soldiers}</span></li>';
		this.map = new TS.AIMap(containers.map, map_url);
		this.map.observe('ready', this.onMapReady.bindAsEventListener(this));
		this.ready = {map:false, self:false};
		this.controls = $(containers.controls);
		this.buttons = ["rewind", "back", "play", "pause", "next", "end"];
		this.buttons.each(function (control) {
			this[control] = this.controls.down("#" + control);
			this[control].observe("click", this["on" + control.capitalize()].bindAsEventListener(this));
		}, this);
		
		TS.Keyboard.registerCallback(" ", [], this.togglePlayPause.bind(this));
		TS.Keyboard.registerCallback(Event.KEY_LEFT, [], this.onBack.bindAsEventListener(this));
		TS.Keyboard.registerCallback(Event.KEY_RIGHT, [], this.onNext.bindAsEventListener(this));
		
		this.timer = new TS.Timer();
		this.timer.observe("timer", this.onTimer.bind(this));
		
		this.playerList = $(containers.player_list);
		this.progressBar = $(containers.progress_bar);
		
		this.enableControls();
		
		new Ajax.Request( game_description_url, {method: 'get', onComplete: this.onGameDescriptionLoaded.bindAsEventListener(this)});
	},
	
	togglePlayPause: function (e)
	{
		e.stop();
		this.timer.isRunning()? this.onPause() : this.onPlay();
	},
	
	onRewind: function (e)
	{
		this.onPause();
		this.turnNumber = 0;
		this.drawCurrentTurn();
	},
	
	onBack: function (e)
	{
		e.stop();
		this.onPause();
		this.turnNumber--;
		this.drawCurrentTurn();
	},
	
	onPlay: function (e)
	{
		if (this.turnNumber >= this.getMaxTurn())
		{
			this.turnNumber = 0;
		}
		
		this.start();
		this.enableControls();
	},
	
	onPause: function ()
	{
		this.stop();
		this.enableControls();
	},
	
	onNext: function (e)
	{
		e.stop();
		this.onPause();
		this.turnNumber++;
		this.drawCurrentTurn();
	},
	
	onEnd: function (e)
	{
		this.turnNumber = this.getMaxTurn();
		this.drawCurrentTurn();
	},
	
	drawCurrentTurn: function ()
	{
		if (this.turnNumber < 0) this.turnNumber = 0;
		if (this.turnNumber > this.getMaxTurn()) this.turnNumber = this.getMaxTurn();
		var mapTurn = this.getTurnAt(this.turnNumber);
		
		this.map.onTurn(mapTurn);
		this.enableControls();
		this.updatePlayerList();
		this.updateProgress();
	},
	
	updateProgress: function ()
	{
		this.progressBar.setStyle("width: #{percent}%".interpolate({percent: this.turnNumber/this.getMaxTurn() * 100}));
	},
	
	updatePlayerList: function ()
	{
		this.playerList.update();
		var playerInfos = this.gameDescription.infos.players.collect(function(player) {
			return this.map.getPlayerInfo(player.id);
		}, this).sortBy(function(infos){
			return infos.cities;
		}).reverse().each(function(infos){
			this.playerList.insert(this.template.interpolate(infos));
		}, this);
	},
	
	getMaxTurn: function ()
	{
		if (!this.maxTurns)
		{
			this.maxTurns = Object.keys(this.gameDescription.turns).length * TS.AIPlayback.RENDERING_STAGES.length;
			
			while (null == this.getTurnAt(this.maxTurns) || Object.keys(this.getTurnAt(this.maxTurns)).length == 0)
			{
				this.maxTurns--;
			}
		}
		return this.maxTurns;
	},
	
	getTurnAt: function (index)
	{
		var key = Object.keys(this.gameDescription.turns).sortBy(function(e){
			return parseInt(e);
		})[Math.floor(index/TS.AIPlayback.RENDERING_STAGES.length)];
		var stage = TS.AIPlayback.RENDERING_STAGES[index % TS.AIPlayback.RENDERING_STAGES.length];
		var turn = this.gameDescription.turns[key];
		var renderable_turn;

		if (turn && turn[stage])
		{
			renderable_turn = {};
			renderable_turn[stage] = turn[stage];
		}
		return renderable_turn;
	},
	
	onMapReady: function ()
	{
		this.ready.map = true;
		if (this.isReady())
		{
			this.enableControls();
		}
	},
	
	enableControls: function ()
	{
		this.buttons.each(function(control){
			this[control].disabled = this.isReady() ? "" : "disabled";
		},this);
		
		this.play[this.timer.isRunning() ? "hide" : "show"]();
		this.pause[this.timer.isRunning() ? "show" : "hide"]();
		
		if (this.turnNumber == 0)
		{
			this.back.disabled = "disabled";
			this.rewind.disabled = "disabled";
		} else if (this.turnNumber >= this.getMaxTurn())
		{
			this.next.disabled = "disabled";
			this.end.disabled = "disabled;"
		}
	},
	
	onGameDescriptionLoaded: function (request)
	{
		this.ready.self = true;
		
		this.gameDescription = request.responseText.evalJSON();
		
		this.map.players = this.gameDescription.infos.players;
		this.enableControls();
		if (this.isReady())
		{
			this.drawCurrentTurn();
		}
	},
	
	isReady: function ()
	{
		return $H(this.ready).all();
	},
	
	stop: function ()
	{
		this.timer.stop();
	},
	
	start: function ()
	{
		this.timer.start(500, -1);
	},
	
	onTimer: function ()
	{
		this.drawCurrentTurn();
		
		if (this.timer.isRunning() && this.getMaxTurn() >= this.turnNumber)
		{
			this.turnNumber++;
		} else
		{
			this.timer.stop();
		}
		this.enableControls();
	}
});

Object.extend(TS.AIPlayback, {
	RENDERING_STAGES: ['states', 'moves', 'spawns']
});
