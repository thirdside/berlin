/**
 * author: Guillaume Malette <gmalette@gmail.com> @gmalette
 * author: Christian Blais <christ.blais@gmail.com> @christianblais
 * author: Jodi Giordano <giordano.jodi@gmail.com> @jodi
 * website: thirdside.ca
 * date: 12/04/2011
 */

TS.Playback = Class.create(TS, {
	initialize: function($super, containers, map_url, history_url)
	{
		this.containers = containers;
		this.map_url = map_url;
		this.history_url = history_url;

		// info table row name template
		this.playerInfoName = 'info_player_#{id}';

		// other shit
		this.playerList = $(containers.player_list);
		this.progressBar = $(containers.progress_bar);
		this.progressTurns = $(containers.turns);
		this.controls = $(containers.controls);
	},

	setPlayerInfo: function(id, color, soldiers, nodes, score)
	{
		var row = $(this.playerInfoName.interpolate({id: id}));
		row.down('.color').setStyle({"background-color": color});
		row.down('.soldiers').update(soldiers)
		row.down('.nodes').update(nodes);
		row.down('.score').update(score);
	},

	/*
	 * Update the progress bar
	 */
	updateProgressPercent: function (percent)
	{
		this.progressBar.setStyle("width: #{percent}%".interpolate({percent: percent}));
	},

	/*
	 * Update the current turn #
	 */
	updateProgressTurns: function (turnNumber, maxTurns)
	{
		var format = "#{currentTurn}/#{nbTurns}";

		var data =
		{
			currentTurn: Math.ceil(turnNumber || 0),
			nbTurns: Math.ceil(maxTurns || 0)
		};

		this.progressTurns.update(format.interpolate(data));
	},
})

TS.AIPlayback = Class.create(TS.Playback, {
	initialize: function ($super, containers, map_url, history_url)
	{
		$super(containers, map_url, history_url);


		// create the visualizer
		this.map = new TS.AIMap(containers.map, map_url);
		this.map.observe('ready', this.onMapReady.bindAsEventListener(this));

		// other shit
		this.turnNumber = 0;
		this.forward = true;
		this.ready = {map:false, self:false};

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

		this.enableControls();
		this.playbackDescription = null;
		this.stepTime = 500;
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
				this.map.graphics,
				this.stepTime);
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
		this.forward = false;
		this.drawCurrentTurn();
	},

	/*
	 * Button callback: Back
	 */
	onBack: function (e)
	{
		e.stop();
		this.onPause();
		if (this.turnNumber > 0)
		{
			this.turnNumber--;
			this.forward = false;
			this.drawCurrentTurn();
		}
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
		if (this.turnNumber < this.getMaxTurn())
		{
			this.turnNumber++;
			this.forward = true;
			this.drawCurrentTurn();
		}
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

	updateProgress: function()
	{
		this.updateProgressPercent(this.turnNumber/this.getMaxTurn() * 100);
		var currentTurn = (this.turnNumber / this.playbackDescription.simulatioGameRatio) || 0
		var nbTurns = (this.getMaxTurn() / this.playbackDescription.simulatioGameRatio) || 0

		this.updateProgressTurns(currentTurn, nbTurns);
	},

	/*
	 * Upgrade the player infos
	 */
	updatePlayerList: function ()
	{
		Object.values(this.playbackDescription.turns[Math.min(this.turnNumber, this.getMaxTurn() - 1)].players).each(function(player){
			this.setPlayerInfo(player.id, player.color, player.soldiers, player.nodes, player.score);
		}, this);
	},

	/*
	 * Get the number of simulation turns.
	 * A simulation turn is 1/5 of a game turn.
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
		new Ajax.Request( this.history_url, {method: 'get', onComplete: this.onGameDescriptionLoaded.bindAsEventListener(this)});
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
		this.timer.start(this.stepTime, -1);
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

TS.FlashPlayback = Class.create(TS.Playback, {
	initialize: function($super, containers, map_url, history_url)
	{
		$super(containers, map_url, history_url);
		this.setupFlash();
	},

	setupFlash: function()
	{
		// For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
    var swfVersionStr = "10.2.0";
    // To use express install, set to playerProductInstall.swf, otherwise the empty string.
    var flashvars = {map: this.map_url, history: this.history_url};
    var params = {};
    params.quality = "high";
    params.bgcolor = "#202020";
    params.allowscriptaccess = "always";
    params.allowfullscreen = "true";
    var attributes = {};
    attributes.id = "berlin-client";
    attributes.name = "berlin-client";
    attributes.align = "middle";
    swfobject.embedSWF(
        "/berlin-client.swf", this.containers.flash,
        "960", "500",
        swfVersionStr, null,
        flashvars, params, attributes);
	},
})
