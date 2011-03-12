/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * website: thirdside.ca
 * date: 07/03/2011
 */

// Originally Mentel.Base from Aurelien Blond and Guillaume Malette
var TS = TS || Class.create({}, {
	initialize: function ()
	{
		this._observers = {};
	},

	prepareObservers: function (eventName)
	{
		this._observers[eventName] = this._observers[eventName] || new Array();
		return this._observers[eventName];
	},

	observe: function (eventName, observer) 
	{
		if (Object.isString(eventName) && Object.isFunction(observer)) 
		{
			var observers = this.prepareObservers(eventName);

			if(!observers.include(observer))
				observers.push(observer);
		}
	},

	stopObserving: function (eventName, observer)
	{
		if (Object.isString(eventName) && Object.isFunction(observer)) 
		{
			var observers = this.prepareObservers(eventName);
			observers = observers.without(observer);
		} else if (Object.isString(eventName))
			this._observers = this._observers.without(eventName);
		else
			this._observers = new Array();
	},

	fire: function (eventName) {
		if (Object.isString(eventName)) 
		{
			var args = $A(arguments).slice(1);

			var observers = this.prepareObservers(eventName);
			observers.each(function(observer) {
				observer.apply(null, args);
			}, this);
		}
	}
});

/**
 * Timer Util Class
 * @see TS
 */
TS.Timer = Class.create(TS, {
	initialize: function ($super)
	{
		$super();
		this.stop();
	},
	
	/**
	 * Starts the timer
	 * delay: time in ms between ticks 
	 * repeat: number of times to run, negative for infinite. 
	 */
	start: function (delay, repeat)
	{
		this.stop();
		var d			= new Date();
		this.startTime	= d.getTime();
		this.repeat		= repeat;
		this.delay		= delay;
		this.interval	= setInterval(this.onTick.bind(this), this.delay);
	},
	
	onTick: function ()
	{
		var d = new Date();
		this.lastTick = d.getTime();
		this.tickCount++;
		
		this.fire("timer", {time: this.lastTick, count: this.tickCount})
		
		if (this.tickCount >= this.repeat && this.repeat > 0)
		{
			this.stop();
		}
	},
	
	stop: function ()
	{
		if (this.interval)
			clearInterval(this.interval);
			
		this.interval	= null;
		this.startTime	= null;
		this.lastTick	= null;
		this.tickCount	= 0;
		this.repeat		= 0;
	}
});

TS.Color = Class.create({
	
	initialize: function (options)
	{
		this.options = Object.extend({
			shift: 0,
			colors: 12,
			step: 4
		}, options || {})
	},
	
	getColor: function (offset)
	{
		var boxes	= this.options.colors/this.options.step;
		var box 	= Math.floor(((offset + this.options.colors - 1)%this.options.colors)/boxes) + ((offset+1)%boxes) * this.options.step;
		var hue		= box * (360 / this.options.colors) + this.options.shift;
		var rgb = this.hsl2rgb(hue, 100, 70 - Math.floor(offset/this.options.colors) * 22);
		color = ['r', 'g', 'b'].collect(function (l) {
			var s = Math.floor(rgb[l]).toString(16);
			return s.length == 2 ? s : "0" + s;
		})
		return "#" + color.join("");
	},
	
	// Thanks to jkd @ http://www.codingforums.com/showthread.php?t=11156
	hsl2rgb: function (h, s, l) {
		var m1, m2, hue;
		var r, g, b
		s /=100;
		l /= 100;
		if (s == 0)
			r = g = b = (l * 255);
		else {
			if (l <= 0.5)
				m2 = l * (s + 1);
			else
				m2 = l + s - l * s;
			m1 = l * 2 - m2;
			hue = h / 360;
			r = this.hueToRgb(m1, m2, hue + 1/3);
			g = this.hueToRgb(m1, m2, hue);
			b = this.hueToRgb(m1, m2, hue - 1/3);
		}
		return {r: r, g: g, b: b};
	},

	hueToRgb: function (m1, m2, hue) {
		var v;
		if (hue < 0)
			hue += 1;
		else if (hue > 1)
			hue -= 1;

		if (6 * hue < 1)
			v = m1 + (m2 - m1) * hue * 6;
		else if (2 * hue < 1)
			v = m2;
		else if (3 * hue < 2)
			v = m1 + (m2 - m1) * (2/3 - hue) * 6;
		else
			v = m1;

		return 255 * v;
	}
});