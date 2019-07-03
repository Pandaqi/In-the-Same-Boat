/** Game.js
 *  
 *  This file contains the main game state
 *  It loads the map (that is given to it)
 *  And provides all the gameplay
 *
 */

const EVENT_DICT = {

	"main": {
		"new-player": ["New player!", [] ],

		"pirate-born": ["Pirate @[0] started", [] ],

		"new-monster-type": ["Monster @[0] sighted", [] ],

		"natural-disaster": ["Natural disaster!", [] ],

		"monster-rampage": ["Monster @[0] rampages!", []],
	},

	"sub": {
		// the almighty explore event
		"explore": ["Player @[0] explores", [] ],

		// building events
		"place-dock": ["Player @[0] placed a dock", [] ],
		"found-city": ["Player @[0] founded a city", [] ],
		"build-ship": ["Player @[0] built a ship", [] ],

		// resource generating events (most are perpetual; they keep cycling until something breaks the cycle)
		"start-trade-route": ["Player @[0] sends ship on trade route", ["trade-route"] ],
		"trade-route": ["Player @[0] continues trade route", ["trade-route"] ],
		"fish": ["Player @[0] fishes for resources/treasure", ["fish"] ],
		"attack-ship": ["Player @[0] attacks a ship", [] ],

		// timed events (with units dying or "ending", mostly)
		"natural-disaster-end": ["Natural disaster ended", [] ],
		"pirate-dies": ["Pirate @[0] died", [] ],
		"monster-rampage-end": ["Monster @[0] rampage ended", []],
	},

}

// REMARK: The "@[x]" bits represent an unknown value that should be input there (at runtime). 

/*

TO DO:

Make the explore function work
Show the tiles it explores ( = the current territory of each player)
When the explore function finds a place for a dock/city, place it immediately. (For testing now; there'll be resources later)

REMEMBER: 
 => Check if a unit has an event planned. If not, set it to the default (explore/roam around)
 => We don't need to distinguish between individual and general events. 
 	=> General events are called explicitly from somewhere else (a main event, a ship encountering an enemy, etc.)
 	=> General events can instantly make their ships do something else.

Somehow distinguish between "specific ship events" and "general player events" !!!
	=> For example, a player group cannot "explore", but their ships can. 
	=> The other way around: a player can start a war or be diplomatic, individual ships can't
	OOOR, is the main/sub disctinction exactly that? The main events create new units and can only be done from the whole group. Sub events handly individual stuff.

TWO OPTIONS:
	1) Events are always meant for the group, but they are "passed down" to individual units.
	   With a player set to "explore", he will automatically tell all his ships to explore.
	2) We distinguish between individual and group events, which will need a little bit of restructuring/rewriting.

PROBLEM: We need some way for individual events to initiate group events (somehow they need to link back/propagate events)

MAYBE this whole event system is just complicating things. We can just switch to this set of rules:
	1) When nothing to do, explore/roam around
	2) When an enemy is
	3) NO, THIS DOESN'T WORK EITHER



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

		        let curVal = noise.perlin4(nx, ny, nz, nw);

				this.map[y][x] = { val: curVal,  owner: -1, dock: null };
			}
		}
	

		/*** CREATE MAP VISUALS ***/

		// Graphics docs (Phaser v3): https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html
		// display map
		var graphics = this.add.graphics(0, 0);

		// display the tiles
		for (let y = 0; y < this.mapHeight; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				let curVal = this.map[y][x].val;

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

		this.maxPlayers = 5;
		this.maxSteps = 100;

		this.allEventsNow = [];

		this.territoryGraphics = this.add.graphics(0,0);

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


	// @parameter obj => the object of which we should pick an event (always in list "possibleEvents")
	pickEvent: function(obj, generalEvent = false) {
		// either pick the "possibleEvents" array or the general "events" object
		let tempPosEvents = [];
		if(generalEvent) {
			tempPosEvents = Object.keys(obj)
		} else {
			tempPosEvents = obj.possibleEvents;
		}

		
		if(tempPosEvents.length > 0) {
			// if we have events, pick one (at random)
			let randEvent = tempPosEvents[ Math.floor( Math.random() * tempPosEvents.length )];
			this.executeEvent(randEvent, obj)
		} else {
			// if we have no events, and we're dealing with an actual unit, set this object to explore
			// exploring can mean something (slightly) different for different units
			if(!generalEvent) {
				this.executeEvent('explore', obj)				
			}
		}
		
	},

	executeEvent: function(ev, obj) {
		// check if event is a sub event or main event
		// (and get the right list based on that information)
		let evType = 'main';
		if(!(ev in EVENT_DICT["main"])) {
			evType = 'sub';
		}

		// perform required action for this event
		// the function is split between main and sub
		// there's no other reason for this than readability: the functions can be shorter and more to the point
		if(evType == "main") {
			this.executeMainEventAction(ev, obj);		

			// main events don't have general follow-ups
			// instead, any possible events are handled in the "executeMainEventAction"	
		} else {
			let unitType = ("myType" in obj) ? obj.myType : null;
			let unitIndex = ("myPlayer" in obj) ? obj.myPlayer : null;

			this.executeSubEventAction(ev, obj, { unitType: unitType, unitIndex: unitIndex });
		}

		// record that something happened
		// TO DO

		// get proper eventStrings for logging
		// TO DO
		let eventStrings = [obj.num];

		// log the event => give event description and input (to be replaced within string)
		this.logEvent(EVENT_DICT[evType][ev][0], eventStrings)
	},

	executeSubEventAction(ev, obj, ref = null) {
		const possibleEvents = EVENT_DICT["sub"][ev][1];

		// clear the possible events; later, we'll populate it with new ones
		obj.possibleEvents = [];

		switch(ev) {

			// PIRATE DIES: Remove the pirate from the world
			// For now, we just set to null. In the future, we might think about actually removing it.
			// TO DO: Maybe the list of ships can be an obj, with the keys being the NAME of the ship
			case 'pirate-dies':
				this.unitsInWorld[ ref.unitType ][ ref.unitIndex ] = null;

				break;

			// PLACE A DOCK
			// Check if we have enough resources; build if so, try to gather more if not
			// Set the dock value on the map to something other than null
			// Also save that the player has this dock
			case 'place-dock':
				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];
				var cost = 4;
				if(mainUnit.resources >= cost) {
					let newDock = { name: "Dockio" };

					this.map[ obj.y ][ obj.x ].dock = newDock;
					mainUnit.docks.push(newDock);

					mainUnit.resources -= cost;
				} else {
					// Plan events that generate more income
					obj.possibleEvents.push(...["start-trade-route", "fish", "attack-ship"]);
				}

				break;

			// FOUND A CITY
			// Set the city value on the map to something other than null
			case 'found-city':
				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];
				var cost = 4;
				if(mainUnit.resources >= cost) {
					let newCity = { name: "Holymolyknoly" };

					this.map[ obj.y ][ obj.x ].city = newCity;
					mainUnit.cities.push(newCity);

					mainUnit.resources -= cost;
				} else {
					// Plan events that generate more income
					obj.possibleEvents.push(...["start-trade-route", "fish", "attack-ship"]);
				}

				break;

			// BUILD A SHIP
			// Check if we have enough resources
			// Generate the ship and add it to the ships array
			// Position doesn't matter: it will snap to the explored tiles anyway (within the same timestep)
			case 'build-ship':
				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];
				var cost = 8;
				if(mainUnit.resources >= cost) {
					let newShip = { name: "Queen Maxima's Revenge" };

					// TO DO: Write general function for this??
					mainUnit.myShips.push( { x: 0, y: 0, possibleEvents: [], myPlayer: ref.unitIndex, myType: 'players', canExplore: true, tradeRoute: [], tradeRouteCounter: -1 }  );

					mainUnit.resources -= cost;
				} else {
					// TO DO: Make events that generate more income
					//  => This is different from "place-dock" and "found-city", as it happens on the main player, not an individual ship
					
					//obj.possibleEvents.push("");
				}

				break;

			// START A NEW TRADE ROUTE
			// Pick a random dock to trade with
			case 'start-trade-route':
				// get one of our own docks (which is from where we start)
				let ourDocks = this.unitsInWorld.players[ ref.unitIndex ].docks;

				// if we don't have docks, the show cannot go on!
				if(ourDocks.length <= 0) {
					break;
				}

				// initialize trade route
				obj.tradeRoute = [];
				obj.tradeRouteCounter = 0;

				// set a random dock as our start dock
				obj.tradeRoute[0] = ourDocks[ Math.floor( Math.random() * ourDocks.length )];

				// keep searching for a player with docks
				// timeout after 10 tries
				let pickPlayer;
				let tries;
				do {
					pickPlayer = this.unitsInWorld.players[ Math.floor( Math.random() * this.unitsInWorld.players.length ) ];
					tries++;

					if(tries >= 10) {
						break;
					}
				} while( pickPlayer.docks.length <= 0 || pickPlayer.num == ref.unitIndex );

				// we failed in finding a potential dock!
				if(tries >= 10) {
					obj.tradeRouteCounter = -1;
					break;
				}

				// then get a random dock, and save it as the trade route destination
				obj.tradeRoute[1] = pickPlayer.docks[ Math.floor( Math.random() * pickPlayer.docks.length )];					
				break;

			// CONTINUE ON TRADE ROUTE
			// Just jump back and forth between docks, delivering resources everytime it gets BACK
			case 'trade-route':
				// if we're meant to have a trade route, but we don't, keep trying to find one
				if(obj.tradeRouteCounter < 0) {
					obj.possibleEvents.push("start-trade-route");
					break;
				}

				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];

				// switch between start and end
				obj.tradeRouteCounter = (obj.tradeRouteCounter + 1) % 2;

				// move ship to that location
				obj.x = obj.tradeRoute[obj.tradeRouteCounter].x
				obj.y = obj.tradeRoute[obj.tradeRouteCounter].y

				// TO DO: If a trade request is ignored, relations become worse
				// TO DO: But if a trade route is succesful, relations strengthen

				// if it's the home base, get resources
				if(obj.tradeRouteCounter == 0) {
					mainUnit.resources += 4;
				}
				break;

			// FISH
			// The ship simply stands still where it is and generates some resources every turn
			case 'fish': 
				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];
				mainUnit.resources += 2.5;

				break;

			// ATTACK A SHIP
			// The ship searches for a ship nearby, which is not their own/friendly, and attacks it
			// TO DO
			case 'attack-ship': 

				break;


			// EXPLORE ACTION
			case 'explore':
				// if this object doesn't have a "myPlayer" property, stop here
				// this means that it's a general event or an event on a general group (like a whole player entity)
				// TO DO: Pirate ships can also explore, so this if-statement might change in the future
				if(!obj.canExplore) {
					break;
				}

				// get the free tiles
				let curPlayer = this.unitsInWorld["players"][ obj.myPlayer ];

				// pick X free tiles to explore
				//  => mark these as "owner = this player"
				//  => remove them from possibleTiles
				//  => add the newly found tiles to possibleTiles
				let maxExplores = 3;
				for(let i = 0; i < maxExplores; i++) {
					// if there's nothing left to explore, don't even try!
					// break out of the whole loop
					if(curPlayer.possibleTiles.length <= 0) {
						break;
					}

					// get random tile
					let randIndex = Math.floor( Math.random() * curPlayer.possibleTiles.length );

					// remove tile from array (and save it, in one line of code!)
					let tempTile = curPlayer.possibleTiles.splice(randIndex, 1)[0];
					let actualTile = this.map[tempTile.y][tempTile.x];

					// if this tile has another owner OR has a dock, don't explore it
					// but continue to the next tile, and reduce the incrementer (so we will explore enough tiles)
					if( actualTile.owner >= 0 || actualTile.dock != null || actualTile.city != null) {
						i--;
						continue;
					}

					// set this tile to be owned by this player now!
					// (save the index of the player)
					this.map[tempTile.y][tempTile.x].owner = obj.myPlayer

					// check tiles around it for possible new explores
					let landTiles = 0;
					const positions = [[1,0],[-1,0],[0,1],[0,-1]]
				    for(let a = 0; a < 4; a++) {
						let x = this.wrapCoords(tempTile.x + positions[a][0], this.mapWidth);
						let y = this.wrapCoords(tempTile.y + positions[a][1], this.mapHeight);

						// if this tile is at sea,
						// ... and nobody owns it yet
						// ... and there isn't a dock
						// ... try to own it!
						// NOTE: In later versions, there will be other units that explore land
						if(this.map[y][x].val < 0.2) {
							if( this.map[y][x].owner < 0 && this.map[y][x].dock == null) {
								curPlayer.possibleTiles.push({ x: x, y: y });
							}
						} else {
							landTiles++;
						}
				    }

					// move the ship to the tile
				    obj.x = tempTile.x;
					obj.y = tempTile.y;

					// if there's land (so we can build something) ...
					// ... plan the event to build something
					if(landTiles > 0) {
						obj.possibleEvents.push("place-dock");
						obj.possibleEvents.push("found-city");
						break;
					}

				    // TO DO: When checking surrounding tiles, we can check how many LAND tiles are among them
				    // If there is at least one land tile, this sea tile becomes a possible place for a DOCK
				    // If we find a land tile neighbouring a sea tile, this becomes a possible place for a COAST CITY
				}

				break;
		}

		// add possibleEvents (from the event we're currently evaluating; saved in dictionary)
		// to the end of the array
		// NOTE: might be nothing, might be very important
		obj.possibleEvents.push(...possibleEvents)

	},

	executeMainEventAction(ev, obj) {
		let num;
		const possibleEvents = EVENT_DICT["main"][ev][1];

		// most main events have a special action associated with it
		// this switch statement executes those actions
		switch(ev) {

			// NEW PLAYER: A new player joins. Add him to the array of players, and give it some future events.
			case 'new-player':
			// get player num
			num = this.unitsInWorld.players.length;

			// if we already have enough players, stop here
			if(num >= this.maxPlayers) {
				eventSucceeded = false;
				break;
			}

			// determine random starting position
			// keep trying until we have a non-land tile
			let startX, startY;
			do {
				startX = Math.floor( Math.random() * this.mapWidth);
				startY = Math.floor( Math.random() * this.mapHeight);
			} while( this.map[startY][startX].val >= 0.2 || this.map[startY][startX].owner >= 0);

			// add player to array
			const newPlayer = { num: num, myShips: [], possibleEvents: [], possibleTiles: [ {x: startX, y: startY }], docks: [], cities: [], resources: 8, myPlayer: num, myType: 'players' };

			// give himself possible events
			newPlayer.possibleEvents = possibleEvents

			// add player to the world
			this.unitsInWorld.players.push(newPlayer);

			// NOTE: The first thing a player does, is build a new ship. So, that always happens in the "build-ship" event

			// event strings (for logging)
			//eventStrings = [num];
			break;

		// NEW PIRATE: A new pirate joins the game. Add him to the pirates array, and plan his death.
		case 'pirate-born':
			let piratesList = this.unitsInWorld.pirates;

			num = piratesList.length;
			// go through all pirates and insert pirate at first "null" position
			// this ensures the array doesn't grow very large (with useless null values) over time
			for(let i = 0; i < piratesList.length; i++) {
				if(piratesList[i] == null) {
					num = i;
					break;
				}
			}

			// create new pirate
			// save possible follow-up events
			// TO DO: Give pirates a name, ship name, place of birth/prefrence, position, strength, etc.
			const newPirate = { num: num };
			newPirate.possibleEvents = possibleEvents;
			
			this.unitsInWorld.pirates[num] = newPirate;

			// Plan death (20 turns later, for now)
			this.timedEvents.push([this.timestep + 20, 'pirates', num, 'pirate-dies']);

			// event strings (for logging)
			//eventStrings = [num];
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

			// create new monster
			// save possible follow-up events
			const newMonster = { num: num };
			newMonster.possibleEvents = possibleEvents;
			this.unitsInWorld.monsters.push(newMonster)

			// event strings (for logging)
			//eventStrings = [num];
			break;
		}
	},

	logEvent: function(ev, inp) {
		// replace all "@[x]" bits with their corresponding input/string/value
		for(let a = 0; a < inp.length; a++) {
			ev = ev.replace( '@[' + a + ']', inp[a] );   				
		}

		// save it inside overall timeline display
		this.allEventsNow.push(ev);

		// log it (for debugging)
		console.log(ev);
	},

	updateTimeline: function() {
		/***

			UPDATING EVENTS/SIMULATION

		***/

		this.allEventsNow = [];
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
					// execute the event (send the event name AND the object to which it pertains)
					// In most cases, that just means an "end" condition: remove this unit or stop this "phase"
					this.executeSubEventAction( curEv[3], curUnit, { unitType: curEv[1], unitIndex: curEv[2] } );

					// log the event (debugging)
					console.log("TIMED EVENT ||", curEv[3]);
				}

				// remove event from array
				this.timedEvents.splice(i, 1);
				i--;
			}
		}

		// for each player, generate income
		let curPlayers = this.unitsInWorld.players;
		for(let i = 0; i < curPlayers.length; i++) {
			// income is always at least 1
			// every dock generates income
			// every city generates different income, but costs a little as well (to maintain/feed everyone)
			// a ship doesn't generate income by default, but always costs a little to maintain
			//  => a ship might give income if it's part of a trade route OR if it destroys another ship
			// ??
			let income = (curPlayers[i].docks.length * 0.5) + (curPlayers[i].cities.length * 0.5) - (curPlayers[i].myShips.length*2);
			if(income <= 0) {
				income = 1;
			}

			curPlayers[i].resources += income;

			// the main player can always try to build a ship (after getting income)
			curPlayers[i].possibleEvents.push("build-ship");
		}

		// for each player, check possible events, pick one
		// NOTE: If no possible events, it automatically goes to exploring mode
		for(let i = 0; i < curPlayers.length; i++) {
			// execute one event on the player as a whole/group
			// this is a general event like "start a war"
			let curPlayer = curPlayers[i];
			this.pickEvent(curPlayer);

			// loop through all the ships that this player has
			// for each ship, also execute one event
			let playerShips = curPlayer.myShips;
			for(let a = 0; a < playerShips.length; a++) {
				this.pickEvent(playerShips[a]);
			}
		}

		// if nothing happens OR with a certain probability ...
		// ... go through all possible main events and pick one
		// NOTE: main events don't necessarily need to be related to a certain player

		// QUESTION / TO DO: If the chosen event does not succeed, try again, until we find one that DOES succeed?
		if(!somethingHappened) {
			// simply pick a random main event; second parameter ensures it is general (and not a "possibleEvents" array)
			this.pickEvent(EVENT_DICT["main"], true)
		}




		/***

			DISPLAYING TERRITORY

		***/

		this.territoryGraphics.clear();

		// display territory + docks
		let ownerColors = [0xFF0000, 0xFF00FF, 0x000000, 0x00FFFF, 0xFFFF00];
		let dockColors = [0xAA0000, 0xAA00AA, 0x333333, 0x00AAAA, 0xAAAA00];
		let shipColors = [0x660000, 0x660066, 0x666666, 0x006666, 0x666600];

		for(let y = 0; y < this.mapHeight; y++) {
			for(let x = 0; x < this.mapWidth; x++) {
				let curOwner = this.map[y][x].owner;
				let noDock = (this.map[y][x].dock == null);

				// territory
				if(curOwner >= 0) {
					if(noDock) {
						this.territoryGraphics.fillStyle(ownerColors[curOwner], 1);						
					} else {
						this.territoryGraphics.fillStyle(dockColors[curOwner], 1);
					}

					this.territoryGraphics.fillRect(x * this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);
				}
			}
		}

		// display ships
		for(let i = 0; i < this.unitsInWorld.players.length; i++) {
			let pShips = this.unitsInWorld.players[i].myShips;
			for(let a = 0; a < pShips.length; a++) {
				this.territoryGraphics.fillStyle(shipColors[i], 1);
				this.territoryGraphics.fillRect(pShips[a].x * this.tileSize, pShips[a].y * this.tileSize, this.tileSize, this.tileSize);
			}
		}


		/***

			DISPLAYING THE TIMELINE

		***/

		this.timeGraphics.visible = false;

		// display the events on the timeline
		// switch between low and high text, so it stays readable (and doesn't overlap)
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
		/*
		for(let a = 0; a < this.allEventsNow.length; a++) {
			this.timeGraphics.myTextSprites.push( this.add.text(x, y + 60 + a*20 + extraY, this.allEventsNow[a], { fontSize: 12, color: "#FFFFFF" }).setOrigin(0.5) );
		}
		*/

		// display vertical line (with correct height to reach the events)
		this.timeGraphics.fillRect(x, y, 3, 60 + extraY);

		// increase timestep
		this.timestep++;

		// arbitrary ending condition (time out after X number of steps)
		if(this.timestep >= this.maxSteps) {
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
