/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
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
		this.links.push({
			'toId': otherNode.id,
			'controlRatio': (Math.random() * 30 | 0) / 100
		});
	},
	
	getLink: function (toId)
	{
		for(var i = 0; i < this.links.length; i++)
			if (this.links[i].toId == toId)
				return this.links[i];
		
		return null;
	},
	
	setSoldiers: function(playerId, nbSoldiers)
	{
		this.playerId = playerId,
		this.nbSoldiers = nbSoldiers;
	}
});

TS.City = Class.create(TS.Node, {
	initialize: function ($super, id, x, y)
	{
		$super(id, 'city', x, y);
		this.layout = (Math.random() * 3) | 0;
	},
});

TS.NodeGraph = Class.create(TS, {
	initialize: function ($super, map)
	{
		$super();
		this.nodes 		= {};
		this.map 		= map;
		this.directed 	= map.infos.directed || false;
		
		// Create nodes
		this.map.nodes.each(function(node){
			if (node.type == 'city')
				this.nodes[node.id] = new TS.City(node.id, node.x, node.y);
			else
				this.nodes[node.id] = new TS.Node(node.id, node.type, node.x, node.y);
		}, this);
		
		// Add paths between the nodes
		this.map.paths.each(function(path){
			this.nodes[path.from].linkTo(this.nodes[path.to]);
			//if (!this.directed)
			//	this.nodes[path.to].linkTo(this.nodes[path.from]);
		}, this);
	}
});
