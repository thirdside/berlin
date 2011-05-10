/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */

TS.Player = Class.create(TS, {
	initialize: function ($super, id)
	{
		this.id = id;
		this.color = this._initPlayerColor(id);
		
		this.soldiers = 0;
		this.cities = 0;
	},
	
	
	sync: function (map)
	{
		this.soldiers = 0;
		this.cities = 0;
		
		Object.keys(map.nodes).each(function(nodeId) {
			var node = map.nodes[nodeId];
		
			if (this.id == node.playerId) {
				this.soldiers += node.nbSoldiers;
				
				if (node.type == 'city')
					this.cities += 1;
			}
		}, this);
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
	}	
});
