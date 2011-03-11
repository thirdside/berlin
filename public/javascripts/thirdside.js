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