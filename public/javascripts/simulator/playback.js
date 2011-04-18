/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */

TS.AIPlayback = Class.create(TS, {
	initialize: function ($super, containers, map_url, game_description_url)
	{
		$super();
		
		this.game_description_url = game_description_url;
		
		// info table row name template
		this.playerInfoName = 'info_player_#{id}';
		
		// create the visualizer
		this.map = new TS.AIMap(containers.map, map_url);
		this.map.observe('ready', this.onMapReady.bindAsEventListener(this));
		
		// other shit
		this.turnNumber = 0;
		this.forward = true;
		this.ready = {map:false, self:false};
		this.controls = $(containers.controls);

		// create the buttons
		this.buttons = ["rewind", "back", "play", "pause", "next", "end"];
		this.buttons.each(function (control) {
			this[control] = this.controls.down("#" + control);
			this[control].observe("click", this["on" + control.capitalize()].bindAsEventListener(this));
		}, this);
		
		// listen to keyboard keys
		TS.Keyboard.registerCallback(" ", [], this.togglePlayPause.bind(this));
		TS.Keyboard.registerCallback(Event.KEY_LEFT, [], this.onBack.bindAsEventListener(this));
		TS.Keyboard.registerCallback(Event.KEY_RIGHT, [], this.onNext.bindAsEventListener(this));
		
		// create the timer for automatic playback
		this.timer = new TS.Timer();
		this.timer.observe("timer", this.onTimer.bind(this));
		
		// other shit
		this.playerList = $(containers.player_list);
		this.progressBar = $(containers.progress_bar);
		
		this.enableControls();
		this.playbackDescription = null;
	},
	
	/*
	 * Called when the game description is fetched from the server
	 */
	onGameDescriptionLoaded: function (request)
	{	
		// parse the answer
		this.gameDescription = request.responseText.evalJSON();		
	
		this.ready.self = true;	
		
		// draw the first turn (setup)
		if (this.isReady()) {
			// create the playback description
			this.playbackDescription = new TS.PlaybackDescription(
				this.map.config,
				this.map.nodeGraph,
				this.gameDescription,
				this.map.layers['background'],
				this.map.graphics);
			this.playbackDescription.initializeTurns();		
			
			this.enableControls();
			this.drawCurrentTurn();
		}
	},	
	
	/*
	 * Button callback: Rewind
	 */
	onRewind: function (e)
	{
		this.onPause();
		this.turnNumber = 0;
		this.forward = true;
		this.drawCurrentTurn();
	},
	
	/*
	 * Button callback: Back
	 */
	onBack: function (e)
	{
		e.stop();
		this.onPause();
		this.turnNumber--;
		this.forward = false;
		this.drawCurrentTurn();	
	},
	
	/*
	 * Button callback: Play
	 */
	onPlay: function (e)
	{
		if (this.turnNumber >= this.getMaxTurn())
			this.turnNumber = 0;
		
		this.start();
		this.enableControls();
	},
	
	/*
	 * Button callback: Pause
	 */
	onPause: function ()
	{
		this.stop();
		this.enableControls();
	},
	
	/*
	 * Toggle between the Play/Pause buttons
	 */
	togglePlayPause: function (e)
	{
		e.stop();
		this.timer.isRunning()? this.onPause() : this.onPlay();
	},
	
	/*
	 * Button callback: Next
	 */
	onNext: function (e)
	{
		e.stop();
		this.onPause();
		this.turnNumber++;
		this.forward = true;
		this.drawCurrentTurn();
	},
	
	/*
	 * Button callback: End
	 */
	onEnd: function (e)
	{
		this.turnNumber = this.getMaxTurn();
		this.forward = true;
		this.drawCurrentTurn();
	},

	/*
	 * Draw the current frame of the simulation
	 */	
	drawCurrentTurn: function ()
	{
		// draw the current frame
		this.map.doTurn(
			this.playbackDescription.turns[this.turnNumber + (this.forward? -1 : 1)],
			this.playbackDescription.turns[this.turnNumber],
			this.forward);

		// update other shit
		this.enableControls();
		this.updatePlayerList();
		this.updateProgress();
	},
	
	/*
	 * Update the progress bar
	 */
	updateProgress: function ()
	{
		this.progressBar.setStyle("width: #{percent}%".interpolate({percent: this.turnNumber/this.getMaxTurn() * 100}));
	},
	
	/*
	 * Upgrade the player infos
	 */
	updatePlayerList: function ()
	{
		Object.values(this.playbackDescription.turns[Math.min(this.turnNumber, this.getMaxTurn() - 1)].players).each(function(player){
			var row = $(this.playerInfoName.interpolate(player));
			row.down('.color').setStyle({"background-color": player.color});
			row.down('.cities').update(player.cities);
			row.down('.soldiers').update(player.soldiers)
		}, this);
	},
	
	/*
	 * Get the number of simulation turns.
	 * A simulation turn is 1/3 of a game turn.
	 */
	getMaxTurn: function ()
	{
		return this.playbackDescription.turns.length;
	},
	
	/*
	 * Called when the visualizer is ready
	 * i.e. the config was succesfully loaded
	 */
	onMapReady: function ()
	{
		this.ready.map = true;
		
		// request the game description
		new Ajax.Request( this.game_description_url, {method: 'get', onComplete: this.onGameDescriptionLoaded.bindAsEventListener(this)});
	},
	
	/*
	 * Checks if the playback is ready
	 * i.e. the visualizer and the playback are ready.
	 */
	isReady: function ()
	{
		return $H(this.ready).all();
	},
	
	/*
	 * Set the controls depending on the state of the simulation
	 */
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
	
	/*
	 * Stop the automatic playback
	 */
	stop: function ()
	{
		this.timer.stop();
	},
	
	/*
	 * Start the automatic playback
	 */
	start: function ()
	{
		this.timer.start(500, -1);
	},
	
	/*
	 * Process one turn in automatic playback
	 */
	onTimer: function ()
	{
		this.forward = true;
		
		if (this.timer.isRunning())
			this.turnNumber++;
		
		this.drawCurrentTurn();
		
		if (this.turnNumber >= this.getMaxTurn()) {
			this.timer.stop();
			return;
		}		
	}
});
