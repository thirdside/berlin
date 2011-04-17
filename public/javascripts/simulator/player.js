/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */

TS.Player = Class.create(TS, {
	initialize: function ($super, id, color)
	{
		this.id = id;
		this.color = color;
		
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
	}	
});
