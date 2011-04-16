/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */

 TS.Drawable = Class.create(TS, {
	initialize: function (container, position, size, translate)
	{
		this.container = container;
		this.position = Object.extend({x: 0, y: 0}, position || {});
		this.size = Object.extend({width: 1, height: 1}, size || {});
		this.translate = translate;
	},
	
	getRelativePosition: function (position)
	{
		var pos =
		{
			x: position.x - this.translate.x,
			y: position.y - this.translate.y
		};
		
		pos.x = (pos.x / this.size.width) * 100;
		pos.y = (pos.y / this.size.height) * 100;
		
		return pos;
	},
	
	getAbsolutePosition: function (position)
	{
		var pos =
		{
			x: position.x / 100 * this.size.width,
			y: position.y / 100 * this.size.height
		};
		
		pos.x += this.translate.x;
		pos.y += this.translate.y;
		
		return pos;
	},
	
	getQuadraticCurvePoint: function (from, to, ratio)
	{
		var x =
		{
			x: (from.x + (to.x - from.x) / 2 + (to.y - from.y) * ratio),
			y: (from.y + (to.y - from.y) / 2 + (to.x - from.x) * ratio * -1)
		};
		
		return x;
	},
});
