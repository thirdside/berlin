var sys = require("sys"),
	http = require("http"),
	url = require("url"),
	util = require("util"),
	querystring = require('querystring');



function RandomAI() {
	this.initialize = function ()
	{
		this.games = {};
		
		this.server = http.createServer(this.onRequest.bind(this)).listen(4567);
		v("Berlin Random AI Server Started");
	}
	
	this.onRequest = function (request, response)
	{
		var uri = url.parse(request.url).pathname;
		v("New request: " + uri);
		if (uri === "/onturn")
		{
			this.onTurn(request, response);
		} else if (uri === "/infos")
		{
			this.onInfos(request, response);
		}
		response.writeHead(200, {'Content-Type': 'application/json'});
	}
	
	this.onTurn = function (request, response)
	{
		this.postHandler(request, function(request_data)
		{
			var game = this.createOrUpdateGame(request_data);
			var moves_json = JSON.stringify(game.turnMoves());
			response.write(moves_json);
			v("Moves for this turn: " + moves_json);
			
			response.end();
	    }.bind(this));
	}
	
	this.createOrUpdateGame = function (request)
	{
		var map = JSON.parse(request.map);
		var infos = JSON.parse(request.infos);
		var state = JSON.parse(request.state);
		var action = request.action ? request.action : null;
		var game_id = infos.game_id;
		
		var game = this.games[game_id];
		
		if (!game)
		{
			game = new Game();
			game.initialize(game_id, map, infos);
			this.games[game_id] = game;
		}
		if (action == "game_over")
		{
			
		} else if (state)
		{
			game.update(state);
		}
		
		return game;
	}
	
	this.onInfos = function (request, response)
	{
		response.write("Ready!");
	}
	
	this.calculateMoves = function (map_infos)
	{
		var map = {nodes:[]}
		return map;
	}
	
	this.postHandler = function (request, callback)
	{
		var _REQUEST = {};
		var _CONTENT = '';
		
		if (request.method == 'POST')
		{
			request.addListener('data', function(chunk)
			{
				_CONTENT+= chunk;
			});
			
			request.addListener('end', function()
			{
				_REQUEST = querystring.parse(_CONTENT);
				callback(_REQUEST);
			});
		};
	};
};



function Node ()
{
	this.initialize = function (id)
	{
		this.id = id;
		this.links = [];
	}
	
	this.linkTo = function (otherNode)
	{
		this.links.push(otherNode);
	}
	
	this.isAdjacent = function (otherNode)
	{
		return this.links.indexOf(otherNode) != -1;
	}
	
	this.adjacentNodes = function ()
	{
		return this.links;
	}
}


function Game ()
{
	this.initialize = function (id, map_info, infos)
	{
		this.id = id;
		this.map = new Map();
		this.map.initialize(map_info, infos);
	}
	
	this.update = function (states)
	{
		this.map.update(states);
	}
	
	this.turnMoves = function ()
	{
		var moves = [];
		var nodes = this.map.controlledNodes();
		v("Controlled Nodes: " + nodes);
		for (var i = 0; i < nodes.length; i++)
		{
			var node = nodes[i];
			var adj = node.adjacentNodes();
			v("Adjacent Nodes: " + adj);
			moves.push(
				{
					from: node.id, 
					to: adj[Math.floor(Math.random()*adj.length)].id, 
					number_of_soldiers: Math.floor(Math.random()*node.number_of_soldiers)
				}
			);
		}
		return moves;
	}
}


function Map ()
{
	this.initialize = function (map, infos)
	{
		this.player_id = infos.player_id;
		this.nodes = {};
		this.directed = infos.directed || false;
		
		for (var i = 0; i < map.nodes.length; i++)
		{
			var node = map.nodes[i];
			this.nodes[node.id] = new Node();
			this.nodes[node.id].initialize(node.id);
		}
		
		for (var i = 0; i < map.paths.length; i++)
		{
			var path = map.paths[i];
			this.nodes[path.from].linkTo(this.nodes[path.to]);
			
			if (!this.isDirected())
			{
				this.nodes[path.to].linkTo(this.nodes[path.from]);
			}
		}
	}
	
	this.ownedNodes = function ()
	{
		var nodes = [];		
		for (i in this.nodes)
		{
			node = this.nodes[i];
			if (node.player_id == this.player_id)
			{
				nodes.push(node);
			}
		}
		
		v("Owned Nodes: " + util.inspect(this.nodes));
		
		return nodes;
	}
	
	this.controlledNodes = function ()
	{
		var nodes = [];
		var owned_nodes = this.ownedNodes();
		for (var i = 0; i < owned_nodes.length; i++)
		{
			if (owned_nodes[i].number_of_soldiers > 0)
			{
				nodes.push(owned_nodes[i]);
			}
		}
		
		return nodes;
	}
	
	this.isDirected = function ()
	{
		return this.directed;
	}
	
	this.update = function (states)
	{
		for (var i = 0; i < states.length; i++)
		{
			var node = this.nodes[states[i].node_id];
			node.number_of_soldiers = states[i].number_of_soldiers;
			node.player_id = states[i].player_id;
		}
	}
}

v = function (str)
{
	util.log(util.inspect(str));
}


var server = new RandomAI();
server.initialize();
