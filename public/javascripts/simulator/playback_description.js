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
		this.currentTurn = 0;
		this.direction = 'forward';
		
		this.players = null;
		
		// process each turn of the game description
		Object.keys(gameDescription.turns).each(function(turnId) {
			var turn = gameDescription.turns[turnId];
			
			this._syncMap(turn.states);
			
			this.players = turn.players = this._getPlayersStates(this.gameDescription.infos.players);
			
			this._processStates(turn.states_pre);
			this._processMoves(turn.moves);
			this._processStates(turn.states_post);
			this._processSpawns(turn.spawns);
		}, this);
	},
	
	/*
	 * Process the moves of a turn. Each move should output
	 * - an arrow followed by the number of soldiers moved
	 * - an animation of the arrow along the link path
	 */
	_processMoves: function(moves)
	{
		var nextId = 0;
		
		var turn = this._createTurn(['moves']);
		
		$A(moves).each(function(data) {
			var arrowObject = this._createArrowObject(nextId, data.from, data.to, data.player_id, data.number_of_soldiers);
			turn['moves'].objects.push(arrowObject);
			
			var arrowAnimations = this._createArrowAnimations(arrowObject);
			
			turn['moves'].forward_arrival[arrowObject.id] = arrowAnimations['forward_arrival'];
			turn['moves'].forward_departure[arrowObject.id] = arrowAnimations['forward_departure'];
			turn['moves'].backward_arrival[arrowObject.id] = arrowAnimations['backward_arrival'];
			turn['moves'].backward_departure[arrowObject.id] = arrowAnimations['backward_departure'];
			
			nextId++;	
		}, this);
		
		this.turns.push(turn);
	},
	
	_processStates: function (states)
	{
		var turn = this._createTurn(['nodes', 'soldiers']);
        var nextId;
		
		// prepare the nodes and cities
		nextId = 0;

		Object.keys(this.map.nodes).each(function(nodeId) {
			var node = this.map.nodes[nodeId];
			
			var nodeObject = null;
			var nodeAnimations = null;
			
			if (node.type == 'node') {
				nodeObject = this._createNodeObject(nextId, node);
				nodeAnimations = this._createNodeAnimations(nodeObject, node);
			}
			
			else if (node.type == 'city') {
				nodeObject = this._createCityObject(nextId, node);
				nodeAnimations = this._createCityAnimations(nodeObject, node);
			}
			
			turn['nodes'].objects.push(nodeObject);

			turn['nodes'].forward_arrival[nodeObject.id] = nodeAnimations['forward_arrival'];
			turn['nodes'].forward_departure[nodeObject.id] = nodeAnimations['forward_departure'];
			turn['nodes'].backward_arrival[nodeObject.id] = nodeAnimations['backward_arrival'];
			turn['nodes'].backward_departure[nodeObject.id] = nodeAnimations['backward_departure'];
			
			nextId++;	
		}, this);


		// prepare the soldiers counts
		nextId = 0;

		$A(states).each(function(data) {
			if (data.number_of_soldiers != 0) {
				var soldiersObject = this._createSoldiersObject(nextId++, data.node_id, data.number_of_soldiers);
				turn['soldiers'].objects.push(soldiersObject);
				
				var soldiersAnimations = this._createSoldiersAnimations(soldiersObject);
				
				turn['soldiers'].forward_arrival[soldiersObject.id] = soldiersAnimations['forward_arrival'];
				turn['soldiers'].forward_departure[soldiersObject.id] = soldiersAnimations['forward_departure'];
				turn['soldiers'].backward_arrival[soldiersObject.id] = soldiersAnimations['backward_arrival'];
				turn['soldiers'].backward_departure[soldiersObject.id] = soldiersAnimations['backward_departure'];
				
				nextId++;
			}		
		}, this);
		
		this.turns.push(turn);		
	},
	
	_processSpawns: function (spawns)
	{
		var nextId = 0;
		
		var turn = this._createTurn(['spawns']);
		
		$A(spawns).each(function(data) {
			var spawnObject = this._createSpawnObject(nextId, data.node_id, data.number_of_soldiers);
			turn['spawns'].objects.push(spawnObject);
			
			var spawnAnimations = this._createSpawnAnimations(spawnObject);
			
			turn['spawns'].forward_arrival[spawnObject.id] = spawnAnimations['forward_arrival'];
			turn['spawns'].forward_departure[spawnObject.id] = spawnAnimations['forward_departure'];
			turn['spawns'].backward_arrival[spawnObject.id] = spawnAnimations['backward_arrival'];
			turn['spawns'].backward_departure[spawnObject.id] = spawnAnimations['backward_departure'];
			
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
					'font': 'Lucida Console',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
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
					'font': 'Lucida Console',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
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
					'font': 'Lucida Console',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
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
					'font': 'Lucida Console',
					'fontWeight': 'bold',
					'fontSize': 20,
					'fill': '#000000',
					'blurColor': '#FFFFFF'
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
					'font': 'Lucida Console',
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
				
				'length': 250
			},
			
			'forward_departure':
			{
				'start':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 15,
					'opacity': 1,
					'font': 'Lucida Console',
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
				
				'length': 250
			},
			
			'backward_arrival':
			{
				'start':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 30,
					'opacity': 0,
					'font': 'Lucida Console',
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
				
				'length': 250
			},
			
			'backward_departure':
			{
				'start':
				{
					'x': spawnObject.position.x,
					'y': spawnObject.position.y - 15,
					'opacity': 1,
					'font': 'Lucida Console',
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
				
				'length': 250
			}			
		};

		return animations;
	},
	
	/*
	 * Create an arrow object
	 */
	_createArrowObject: function (id, from, to, playerId, count)
	{
		var object =
		{
			'id': id,
			'type': 'arrow',
			'count': count,
			'countAttrs': {
				'font': 'Lucida Console',
				'fontWeight': 'bold',
				'fontSize': 20,
				'fill': '#000000',
				'blurColor': '#FFFFFF'
			},
			'from': this._getNodePosition(from),
			'to': this._getNodePosition(to),
			'backPointer': false,
			'color': this.players[playerId].color
		};
		
		var link = this.map.nodes[from].getLink(to);
		
		if (link == null) {
			link = this.map.nodes[to].getLink(from);
			object['backPointer'] = true;
		}
		
		object['controlRatio'] = link.controlRatio;
		
		return object;
	},
	
	/*
	 * Create arrow animations
	 */
	_createArrowAnimations: function(arrow)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start': {
					'opacity': 0
				},
				'end': {
					'opacity': 1
				},
				'length': 250
			},
			
			'forward_departure':
			{
				'start': {
					'opacity': 1
				},
				'end': {
					'opacity': 0
				},
				'length': 250
			},
			
			'backward_arrival':
			{
				'start': {
					'opacity': 0
				},
				'end': {
					'opacity': 1
				},
				'length': 250
			},
			
			'backward_departure':
			{
				'start': {
					'opacity': 1
				},
				'end': {
					'opacity': 0
				},
				'length': 250
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
			'position': this._getNodePosition(node.id)
		};
		
		return object;
	},
	
	/*
	 * Create a node animations
	 */
	_createNodeAnimations: function(nodeObject, node)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.nodes['node'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['node'].height / 2,
					'img': this.graphics.nodes['node'],
					'width': this.graphics.nodes['node'].width,
					'height': this.graphics.nodes['node'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
					'radius': 10
				},
				
				'end': {},
				'length': 0
			},
			
			'forward_departure':
			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.nodes['node'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['node'].height / 2,
					'img': this.graphics.nodes['node'],
					'width': this.graphics.nodes['node'].width,
					'height': this.graphics.nodes['node'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
					'radius': 10
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_arrival':
			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.nodes['node'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['node'].height / 2,
					'img': this.graphics.nodes['node'],
					'width': this.graphics.nodes['node'].width,
					'height': this.graphics.nodes['node'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
					'radius': 10
				},
				
				'end': {},
				'length': 0
			},
			
			'backward_departure':

			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.nodes['node'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['node'].height / 2,
					'img': this.graphics.nodes['node'],
					'width': this.graphics.nodes['node'].width,
					'height': this.graphics.nodes['node'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
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
			'position': this._getNodePosition(node.id)
		};
		
		return object;
	},
	
	/*
	 * Create city animations
	 */
	_createCityAnimations: function(nodeObject, node)
	{
		var animations =
	
		{
			'forward_arrival':
			{
				'start':
				{
					'x': nodeObject.position.x - this.graphics.nodes['city'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['city'].height / 2,
					'img': this.graphics.nodes['city'],
					'width': this.graphics.nodes['city'].width,
					'height': this.graphics.nodes['city'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
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
					'x': nodeObject.position.x - this.graphics.nodes['city'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['city'].height / 2,
					'img': this.graphics.nodes['city'],
					'width': this.graphics.nodes['city'].width,
					'height': this.graphics.nodes['city'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
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
					'x': nodeObject.position.x - this.graphics.nodes['city'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['city'].height / 2,
					'img': this.graphics.nodes['city'],
					'width': this.graphics.nodes['city'].width,
					'height': this.graphics.nodes['city'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
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
					'x': nodeObject.position.x - this.graphics.nodes['city'].width / 2,
					'y': nodeObject.position.y - this.graphics.nodes['city'].height / 2,
					'img': this.graphics.nodes['city'],
					'width': this.graphics.nodes['city'].width,
					'height': this.graphics.nodes['city'].height,
					'color': (node.playerId) ? this.players[node.playerId].color : '#FFFFFF',
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
		var turn = {};
		
		$A(layers).each(function(layer) {
			turn[layer] = {
				objects: new Array(),
				forward_arrival: {},
				forward_departure: {},
				backward_arrival: {},
				backward_departure: {}
		    }; 
		}, this);
		
		return turn;
	},
	
	/*
	 * Get the player's color
	 */
	_getPlayerColor: function (playerId)
	{
		return this.color.getColor(playerId + 1);
	},
	
	/*
	 * Initialize players data
	 */
	_initPlayers: function (playersInit)
	{
		var players = {};
		
		$A(playersInit).each(function(player) {
			players[player.id] = new TS.Player(player.id, player.name, this._getPlayerColor(player.id));
		}, this);
		
		return players;
	},
	
	/*
	 * Synchronize the state of the map
	 */
	_syncMap: function (states)
	{
		states.each(function(nodeState) {
			var node = this.map.nodes[nodeState.node_id];
			
			node.setSoldiers(nodeState.player_id, nodeState.number_of_soldiers);
		}, this);
	
	},
	
	/*
	 * Get the state of the players
	 */
	_getPlayersStates: function (playersInit)
	{
		// create the players
		var players = {};
		
		$A(playersInit).each(function(player) {
			players[player.id] = new TS.Player(player.id, player.name, this._getPlayerColor(player.id));
		}, this);
				
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
	}
});