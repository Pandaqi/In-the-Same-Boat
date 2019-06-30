/** Game.js
 *  
 *  This file contains the main game state
 *  It loads the map (that is given to it)
 *  And provides all the gameplay
 *
 */

const EVENT_DICT = {

	"main": {
		"new-player": ["New player!", ["explore"] ],

		"pirate-born": ["Pirate @[0] started", [] ],

		"new-monster-type": ["Monster @[0] sighted", [] ],

		"natural-disaster": ["Natural disaster!", [] ],

		"monster-rampage": ["Monster @[0] rampages!", []],
	},

	"sub": {
		"explore": ["Player @[0] explores", [] ],

		"place-dock": ["Player @[0] placed a dock", [] ],
		"found-city": ["Player @[0] founded a city", [] ],

		"pirate-dies": ["Pirate @[0] died", [] ],

		"natural-disaster-end": ["Natural disaster ended", [] ],

		"monster-rampage-end": ["Monster @[0] rampage ended", []],
	},

}

// REMARK: The "@[x]" bits represent an unknown value that should be input there (at runtime). 

/*

TO DO:

~ Make each player start with one ship. 
	=> Each SHIP and the PLAYER OBJECT ITSELF has a list of possible events
	=> They may all pick exactly one event
(This allows some ships to explore, while another may build a dock, and another is fighting a war)

~ Implement player behaviour (desire to expand) + necessary events + necessary variables saved (like player reputation)
~ Show what's happening on the screen. (Someone built a dock? Place it on the screen! Also color tiles based on territory)
~ Execute timed events

QUESTION: How do we save the things a player has "under his control"? 
 => For each tile, save who "owns" it
 => For each player, save an array of tiles on the edge of their explored territory. When the "explore" event triggers, they search / claim these lands.
 	=> If they find a land suitable for dock/city, they build it.

IDEA: Measure a player's army (strength) by how many ships he has. "Building a new ship" can become an action. 
 => Ships that sink, result in wrecks you can explore. 
 => Ships that don't sink will be yours once the game starts :p

	YESSSS: If a player has more ships, they can explore more per timestep!

PLANNABLE: 
 => Pirate start/end (kill possibility)
 => Monster rampage start/end (kill possibility)
 => Natural disaster start/end
 => War start/end (kill possibility)

(kill possibility = end event might be unnecessary because it terminates before that)

*/


/*

"BEHAVIOUR" of units within the backstory simulation

=== PLAYERS ===

Players always try to expand their wealth, influence, army size, etc.
 => When a player group is doing nothing, it explores.
 => Unclaimed lands will become claimed
 => Anything it discovers is saved
 => To get enough resources, it builds docks and cities
 => Docks generate trading routes over time

This is the "ideal" situation. But, there are other players in the world!
 => When they are attacked, they can suffer (great) losses, and their relationship with the attacker will deteriorate.
 => Similarly, if someone thinks another player is becoming too powerful, they might start a war
 => Random events might influence relations (such as a bad deal, betrayal, claiming a land somebody else also wanted)
 => Additionally, aggressive players might just take control over other player's territories

And there are random events outside of players control, like weather conditions (heavy storms) and monster attacks (mostly a monster rampage)


=== PIRATES ===

Pirates are born randomly or out of bad conditions (when a group is weak/marginalized, it can spawn more pirates)
 => Pirates are always looking for a fight
 => They actively sail the waters, and anybody who passes by will be attacked
 => From time to time, they attack docks or coast cities, and might take away claimed territory.
 => After a good looting, pirates may bury a treasure.
 => When a great pirate ship sinks, it leaves behind a wreck (at the spot it sank), and possibly more clues/treasure/loot

Pirates don't _explore_. 
 => They have a home base, a preferred area, in which they just sail around. 
 => Any tile within a certain radius of this home base is valid.
 => If their home base is destroyed (or severely threatened), they will get out of this area and start chasing anyone they see as an enemy.

IDEA: Keep track of the HEALTH of a certain ship? If it attacks too many times, and receives too much damage, it will sink. This might even be the result of a small fight.

QUESTION: What happens when a pirate dies of natural causes? 
 => 1) Another pirate takes over the ship?
 => 2) We just let the ship sink/disappear "for unknown reasons"?
 => 3) Nothing. If the pirate managed to make an impact, nice. If not, no worries?

=== WAR ===

When two (or more) players have a bad enough relationship, any subsequent "bad event" can trigger a war. (This is the "inciting incident".)

Any players that are allied can join the battle. Pirates may also join the battle, if it's in their "neighbourhood".

War can have many stages. Battling is only one of them. 
 => If one side chooses to battle, but the other doesn't, the first side performs a surprise attack and will have a great result.
 => Only if both sides choose to battle at the same time, a GREAT BATTLE ensues. The result is dramatic (and often ends the war instantly)

Other stages are "growing an army", "gathering allies", "building more docks/coast cities", "taking control of an enemy dock/city"

*/

var gameScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function gameScene ()
    {
        Phaser.Scene.call(this, { key: 'gameScene' });
    },

    preload: function() {
    	this.mapWidth = 60;
    	this.mapHeight = 30;

    	this.tileSize = Math.min(window.innerWidth / this.mapWidth, window.innerHeight / this.mapHeight);

    	this.map = [];
    	this.checkedTiles = {};
    	this.islands = [];
    	this.docks = [];
    },

	create: function() {
		noise.seed(Math.random());

		let pixelHeight = this.mapHeight*this.tileSize;
		let pixelWidth = this.mapWidth*this.tileSize;
		let halfPxWidth = 0.5*pixelWidth;
		let halfPxHeight = 0.5*pixelHeight;

		// generate map (according to noise object)
		let x1=0, y1=0, x2=10, y2=10
		for (let y = 0; y < this.mapHeight; y++) {
			this.map[y] = [];
			for (let x = 0; x < this.mapWidth; x++) { 

				// NEW CODE
				// 4D noise => wraps back to 2D map, SEAMLESS
				let s = x / this.mapWidth
		        let t = y / this.mapHeight
		        let dx = (x2 - x1)
		        let dy = (y2 - y1)
		        let pi = Math.PI

		        // Walk over two independent circles (perpendicular to each other)
		        let nx = x1 + Math.cos(s*2*pi) * dx / (2*pi)
		        let nz = y1 + Math.sin(s*2*pi) * dy / (2*pi)

		        let ny = x1 + Math.cos(t*2*pi) * dx / (2*pi)
		        let nw = y1 + Math.sin(t*2*pi) * dy / (2*pi)

				this.map[y][x] = noise.perlin4(nx, ny, nz, nw);
			}
		}
	

		/*** CREATE MAP VISUALS ***/

		// Graphics docs (Phaser v3): https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html
		// display map
		var graphics = this.add.graphics(0, 0);

		// display the tiles
		for (let y = 0; y < this.mapHeight; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				let curVal = this.map[y][x];

				// DEEP OCEAN
				if(curVal < -0.3) {
					graphics.fillStyle(0x1036CC, 1);
				// SHALLOW OCEAN
				} else if(curVal < 0.2) {
					graphics.fillStyle(0x4169FF, 1);
				// BEACH
				} else if(curVal < 0.25) {
					graphics.fillStyle(0xEED6AF, 1);
				// ISLAND
				} else {
					graphics.fillStyle(0x228B22, 1);
				}

				graphics.fillRect(x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);

				//this.add.text((x+0.5)*this.tileSize, (y+0.5)*this.tileSize, Math.round(curVal * 10)/10, { fontSize: 16 }).setOrigin(0.5);
			}
		}

		/*** CREATE TIMELINE ***/

		this.timeGraphics = this.add.graphics(0,0);
		this.timeGraphics.myTextSprites = [];

		// Initialize timeline
		this.timestep = 0;
		this.unitsInWorld = { players: [], pirates: [], monsters: [] };
		this.possibleEvents = { players: [], pirates: [], monsters: [] };

		this.timedEvents = [];

		this.maxPlayers = 3;

		// Every X ms, go to a new step within the timeline
		this.simulationTimer = this.time.addEvent({
		    delay: 500,                // ms
		    callback: this.updateTimeline,
		    //args: [],
		    callbackScope: this,
		    loop: true
		});
	},

	wrapCoords: function(c, bound) {
		if(c < 0) { 
    		c += bound; 
    	} else if(c >= bound) {
			c -= bound;
		}
		return c;
	},

	updateTimeline: function() {
		let allEventsNow = [];

		let somethingHappened = false;

		// Execute timed/planned events (such as a pirate dying or a storm ending naturally)
		for(let i = 0; i < this.timedEvents.length; i++) {
			const curEv = this.timedEvents[i];

			// if the current event's time (index 0) is equal to the current simulation time ...
			if(curEv[0] == this.timestep) {
				// ... execute this event!
				// index 1 = unit type; index 2 = unit number it relates to; index 3 = event key; 
				let curUnit = this.unitsInWorld[ curEv[1] ][ curEv[2] ];
				if(curUnit == null || curUnit == undefined) {
					// unit doesn't exist anymore; do nothing
					console.log("TIMED EVENT || Unit doesn't exist anymore; no further action");
				} else {
					// TO DO: If an event should happen at this timestep, execute it
					// In most cases, that just means an "end" condition: remove this unit or stop this "phase"
					console.log("TIMED EVENT ||", curEv[3]);
				}


				// remove event from array
				this.timedEvents.splice(i, 1);
				i--;
			}
		}

		// for each player, check possible events, pick one
		for(let i = 0; i < this.unitsInWorld.players.length; i++) {
			const tempPosEvents = this.possibleEvents.players[i];
			let tempEvent = '';

			// pick a random possible event, if available
			if(tempPosEvents.length > 0) {
				tempEvent = tempPosEvents[ Math.floor( Math.random() * tempPosEvents.length )];

				// check if event is a sub event or main event
				// (and get the right list based on that information)
				let eventType = 'sub';
				if(!(tempEvent in EVENT_DICT["sub"])) {
					eventType = 'main';
				}

				// log the chosen event
				let eventDesc = EVENT_DICT[eventType][tempEvent][0]
	   			let eventStrings = [i];

				// clear possible events => add possible consequent events from tempEvent
				// index 0 is the full event title/description, index 1 is the list of possible events
				this.possibleEvents.players[i] = EVENT_DICT[eventType][tempEvent][1];

				// record that something happened
				somethingHappened = true;

				// replace all "@[x]" bits with their corresponding input/string/value
	   			for(let a = 0; a < eventStrings.length; a++) {
		   			eventDesc = eventDesc.replace( '@[' + a + ']', eventStrings[a] );   				
	   			}

	   			allEventsNow.push(eventDesc);

				console.log(eventDesc);
			}
		}

		// if nothing happens, go through all possible main events, pick one
		// main events don't necessarily need to be related to a certain player

		// QUESTION / TO DO: If the chosen event does not succeed, try again, until we find one that DOES succeed?
		if(!somethingHappened) {
			// save array of main events (for easy access)
			const obj = EVENT_DICT["main"]

			// get a random key (which is the actual event)
			let keys = Object.keys(obj)
   			let tempEvent = keys[ Math.floor( Math.random() * keys.length) ];

   			// for logging the chosen event
   			let eventDesc = EVENT_DICT["main"][tempEvent][0]
   			let eventStrings = [];

   			// sometimes events don't go through (because they are not allowed or impossible)
   			// save that here
   			let eventSucceeded = true;
   			let num;

   			// most main events have a special action associated with it
   			// this switch statement executes those actions
   			switch(tempEvent) {

   				// NEW PLAYER: A new player joins. Add him to the array of players, and give it some future events.
   				case 'new-player':
	   				// get player num
	   				num = this.unitsInWorld.players.length;

	   				// if we already have enough players, stop here
	   				if(num >= this.maxPlayers) {
	   					eventSucceeded = false;
	   					break;
	   				}

	   				// add player to arrays
	   				const newPlayer = { num: num };
   					this.unitsInWorld.players.push(newPlayer);
   					this.possibleEvents.players.push([]);

   					// save possible follow-up events
					this.possibleEvents.players[num] = EVENT_DICT["main"][tempEvent][1];

					// event strings (for logging)
					eventStrings = [num];
					break;

				// NEW PIRATE: A new pirate joins the game. Add him to the pirates array, and plan his death.
				case 'pirate-born':
					num = this.unitsInWorld.pirates.length;

					const newPirate = { num: num };
					this.unitsInWorld.pirates.push(newPirate)

					// save possible follow-up events
					this.possibleEvents.pirates[num] = EVENT_DICT["main"][tempEvent][1];

					// Plan death (20 turns later, for now)
					this.timedEvents.push([this.timestep + 20, 'pirates', num, 'pirate-dies']);

					// event strings (for logging)
					eventStrings = [num];
					break;

				// NEW MONSTER: A new monster type has been discovered.
				// Monsters don't really have a place in this simulation
				// New TYPES are discovered. Every type just has ONE monster representing it. Once in a while, it goes on a rampage.
				case 'new-monster-type':
					num = this.unitsInWorld.monsters.length;

					// if we already have enough monsters, stop here
	   				if(num >= this.maxPlayers) {
	   					eventSucceeded = false;
	   					break;
	   				}

					const newMonster = { num: num };
					this.unitsInWorld.monsters.push(newMonster)

					// save possible follow-up events
					this.possibleEvents.monsters[num] = EVENT_DICT["main"][tempEvent][1];

					// event strings (for logging)
					eventStrings = [num];

					break;
   			}

   			if(eventSucceeded) {
	   			// replace all "@[x]" bits with their corresponding input/string/value
	   			for(let a = 0; a < eventStrings.length; a++) {
		   			eventDesc = eventDesc.replace( '@[' + a + ']', eventStrings[a] );   				
	   			}

	   			// actually log the chosen event
	   			console.log(eventDesc);

	   			allEventsNow.push(eventDesc);
   			}

		}

		// display the events on the timeline
		// switch between low and high text, so it stays readable (and doesn't overlap)
		let maxSteps = 50;
		let timelineWidth = 20;
		let x = (this.timestep % timelineWidth) * (window.innerWidth/timelineWidth), y = 40;
		let extraY = (this.timestep % 2 == 0) ? 0 : 60;

		// when a new iteration starts, clear the graphics, draw a new line, and destroy all text sprites
		if(x == 0) { 
			this.timeGraphics.clear();

			this.timeGraphics.fillStyle(0xFFFFFF, 1);
			this.timeGraphics.fillRect(0, 50, window.innerWidth, 5);

			for(let i = 0; i < this.timeGraphics.myTextSprites.length; i++) {
				this.timeGraphics.myTextSprites[i].destroy();
			}

			this.timeGraphics.myTextSprites = [];
		}

		// display text (that shows all events for this step)
		for(let a = 0; a < allEventsNow.length; a++) {
			this.timeGraphics.myTextSprites.push( this.add.text(x, y + 60 + a*20 + extraY, allEventsNow[a], { fontSize: 12, color: "#FFFFFF" }).setOrigin(0.5) );
		}

		// display vertical line (with correct height to reach the events)
		this.timeGraphics.fillRect(x, y, 3, 60 + extraY);

		// increase timestep
		this.timestep++;

		// arbitrary ending condition (time out after X number of steps)
		if(this.timestep >= maxSteps) {
			this.simulationTimer.remove();
		}
	},

	// core game loop
	update: function() {

	},

	/** 
	 *  Standard Phaser function (used to display FPS atm)
	 */
	render: function()
    {
        game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   
    },

});
