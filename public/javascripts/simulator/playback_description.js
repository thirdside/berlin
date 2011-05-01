/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */

 TS.PlaybackDescription = Class.create(TS, {
 	initialize: function (mapDescription, map, gameDescription, canvas, graphics)
	{
		this.mapDescription = mapDescription;
		this.map = map;
		this.gameDescription = gameDescription;
		this.canvas = canvas;
		this.graphics = graphics;
		
		this.color = new TS.Color();
		
		this.turns = new Array();
		this.preview = null;
		this.currentTurn = 0;
		this.direction = 'forward';
		
		this.players = null;
		
		this.simulatioGameRatio = 5;
	},
	
	/*
	 * Initialize the turns object with all the steps necessary
	 * to draw the game replay on the screen
	 */
	initializeTurns: function ()
	{
		// process each turn of the game description
		Object.keys(this.gameDescription.turns).each(function(turnId) {
			var turn = this.gameDescription.turns[turnId];
			var result = null;
			
			this.map.syncStates(turn.states_pre);
			this.map.syncCombats(turn.moves);
			
			this.turns.push(this._processStates(turn.states_pre));
			this.turns.push(this._processMoves(turn.moves, turn.states_pre));
			this.turns.push(this._processCombats(turn.moves, turn.states_pre));
			
			this.map.syncStates(turn.states_post);
			
			this.turns.push(this._processStates(turn.states_post));
			
			this._processSpawns(turn.spawns, turn.states_post);
		}, this);
		
		// prepare first turn
		this._setup(this.turns[0]);
	},
	
	/*
	 * Initialize the preview object with all the step necessary
	 * to draw the preview of the map on the screen
	 */
	initializePreview: function ()
	{
		this.preview = this._createTurn(['nodes']);
		this._setup(this.preview);
		this._processNodes(this.preview.layers['nodes']);
	},
	
	/*
	 * Setup the first turn to:
	 * - draw the background
	 * - draw the paths
	 */
	_setup: function (turn)
	{
		var nextId = 0;
		var layer = null;
		var object = null;
		var animations = null;
		
		// setup the background
		layer = this._createLayer();
		
		object = this._createBackgroundObject(nextId, this.mapDescription.infos['tile_background'] || true);
		animations = this._createBackgroundAnimations(object);
		layer.objects.push(object);
		layer.forward_arrival[nextId] = animations['forward_arrival'];
		layer.forward_departure[nextId] = animations['forward_departure'];
		layer.backward_arrival[nextId] = animations['backward_arrival'];
		layer.backward_departure[nextId] = animations['backward_departure'];
		
		turn.layers['background'] = layer;
		
		nextId++;
		
		// setup the paths
		layer = this._createLayer();
		
		Object.keys(this.map.nodes).each(function(nodeId) {
			var node = this.map.nodes[nodeId];
			
			node.links.each(function(link) {
				object = this._createPathObject(nextId, nodeId, link.toId);
				animations = this._createPathAnimations(object);
				
				layer.objects.push(object);
				layer.forward_arrival[nextId] = animations['forward_arrival'];
				layer.forward_departure[nextId] = animations['forward_departure'];
				layer.backward_arrival[nextId] = animations['backward_arrival'];
				layer.backward_departure[nextId] = animations['backward_departure'];				
				
				nextId++;
			}, this);
		}, this);
		
		turn.layers['paths'] = layer;
		turn.layers['spawns'] = this._createLayer();
		turn.layers['combats'] = this._createLayer();
	},
	
	/*
	 * Process the moves of a turn
	 */
	_processMoves: function (moves, preStates)
	{
		var nextId = 0;
		
		var turn = this._createTurn(['moves']);
		
		var result = this._processStates(preStates);
		turn.layers['nodes'] = result.layers['nodes'];
		turn.layers['soldiers'] = result.layers['soldiers'];

		this.players = turn.players;
		
		$A(moves).each(function(data) {
			var moveObject = this._createMoveObject(nextId, data.from, data.to, data.player_id, data.number_of_soldiers);
			nextId++;
			var moveTextObject = this._createMoveObject(nextId, data.from, data.to, data.player_id, data.number_of_soldiers);
			nextId++;
			
			moveTextObject.type = 'moveText';
			moveTextObject.rotate = false;
			
			var layer = turn.layers['moves'];
			
			layer.objects.push(moveObject);
			layer.objects.push(moveTextObject);
			
			var moveAnimations = this._createMoveAnimations(moveObject);
			
			layer.forward_arrival[moveObject.id] = moveAnimations['forward_arrival'];
			layer.forward_departure[moveObject.id] = moveAnimations['forward_departure'];
			layer.backward_arrival[moveObject.id] = moveAnimations['backward_arrival'];
			layer.backward_departure[moveObject.id] = moveAnimations['backward_departure'];
			
			//todo: omg
			var moveTextAnimations = this._createMoveAnimations(moveTextObject);

			layer.forward_arrival[moveTextObject.id] = moveTextAnimations['forward_arrival'];
			layer.forward_departure[moveTextObject.id] = moveTextAnimations['forward_departure'];
			layer.backward_arrival[moveTextObject.id] = moveTextAnimations['backward_arrival'];
			layer.backward_departure[moveTextObject.id] = moveTextAnimations['backward_departure'];

			
			//decrement the number of soldiers on the starting node
			$A(turn.layers['soldiers'].objects).each(function(soldier) {
				if (soldier.node == data.from) {
					turn.layers['soldiers'].forward_arrival[soldier.id].start.count -= data.number_of_soldiers;
					turn.layers['soldiers'].backward_arrival[soldier.id].start.count = turn.layers['soldiers'].forward_arrival[soldier.id].start.count;
				}
			}, this);
		}, this);
		
		return turn;
	},
	
	
	/*
	 * Process the combats of a turn
	 */
	_processCombats: function (moves, preStates)
	{
		var nextId = 0;
		
		var turn = this._createTurn(['combats']);
		
		var result = this._processStates(preStates);
		turn.layers['nodes'] = result.layers['nodes'];
		turn.layers['soldiers'] = result.layers['soldiers'];

		this.players = turn.players;
		
		var layer = turn.layers['combats'];
		
		$A(moves).each(function(data) {
			var fromNode = this.map.nodes[data.from];
			var toNode = this.map.nodes[data.to];
			
			var combatObject = this._createCombatObject(nextId, data.from, data.to, data.number_of_soldiers);
			
			// add a commentary on the move
			if (this.map.getNodeCaptured(data.to)) {
				combatObject.text = "captured!";
				combatObject.textAttrs.fill = this._getPlayerColor(this.map.nodes[data.from].playerId);
			} else if (this.map.getNodeReinforced(data.to)) {
				combatObject.text = "reinforced!";
				combatObject.textAttrs.fill = this._getPlayerColor(this.map.nodes[data.from].playerId);					
			} else if (this.map.getNodeSuicide(data.to)) {
				combatObject.text = "suicide!";
				combatObject.textAttrs.fill = this._getPlayerColor(this.map.nodes[data.from].playerId);										
			}

			layer.objects.push(combatObject);
			
			var combatAnimations = this._createCombatAnimations(combatObject);
			
			layer.forward_arrival[combatObject.id] = combatAnimations['forward_arrival'];
			layer.forward_departure[combatObject.id] = combatAnimations['forward_departure'];
			layer.backward_arrival[combatObject.id] = combatAnimations['backward_arrival'];
			layer.backward_departure[combatObject.id] = combatAnimations['backward_departure'];
			
			nextId++;
			
			//- decrement the number of soldiers on the starting node
			//- increment the number of soldiers on the ending node (if the same player or no player)
			$A(turn.layers['soldiers'].objects).each(function(soldier) {
				if (soldier.node == data.from) {
					turn.layers['soldiers'].forward_arrival[soldier.id].start.count -= data.number_of_soldiers;
					turn.layers['soldiers'].backward_arrival[soldier.id].start.count = turn.layers['soldiers'].forward_arrival[soldier.id].start.count;
				}
				
				if ((soldier.node == data.to && this.map.nodes[soldier.node].playerId == this.map.nodes[data.from].playerId) ||
				    (soldier.node == data.to && this.map.nodes[soldier.node].playerId == null))
				{
					turn.layers['soldiers'].forward_arrival[soldier.id].start.count += data.number_of_soldiers;
					turn.layers['soldiers'].backward_arrival[soldier.id].start.count = turn.layers['soldiers'].forward_arrival[soldier.id].start.count;
				}
			}, this);
			
			// announce capture
			$A(turn.layers['nodes'].objects).each(function(node) {
				if (node.node == data.to && this.map.nodes[data.to].playerId == null) {
					turn.layers['nodes'].forward_arrival[node.id].start.color = this._getPlayerColor(this.map.nodes[data.from].playerId);
					turn.layers['nodes'].backward_arrival[node.id].start.color = turn.layers['nodes'].forward_arrival[node.id].start.color;
				}
			}, this);
		}, this);
		
		return turn;
	},	
	
	_processStates: function (states)
	{
		var turn = this._createTurn(['nodes', 'soldiers']);
		
		this.players = turn.players;
		
		// prepare the nodes and cities
		this._processNodes(turn.layers['nodes']);

		// prepare the soldiers counts
		var nextId = 0;

		$A(states).each(function(data) {
			var soldiersObject = this._createSoldiersObject(nextId++, data.node_id, data.number_of_soldiers);
			
			var layer = turn.layers['soldiers'];
			
			layer.objects.push(soldiersObject);
			
			var soldiersAnimations = this._createSoldiersAnimations(soldiersObject);
			
			layer.forward_arrival[soldiersObject.id] = soldiersAnimations['forward_arrival'];
			layer.forward_departure[soldiersObject.id] = soldiersAnimations['forward_departure'];
			layer.backward_arrival[soldiersObject.id] = soldiersAnimations['backward_arrival'];
			layer.backward_departure[soldiersObject.id] = soldiersAnimations['backward_departure'];
			
			nextId++;
		}, this);
		
		return turn;	
	},

	/*
	 * Process the nodes and the cities
	 */	
	_processNodes: function (layer)
	{
        var nextId = 0;
		var nodeObject = null;
		var nodeAnimations = null;

		Object.keys(this.map.nodes).each(function(nodeId) {
			var node = this.map.nodes[nodeId];
				
			if (node.type == 'node') {
				nodeObject = this._createNodeObject(nextId, node);
				nodeAnimations = this._createNodeAnimations(nodeObject, node);
			}
			
			else if (node.type == 'city') {
				nodeObject = this._createCityObject(nextId, node);
				nodeAnimations = this._createCityAnimations(nodeObject, node);
			}

			layer.objects.push(nodeObject);

			layer.forward_arrival[nodeObject.id] = nodeAnimations['forward_arrival'];
			layer.forward_departure[nodeObject.id] = nodeAnimations['forward_departure'];
			layer.backward_arrival[nodeObject.id] = nodeAnimations['backward_arrival'];
			layer.backward_departure[nodeObject.id] = nodeAnimations['backward_departure'];
			
			nextId++;	
		}, this);
	},
	
	_processSpawns: function (spawns, preStates)
	{
		var nextId = 0;
		
		var turn = this._createTurn(['spawns']);

		var result = this._processStates(preStates);
		turn.layers['nodes'] = result.layers['nodes'];
		turn.layers['soldiers'] = result.layers['soldiers'];
		turn.layers['moves'] = this._createLayer();
		turn.layers['combats'] = this._createLayer();
		
		
		this.players = turn.players;
		
		$A(spawns).each(function(data) {
			var spawnObject = this._createSpawnObject(nextId, data.node_id, data.number_of_soldiers);
			
			var layer = turn.layers['spawns'];
				
			layer.objects.push(spawnObject);
			
			var spawnAnimations = this._createSpawnAnimations(spawnObject);
			
			layer.forward_arrival[spawnObject.id] = spawnAnimations['forward_arrival'];
			layer.forward_departure[spawnObject.id] = spawnAnimations['forward_departure'];
			layer.backward_arrival[spawnObject.id] = spawnAnimations['backward_arrival'];
			layer.backward_departure[spawnObject.id] = spawnAnimations['backward_departure'];
			
			//increment the number of soldiers
			$A(turn.layers['soldiers'].objects).each(function(soldier) {
				if (soldier.node == data.node_id) {
					turn.layers['soldiers'].forward_departure[soldier.id].start.count += data.number_of_soldiers;
					turn.layers['soldiers'].backward_departure[soldier.id].start.count = turn.layers['soldiers'].forward_departure[soldier.id].start.count;
				}
			}, this);
			
			nextId++;
		}, this);
		
		this.turns.push(turn);
	},
	
	/*
	 * Create a soldiers object
	 */
	_createSoldiersObject: function (id, node, count)
	{
		var object =
		{
			'id': id,
			'type': 'soldiers',
			'node': node,
			'position': this._getNodePosition(node),
			'count': count
		};
		
		return object;
	},
	
	/*
	 * Create soldiers animations
	 */
	_createSoldiersAnimations: function (soldierObject)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start':
				{
					'x': soldierObject.position.x,
					'y': soldierObject.position.y,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF',
					'count': soldierObject.count
				},
				
				'end': {},
				'length': 0
			},
			
			'forward_departure':
			{
				'start':
				{
					'x': soldierObject.position.x,
					'y': soldierObject.position.y,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF',
					'count': soldierObject.count
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_arrival':
			{
				'start':
				{
					'x': soldierObject.position.x,
					'y': soldierObject.position.y,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF',
					'count': soldierObject.count
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_departure':

			{
				'start':
				{
					'x': soldierObject.position.x,
					'y': soldierObject.position.y,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF',
					'count': soldierObject.count
				},
				
				'end': {},
				'length': 0
			}			
		};

		return animations;
	},
	
	/*
	 * Create a spawn object
	 */
	_createSpawnObject: function (id, node, count)
	{
		var object =
		{
			'id': id,
			'type': 'spawn',
			'position': this._getNodePosition(node),
			'count': '+' + count
		};
		
		return object;
	},
	
	/*
	 * Create spawn animations
	 */
	_createSpawnAnimations: function (spawnObject)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y,
					'opacity': 0,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
				},
				
				'end':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 15,
					'opacity': 1
				},
				
				'length': 500
			},
			
			'forward_departure':
			{
				'start':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 15,
					'opacity': 1,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
				},
				
				'end':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 30,
					'opacity': 0
				},
				
				'length': 500
			},
			
			'backward_arrival':
			{
				'start':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 30,
					'opacity': 0,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
				},
				
				'end':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 15,
					'opacity': 1
				},
				
				'length': 500
			},
			
			'backward_departure':
			{
				'start':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 15,
					'opacity': 1,
					'font': 'Symbol',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
				},
				
				'end':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y,
					'opacity': 0
				},
				
				'length': 500
			}			
		};

		return animations;
	},
	
	/*
	 * Create a move object
	 */
	_createMoveObject: function (id, from, to, playerId, count)
	{
		var object =
		{
			'id': id,
			'type': 'move',
			'count': count,
			'countAttrs': {
				'font': 'Symbol',
				'fontWeight': 'bold',
				'fontSize': 20,
				'fill': '#000000',
				'blurColor': '#FFFFFF'
			},
			'color': this.players[playerId].color,
			'radius': 10,
			'rotate': true,
			'from': this._getNodePosition(from),
			'to': this._getNodePosition(to)
		};
		
		var link = this.map.nodes[from].getLink(to);
		var backPointer = false;
		
		if (link == null) {
			link = this.map.nodes[to].getLink(from);
			backPointer = true;	
		}
		
		object['controlRatio'] = this._getQuadraticCurvePoint(
			backPointer? object.to : object.from,
			backPointer? object.from: object.to,
			link.controlRatio);	
		
		return object;
	},
	
	/*
	 * Create move animations
	 */
	_createMoveAnimations: function (moveObject)
	{
		var img = (moveObject.from.x > moveObject.to.x) ? this.graphics.army1 : this.graphics.army1_backward;
		
		var animations =
	
		{
			'forward_arrival':
			{
				'start': {
					'opacity': 0,
					'x': moveObject.from.x,
					'y': moveObject.from.y,
					'img': img
				},
				'end': {
					'opacity': 1,
					'animateAlong': {
						'start': 0,
						'end': 0.4,
						'path': "M #{from.x} #{from.y} Q #{controlRatio.x} #{controlRatio.y} #{to.x} #{to.y}".interpolate(moveObject),
						'rotate': moveObject.rotate
					}
				},
				'length': 500
			},
			
			'forward_departure':
			{
				'start': {
					'opacity': 1,
					'setPositionFromPath': {
						'at': 0.4,
						'path': "M #{from.x} #{from.y} Q #{controlRatio.x} #{controlRatio.y} #{to.x} #{to.y}".interpolate(moveObject)
					},
					'img': img
				},
				'end': {
					'opacity': 0,
					'animateAlong': {
						'start': 0.4,
						'end': 1,
						'path': "M #{from.x} #{from.y} Q #{controlRatio.x} #{controlRatio.y} #{to.x} #{to.y}".interpolate(moveObject),
						'rotate': moveObject.rotate
					}
				},
				'length': 500
			},
			
			'backward_arrival':
			{
				'start': {
					'opacity': 0,
					'setPositionFromPath': {
						'at': 1,
						'path': "M #{from.x} #{from.y} Q #{controlRatio.x} #{controlRatio.y} #{to.x} #{to.y}".interpolate(moveObject)
					},
					'img': img
				},
				'end': {
					'opacity': 1,
					'animateAlong': {
						'start': 1,
						'end': 0.6,
						'path': "M #{to.x} #{to.y} Q #{controlRatio.x} #{controlRatio.y} #{from.x} #{from.y}".interpolate(moveObject),
						'rotate': moveObject.rotate
					}					
				},
				'length': 500
			},
			
			'backward_departure':
			{
				'start': {
					'opacity': 1,
					'setPositionFromPath': {
						'at': 0.4,
						'path': "M #{from.x} #{from.y} Q #{controlRatio.x} #{controlRatio.y} #{to.x} #{to.y}".interpolate(moveObject)
					},
					'img': img
				},
				'end': {
					'opacity': 0,
					'animateAlong': {
						'start': 0.6,
						'end': 1,
						'path': "M #{to.x} #{to.y} Q #{controlRatio.x} #{controlRatio.y} #{from.x} #{from.y}".interpolate(moveObject),
						'rotate': moveObject.rotate
					}	
				},
				'length': 500
			}			
		};

		return animations;
	},
	
	/*
	 * Create a combat object
	 */
	_createCombatObject: function (id, from, to, count)
	{
		var defenderCount = this.map.nodes[to].nbSoldiers;
		
		var object =
		{
			'id': id,
			'type': 'combat',
			'text': '',
			'textAttrs': {
				'font': 'Symbol',
				'font-weight': 'normal',
				'font-size': 12,
				'fill': '#FFFFFF'
			},
			'attackerCount': count,
			'defenderCount': defenderCount,
			'position': this._getNodePosition(to)
		};
		
		object.textAttrs.y = object.position.y - 30;
		
		return object;
	},
	
	/*
	 * Create combat animations
	 */
	_createCombatAnimations: function (combatObject)
	{
		var animations =
		{
			'forward_arrival':
			{
				'start': {
					'x': combatObject.position.x,
					'y': combatObject.position.y,
					'img': this.graphics.combat,
					'scale': '1, 1',
					'opacity': 1
				},
				'end': {
					'scale': '0.5, 0.5',
					'opacity': 1
				},
				'length': 500
			},
			
			'forward_departure':
			{
				'start': {
					'x': combatObject.position.x,
					'y': combatObject.position.y,
					'img': this.graphics.combat,
					'scale': '0.5, 0.5',
					'opacity': 1
				},
				'end': {
					'scale': '0.0001, 0.0001',
					'opacity': 0
				},
				'length': 500
			},
			
			'backward_arrival':
			{
				'start': {
					'x': combatObject.position.x,
					'y': combatObject.position.y,
					'img': this.graphics.combat,
					'scale': '0.0001, 0.0001',
					'opacity': 0
				},
				'end': {
					'scale': '0.5, 0.5',
					'opacity': 1
				},
				'length': 500
			},
			
			'backward_departure':
			{
				'start': {
					'x': combatObject.position.x,
					'y': combatObject.position.y,
					'img': this.graphics.combat,
					'scale': '0.5, 0.5',
					'opacity': 1
				},
				'end': {
					'scale': '1, 1',
					'opacity': 0
				},
				'length': 500
			}			
		};

		return animations;
	},		
	
	/*
	 * Create a node object
	 */
	_createNodeObject: function (id, node)
	{
		var object =
		{
			'id': id,
			'type': 'node',
			'node': node.id,
			'position': this._getNodePosition(node.id)
		};
		
		return object;
	},
	
	/*
	 * Create a node animations
	 */
	_createNodeAnimations: function (nodeObject, node, bypassColor)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.node.width / 2,
					'y': nodeObject.position.y - this.graphics.node.height / 2,
					'img': this.graphics.node,
					'width': this.graphics.node.width,
					'height': this.graphics.node.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'radius': 10
				},
				
				'end': {},
				'length': 0
			},
			
			'forward_departure':
			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.node.width / 2,
					'y': nodeObject.position.y - this.graphics.node.height / 2,
					'img': this.graphics.node,
					'width': this.graphics.node.width,
					'height': this.graphics.node.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'radius': 10
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_arrival':
			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.node.width / 2,
					'y': nodeObject.position.y - this.graphics.node.height / 2,
					'img': this.graphics.node,
					'width': this.graphics.node.width,
					'height': this.graphics.node.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'radius': 10
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_departure':

			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.node.width / 2,
					'y': nodeObject.position.y - this.graphics.node.height / 2,
					'img': this.graphics.node,
					'width': this.graphics.node.width,
					'height': this.graphics.node.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'radius': 10
				},
				
				'end': {},
				'length': 0
			}			
		};

		return animations;
	},
	
	/*
	 * Create a city object
	 */
	_createCityObject: function (id, node)
	{
		var object =
		{
			'id': id,
			'type': 'city',
			'node': node.id,
			'position': this._getNodePosition(node.id)
		};
		
		return object;
	},
	
	/*
	 * Create city animations
	 */
	_createCityAnimations: function (nodeObject, node)
	{
		var img = (node.layout == 0) ? this.graphics.city1 :
		          (node.layout == 1) ? this.graphics.city2 : this.graphics.city3;
		
		var animations =
		{
			'forward_arrival':
			{
				'start':
				{
					'x': nodeObject.position.x - img.width / 2,
					'y': nodeObject.position.y - img.height / 2,
					'img': img,
					'width': img.width,
					'height': img.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'layout': node.layout,
					'radius': 7.5,
					'spacing': 1.8
				},
				
				'end': {},
				'length': 0
			},
			
			'forward_departure':
			{
				'start':
				{
					'x': nodeObject.position.x - img.width / 2,
					'y': nodeObject.position.y - img.height / 2,
					'img': img,
					'width': img.width,
					'height': img.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'layout': node.layout,
					'radius': 7.5,
					'spacing': 1.8
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_arrival':
			{
				'start':
				{
					'x': nodeObject.position.x - img.width / 2,
					'y': nodeObject.position.y - img.height / 2,
					'img': img,
					'width': img.width,
					'height': img.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'layout': node.layout,
					'radius': 7.5,
					'spacing': 1.8
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_departure':

			{
				'start':
				{
					'x': nodeObject.position.x - img.width / 2,
					'y': nodeObject.position.y - img.height / 2,
					'img': img,
					'width': img.width,
					'height': img.height,
					'color': (node.playerId) ? this._getPlayerColor(node.playerId) : '#FFFFFF',
					'layout': node.layout,
					'radius': 7.5,
					'spacing': 1.8
				},
				
				'end': {},
				'length': 0
			}			
		};

		return animations;
	},
	
	/*
	 * Create a background object
	 */
	_createBackgroundObject: function (id, tile)
	{
		var object =
		{
			'id': id,
			'type': 'background',
			'img': this.graphics.background,
			'tile': tile
		};
		
		return object;
	},
	
	/*
	 * Create background animations
	 */
	_createBackgroundAnimations: function (backgroundObject)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start': {},			
				'end': {},				
				'length': 0
			},
			
			'forward_departure':
			{
				'start': {},			
				'end': {},				
				'length': 0
			},
			
			'backward_arrival':
			{
				'start': {},			
				'end': {},				
				'length': 0
			},
			
			'backward_departure':
			{
				'start': {},			
				'end': {},				
				'length': 0
			}			
		};

		return animations;
	},	
	
	/*
	 * Create a path object
	 */
	_createPathObject: function (id, from, to)
	{
		var object =
		{
			'id': id,
			'type': 'path',
			'from': this._getNodePosition(from),
			'to': this._getNodePosition(to)
		};
		
		var link = this.map.nodes[from].getLink(to) || this.map.nodes[to].getLink(from);
		
		object['controlRatio'] = this._getQuadraticCurvePoint(object.from, object.to, link.controlRatio);
		
		return object;
	},	
	
	/*
	 * Create background animations
	 */
	_createPathAnimations: function (pathObject)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start': {},			
				'end': {},				
				'length': 0
			},
			
			'forward_departure':
			{
				'start': {},			
				'end': {},				
				'length': 0
			},
			
			'backward_arrival':
			{
				'start': {},			
				'end': {},				
				'length': 0
			},
			
			'backward_departure':
			{
				'start': {},			
				'end': {},				
				'length': 0
			}			
		};

		return animations;
	},	
	
	/*
	 * Obtain the absolute position of a node
	 */
	_getNodePosition: function (nodeId)
	{
		return this.canvas.getAbsolutePosition(this.map.nodes[nodeId].position);
	},
	
	/*
	 * Create a new empty turn
	 */
	_createTurn: function (layers)
	{
		var turn = {
			'players': (this.gameDescription == null) ? null : this._getPlayersStates(this.gameDescription.infos.number_of_players),
			'layers': {}
		};
		
		$A(layers).each(function(layer) {
			turn.layers[layer] = this._createLayer();
		}, this);
		
		return turn;
	},
	
	/*
	 * Create a layer data object
	 */
	_createLayer: function()
	{
		var layer = {
			objects: new Array(),
			forward_arrival: {},
			forward_departure: {},
			backward_arrival: {},
			backward_departure: {}
		};
		
		return layer;
	},
	
	/*
	 * Get the player's color (for a known player)
	 */
	_initPlayerColor: function (playerId)
	{
		var color = '#FFFFFF';
		
		switch (playerId)
		{
			case 0: color = '#bd1550'; break;
			case 1: color = '#e97f02'; break;
			case 2: color = "#73797b"; break;
			case 3: color = "#e32424"; break;
			case 4: color = "#21bbbd"; break;
			case 5: color = "#8a9b0f"; break;
		}
		
		return color;
	},
	
	/*
	 * 
	 */
	_getPlayerColor: function (playerId)
	{
		return (this.players == null || this.players[playerId] == null) ? '#FFFFFF' : this.players[playerId].color;
	},
	
	/*
	 * Initialize players data
	 */
	_initPlayers: function (playersInit)
	{
		var players = {};
		
		$A(playersInit).each(function(player) {
			players[player.id] = new TS.Player(player.id, this._initPlayerColor(player.id));
		}, this);
		
		return players;
	},

	/*
	 * Get the state of the players
	 */
	_getPlayersStates: function (nbPlayers)
	{
		// create the players
		var players = {};
		
		for (var i = 0; i < nbPlayers; i++)
			players[i] = new TS.Player(i, this._initPlayerColor(i));
				
		// synchronize the players with the map
		Object.keys(players).each(function(playerId) {
			var player = players[playerId];
			
			player.sync(this.map);
		}, this);
		
		return players;
	},
	
	/*
	 * Synchronize the state of the players
	 */
	_syncPlayers: function ()
	{
		Object.keys(this.players).each(function(playerId) {
			var player = this.players[playerId];
			
			player.sync(this.map);
		}, this);
	},
	
	/*
	 * Get the quadratic curve point
	 */
	_getQuadraticCurvePoint: function (from, to, ratio)
	{
		var data =
		{
			x: (from.x + (to.x - from.x) / 2 + (to.y - from.y) * ratio),
			y: (from.y + (to.y - from.y) / 2 + (to.x - from.x) * ratio * -1)
		};
		
		return data;
	},
	
	_getRotation: function (start, end)
	{
		// compute the angle
		var vector =
		{
			x: end.x - start.x,
			y: end.y - start.y
		}
		
		var angleRad = Math.atan2(vector.y, vector.x);
		
		return angleRad * (180 / Math.PI);
	}	
});