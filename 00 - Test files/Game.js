/** Game.js
 *  
 *  This file contains the main game state
 *  It loads the map (that is given to it)
 *  And provides all the gameplay
 *
 */

const EVENT_DICT = {

	"main": {
		// new units (player, pirate, monster) enter the world
		"new-player": ["New player!", [] ],
		"pirate-born": ["Pirate @[0] started", [] ],
		"new-monster-type": ["Monster @[0] sighted", [] ],

		// random events (bad)
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
		"ask-aid": ["Player @[0] asks resource aid", [] ],

		// relationship events
		"diplomacy": ["Player @[0] reached out to @[1] to increase friendship", [] ],

		// timed events (with units dying or "ending", mostly)
		"natural-disaster-end": ["Natural disaster ended", [] ],
		"pirate-dies": ["Pirate @[0] died", [] ],
		"monster-rampage-end": ["Monster @[0] rampage ended", []],
		"war-ends": ["The war has ended", [] ],

		// everything war-related
		"start-war": ["Player @[0] started a war with @[1]", [] ],
		"join-war": ["Player @[0] joins the war", [] ],
		"conquer": ["Player @[0]'s ship is conquering", ['conquer']],
	},

}

// REMARK: The "@[x]" bits represent an unknown value that should be input there (at runtime). 

const CLUE_STRINGS = [
	"They say @[name]'s treasure sank in the @[0] ocean", // deep or shallow
	"The Treasure of @[name] should be @[0] tiles from the nearest island", // integer
	"@[name] hid a treasure somewhere in sector @[0]", // sector number: 1 up to and including 9
	"There are @[0] docks within a @[1] tile radius of @[name]'s treasure", // integer, integer 
	"@[name]'s treasure is probably near @[dock][0]", // dock lookup => dock index
	"@[player][0] is currently closest to @[name]'s treasure!", // player lookup => player index

]

/*
Meer naar links of meer naar rechts?
In de buurt van een monster "spawn point"?
Hoeveel is de afstand naar <een andere belangrijke plek in de wereld>?
*/



/*

TO DO:

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
    	this.mapWidth = 40;
    	this.mapHeight = 20;

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

				this.map[y][x] = { val: curVal,  owner: -1, units: [], numUnits: 0, dock: null, city: null };
			}
		}
	

		/*** CREATE MAP VISUALS ***/

		// Graphics docs (Phaser v3): https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html
		// display map
		var graphics = this.add.graphics(0, 0);

		this.timeGraphics = this.add.graphics(0,0);
		this.timeGraphics.myTextSprites = [];

		this.territoryGraphics = this.add.graphics(0,0);

		var popoutGraphics = this.add.graphics(0,0);

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

				// display this tile (just a rectangle with flat colours)
				graphics.fillRect(x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);

				// if this is ocean, but the tile above us is land, display 3D-effect pop-out
				if(curVal < 0.2 && y >= 1 && this.map[y - 1][x].val >= 0.2) {
					// display a dark-brown rectangle, same width as tile, but small height ( = pop-out height)
					popoutGraphics.fillStyle(0x341C02, 1); //0x654321 ??
					popoutGraphics.fillRect(x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize*0.2);

					// display a transparent dark (blue) rectangle, same width as tile, but small height ( = shadow of the island )
					popoutGraphics.fillStyle(0x000000, 0.3);
					popoutGraphics.fillRect(x*this.tileSize, ( y + 0.2) *this.tileSize, this.tileSize, this.tileSize*0.15);					
				}

				//this.add.text((x+0.5)*this.tileSize, (y+0.5)*this.tileSize, Math.round(curVal * 10)/10, { fontSize: 16 }).setOrigin(0.5);
			}
		}

		/*** CREATE TIMELINE ***/

		// Initialize timeline
		this.timestep = 0;
		this.unitsInWorld = { players: [], pirates: [], monsters: [] };

		this.timedEvents = [];

		this.maxPlayers = 3;
		this.worldAtWar = false;
		this.maxSteps = 100;

		this.allEventsNow = [];

		/*** DISPLAY RELATIONSHIPS ***/
		this.playerRelations = [];
		for(let i = 0; i < this.maxPlayers; i++) {
			let newText = this.add.text(20, i*50, 'Player ' + i + ': ');

			this.playerRelations.push(newText);
		}

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

	sinkShip: function(ship, attacker) {
		// TO DO
		// TO DO: I need different code for pirate ships ... meh
		// For now, just destroy the ship, by setting it to null and removing it from the map (by setting it to negative coordinates)
		this.placeSimUnit(ship, -1, -1);

		console.log("SHIP SUNK || ", ship.name);

		this.unitsInWorld.players[ ship.myPlayer ].myShips[ ship.num ] = null;

		// change relationships: the one that's been attacked is angry!
		this.changeRelationship(ship.myPlayer, attacker.myPlayer, -3);

		// the loser loses resources
		this.unitsInWorld.players[ ship.myPlayer ].resources -= 8;

		// the winner gains a slight amount of resources
		this.unitsInWorld.players[ attacker.myPlayer ].resources += 1;
	},

	clamp: function(min, val, max) {
		return Math.min(Math.max(val, min), max);
	},

	changeRelationship: function(num1, num2, delta) {
		let p1 = this.unitsInWorld["players"][num1], p2 = this.unitsInWorld["players"][num2]

		let threshold = -10;
		p1.relations[num2] = this.clamp(-10, p1.relations[num2] + delta, 10);
		p2.relations[num1] = this.clamp(-10, p2.relations[num1] + delta, 10);

		if(p1.relations[num2] <= threshold) {	
			if(!this.worldAtWar) {
				p1.possibleEvents = ['start-war'];					
			} else {
				p1.possibleEvents = ['join-war'];
			}	
		}

		if(p2.relations[num1] <= threshold) {
			if(!this.worldAtWar) {
				p2.possibleEvents = ['start-war'];					
			} else {
				p2.possibleEvents = ['join-war'];
			}
		}
			
	},

	placeSimUnit: function(obj, x, y) {
		let oldTile = this.map[obj.y][obj.x];

		// negative numbers means this unit won't move to a new place!
		if(x < 0 || y < 0) {
			return;
		}

		let newTile = this.map[y][x];

		// remove it from the old tile
		if(oldTile.numUnits > 0 && ("myTileIndex" in obj)) {
			// remove object from previous tile
			oldTile.units[ obj.myTileIndex ] = null;

			// reduce num units
			oldTile.numUnits--;

			// if there are no units, clear the units array
			// (otherwise the null values stay in there and it is never reset)
			if(oldTile.numUnits <= 0) {
				oldTile.units = [];				
			}
		}

		// otherwise, add it to the new tile
		// update corresponding map tile
		newTile.units.push(obj);
		newTile.numUnits++;

		// save this object's tile index
		obj.myTileIndex = (newTile.units.length - 1);

		// update object itself
		obj.x = x;
		obj.y = y;
	},

	// @parameter obj => the object of which we should pick an event (always in list "possibleEvents")
	pickEvent: function(obj, generalEvent = false) {
		// if the object is null, which means it is destroyed or unavailable in some way, do nothing
		if(obj == null) {
			console.log("NULL OBJECT HERE")
			return;
		}

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

		let eventSucceeded = false;

		// perform required action for this event
		// the function is split between main and sub
		// there's no other reason for this than readability: the functions can be shorter and more to the point
		if(evType == "main") {
			eventSucceeded = this.executeMainEventAction(ev, obj);		

			// main events don't have general follow-ups
			// instead, any possible events are handled in the "executeMainEventAction"	
		} else {
			let unitType = ("myType" in obj) ? obj.myType : null;
			let unitIndex = ("myPlayer" in obj) ? obj.myPlayer : null;

			eventSucceeded = this.executeSubEventAction(ev, obj, { unitType: unitType, unitIndex: unitIndex });
		}

		// record that something happened
		// TO DO

		if(eventSucceeded) {
			// get proper eventStrings for logging
			// TO DO
			let eventStrings = [obj.num];

			// log the event => give event description and input (to be replaced within string)
			this.logEvent(EVENT_DICT[evType][ev][0], eventStrings)
		}
	},

	executeSubEventAction(ev, obj, ref = null) {
		const possibleEvents = EVENT_DICT["sub"][ev][1];

		// determine whether event succeeded or not (mainly used for logging/saving)
		let eventSucceeded = true;

		// clear the possible events; later, we'll populate it with new ones
		obj.possibleEvents = [];

		switch(ev) {

			// START WAR
			// Find allies (on both sides) and make them join in the fight
			// TO DO: Pick a sub event (such as "repurpose all ships for fighting" or "grow army")
			// TO DO: Tell pirates that there's a scramble going on
			// Plan a timed event for ending the war
			case 'start-war':
				// go through all players, then through all their relations, and determine if they join the war
				for(let i = 0; i < this.unitsInWorld.players.length; i++) {
					let p = this.unitsInWorld.players[i];
					for(let j = 0; j < p.relations.length; j++) {
						// don't start a war with ourselves
						if(i == j) {
							continue;
						}

						// if the relationship is below minimum, join the war
						// I don't select "sides" => the relationship always shows who is fighting against who
						if(p.relations[j] <= -10) {
							p.atWar = true;
							break;
						}

						// if the relationship is above "friendly", we check if the person we're friendly with is at war
						// if so, we join
						if(p.relations[j] >= 5) {
							if(this.unitsInWorld.players[j].atWar) {
								p.atWar = true;
								break;
							}
						}
					}
				}

				// repurpose all player ships to conquer
				for(let i = 0; i < this.unitsInWorld.players.length; i++) {
					let p = this.unitsInWorld.players[i];
					for(let s = 0; s < p.myShips.length; s++) {
						p.myShips[s].possibleEvents = ['conquer'];
					}
				}

				// set the world to be at war
				this.worldAtWar = true;

				// War automatically ends after X timesteps
				// ROUND IT, because it checks if the timestap is exactly equal
				let maxWarDuration = Math.round(10 + Math.random()*20);
				this.timedEvents.push([this.timestep + maxWarDuration, null, null, 'war-ends']);

				break;

			// JOIN WAR
			// There's already a war raging, but something happened that made someone else join in
			// TO DO: WHAT ELSE HAPPENS HERE?! => also repurpose ships and stuff
			case 'join-war':
				obj.atWar = true;

				// repurpose all player ships to conquer
				for(let s = 0; s < obj.myShips.length; s++) {
					obj.myShips[s].possibleEvents = ['conquer'];
				}

				break;

			// PIRATE DIES: Remove the pirate from the world
			// For now, we just set to null. In the future, we might think about actually removing it.
			// TO DO: Maybe the list of ships can be an obj, with the keys being the NAME of the ship
			case 'pirate-dies':
				this.unitsInWorld[ ref.unitType ][ ref.unitIndex ] = null;

				// TO DO: Call "placeSimUnit" with negative coordinates, before setting this obj to null?

				break;

			// THE WAR ENDS
			// Repurpose all ships
			// Reset all relationships to neutral (or even positive)
			// Ensure people aren't too much at each other's throat from the get-go (there's enough room to explore/build)
			case 'war-ends':

				// go through all players
				for(let i = 0; i < this.unitsInWorld.players.length; i++) {
					let p = this.unitsInWorld.players[i];

					// ensure the player isn't at war anymore
					p.atWar = false;

					// reset any bad relationships to +5
					// PROBLEM (??): it resets to extremely high numbers
					for(let j = 0; j < p.relations.length; j++) {
						if(p.relations[j] <= -10) {
							this.changeRelationship(p.num, j, 15);
						}
					}
				}

				// end the general war in the world
				this.worldAtWar = false;

				break;

			// PLACE A DOCK
			// Check if we have enough resources; build if so, try to gather more if not
			// Set the dock value on the map to something other than null
			// Also save that the player has this dock
			case 'place-dock':
				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];
				var cost = 4;
				if(mainUnit.resources >= cost) {
					let newDock = { name: "Dockio", x: obj.x, y: obj.y };

					this.map[ obj.y ][ obj.x ].dock = newDock;
					mainUnit.docks.push(newDock);

					mainUnit.resources -= cost;
				} else {
					// Plan events that generate more income
					obj.possibleEvents.push(...["explore", "start-trade-route", "fish", "attack-ship", "ask-aid"]);

					eventSucceeded = false;
				}

				break;

			// FOUND A CITY
			// Set the city value on the map to something other than null
			case 'found-city':
				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];
				var cost = 4;
				if(mainUnit.resources >= cost) {
					let newCity = { name: "Holymolyknoly", x: obj.x, y: obj.y };

					this.map[ obj.y ][ obj.x ].city = newCity;
					mainUnit.cities.push(newCity);

					mainUnit.resources -= cost;
				} else {
					// Plan events that generate more income
					obj.possibleEvents.push(...["explore", "start-trade-route", "fish", "attack-ship", "ask-aid"]);

					eventSucceeded = false;
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
					// create new ship
					let newShip = { 
						name: "Queen Maxima's Revenge",
						x: 0, 
						y: 0, 
						possibleEvents: [], 
						myPlayer: ref.unitIndex, 
						myType: 'players', 
						canExplore: true, 
						tradeRoute: [], 
						tradeRouteCounter: -1 
					};

					// push it onto the ships array (of the player that owns it)
					mainUnit.myShips.push(newShip);

					// subtract resources
					mainUnit.resources -= cost;
				} else {
					// TO DO: Make events that generate more income
					//  => This is different from "place-dock" and "found-city", as it happens on the main player, not an individual ship
					
					//obj.possibleEvents.push("");
					eventSucceeded = false;
				}

				break;

			// START A NEW TRADE ROUTE
			// Pick a random dock to trade with
			case 'start-trade-route':
				// get one of our own docks (which is from where we start)
				let ourDocks = this.unitsInWorld.players[ ref.unitIndex ].docks;

				// if we don't have docks, the show cannot go on!
				if(ourDocks.length <= 0) {
					eventSucceeded = false;
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
				let tries = 0;
				do {
					pickPlayer = this.unitsInWorld.players[ Math.floor( Math.random() * this.unitsInWorld.players.length ) ];
					tries++;

					if(tries >= 10) {
						break;
					}
				} while( pickPlayer.docks.length <= 0 || pickPlayer.num == ref.unitIndex );

				// we failed in finding a potential dock!
				if(tries >= 10) {
					eventSucceeded = false;
					obj.tradeRouteCounter = -1;
					break;
				}

				// determine probability of player denying trade route
				var prob = Math.random() * (this.unitsInWorld.players[obj.myPlayer].relations[pickPlayer.num] + 10);
				if(prob <= 10) {
					// failure; decrease relationships, don't start trade route
					eventSucceeded = false;
					obj.tradeRouteCounter = -1;
					this.changeRelationship(obj.myPlayer, pickPlayer.num, -1);
					break;
				} else {
					// succes; increase relationship!
					// improve relationships with the person owning the dock
					this.changeRelationship(obj.myPlayer, pickPlayer.num, 3);
				}

				// then get a random dock, and save it as the trade route destination
				obj.tradeRoute[1] = pickPlayer.docks[ Math.floor( Math.random() * pickPlayer.docks.length )];

									
				break;

			// CONTINUE ON TRADE ROUTE
			// Just jump back and forth between docks, delivering resources everytime it gets BACK
			case 'trade-route':
				// if we're meant to have a trade route, but we don't, keep trying to find one
				if(obj.tradeRouteCounter < 0) {
					eventSucceeded = false;
					obj.possibleEvents.push("start-trade-route");
					break;
				}

				var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];

				// switch between start and end
				obj.tradeRouteCounter = (obj.tradeRouteCounter + 1) % 2;

				// move ship to that location
				this.placeSimUnit(obj, obj.tradeRoute[obj.tradeRouteCounter].x, obj.tradeRoute[obj.tradeRouteCounter].y)

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

			// ASK AID
			// If you don't have enough resources, others might lend you a hand
			// Can increase or decrease relationships
			case 'ask-aid':
				// loop through all players
				for(let i = 0; i < this.unitsInWorld.players.length; i++) {
					// if this player is not ourselves
					if(i != obj.myPlayer) {
						// ask for help
						// probability of success depends on relationship
						var prob = Math.random() * (this.unitsInWorld.players[obj.myPlayer].relations[i] + 10);
						if(prob <= 10) {
							// failure; decrease relationship
							this.changeRelationship(obj.myPlayer, i, -0.5);
						} else {
							// success; increase relationship, give resources
							this.changeRelationship(obj.myPlayer, i, 3)

							var mainUnit = this.unitsInWorld[ ref.unitType ][ ref.unitIndex ];
							mainUnit.resources += 5;

							break;
						}

					}
				}

				break;

			// DIPLOMACY
			// Find a random player, try to improve relationship with them
			case 'diplomacy':
				let randIndex = Math.floor( Math.random() * this.unitsInWorld.players.length);

				if(randIndex == obj.num) {
					// we can't improve relationships with ourself!
					eventSucceeded = false;
					break;
				}

				// try to become friends
				// probability of success depends on relationship
				var prob = Math.random() * (obj.relations[randIndex] + 10);
				if(prob <= 10) {
					// failure; decrease relationship
					this.changeRelationship(obj.num, randIndex, -1);
				} else {
					// success; increase relationship
					this.changeRelationship(obj.num, randIndex, 3);
				}

				break;


			// ATTACK A SHIP
			// The ship searches for a ship nearby, which is not their own/friendly, and attacks it
			// TO DO
			//  => get loot
			//  => only attack if non-friendly / really necessary
			//  => worsen relationships because of the attack
			//  => if the ship goes down, save it (the 5 ws: what/who/where/when/why?)
			case 'attack-ship': 
				// determine if we should attack
				// there are two cases in which we will attack: 
				//  => we have a negative relationship with the other vessel
				//  => we are really low on territory / resources
				let range = 3;

				// go through a square around the ship
				let firstShip = null;
				let foundEnemy = false;
				for(let y = 0; y < range*2; y++) {
					for(let x = 0; x < range*2; x++) {
						let curTile = this.map[y][x];

						// if this tile has units
						if(curTile.numUnits > 0) {
							// attack all that are not ours
							let unitsHere = curTile.units;
							//let unitString = JSON.stringify(unitsHere); // merely for debugging
							for(let a = 0; a < unitsHere.length; a++) {
								let curUnit = unitsHere[a];

								if(curUnit == null) {
									continue;
								}

								if(curUnit.myPlayer != obj.myPlayer) {
									// get relationship with this ship('s player)
									let rel = this.unitsInWorld.players[ obj.myPlayer ].relations[ curUnit.myPlayer ];

									if(rel < 0) {
										firstShip = curUnit;
										foundEnemy = true;
										break;
									} else if(firstShip == null) {
										firstShip = curUnit;
									}
								}
							}
						}

						if(foundEnemy) { break; }
					}
					if(foundEnemy) { break; }
				}

				// if we have found a ship ...
				if(firstShip != null) {
					// if it's not an enemy, and we have no need to kill it, don't kill it!
					if(!foundEnemy && this.unitsInWorld.players[ firstShip.myPlayer ].resources >= 2 && this.unitsInWorld.players[ firstShip.myPlayer ].possibleTiles.length >= 5) {
						break;
					}

					// however, if any of the conditions apply, we should kill the darn unit
					this.sinkShip(firstShip, obj);
				}


				break;

			// CONQUER; arguably the most important action
			// When at war, ships will be set to conquer
			// This means they basically become 4X machines: 
			// 1) they explore (looking for enemy stuff), 
			// 2) they expand territory, 
			// 3) they exploit (by taking over docks/cities, building more ships, getting resources, etc.)
			// 4) they exterminate (by attacking all enemy things they see)
			case 'conquer':


				break;


			// EXPLORE ACTION
			case 'explore':
				// if this object doesn't have a "myPlayer" property, stop here
				// this means that it's a general event or an event on a general group (like a whole player entity)
				// TO DO: Pirate ships can also explore, so this if-statement might change in the future
				if(!obj.canExplore) {
					eventSucceeded = false;
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

					// if this tile already has a DOCK or CITY, don't explore it
					// but continue to the next tile, and reduce the incrementer (so we will explore enough tiles)
					if(actualTile.dock != null || actualTile.city != null) {
						i--;
						continue;
					}

					if( actualTile.owner >= 0) {
						// if the tile is owned by someone else, decrease relationships slightly
						let owner = actualTile.owner;
						if( owner != curPlayer.num ) {
							this.changeRelationship(owner, curPlayer.num, -0.5);
						} else {
							i--;
							continue;
						}

						// if we have almost nothing else to explore, take this territory!
						// (we're out of space, but we always want to expand!)
						// taking territory obviously has a higher penalty
						if(curPlayer.possibleTiles.length <= 5) {
							this.changeRelationship(owner, curPlayer.num, -2)
						} else {
							i--;
							continue;
						}
						
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
						// NOTE: In later versions, there will be different units that explore land
						if(this.map[y][x].val < 0.2) {
							curPlayer.possibleTiles.push({ x: x, y: y });
						} else {
							landTiles++;
						}
				    }

				    // move the ship to the tile
				    this.placeSimUnit(obj, tempTile.x, tempTile.y);

					// if there's land (so we can build something) ...
					// ... plan the event to build something
					if(landTiles > 0) {
						obj.possibleEvents.push(...["place-dock", "found-city"]);
						break;
					}
				}

				break;
		}

		// add possibleEvents (from the event we're currently evaluating; saved in dictionary)
		// to the end of the array
		// NOTE: might be nothing, might be very important
		obj.possibleEvents.push(...possibleEvents)

		return eventSucceeded;
	},

	executeMainEventAction(ev, obj) {
		let num;
		const possibleEvents = EVENT_DICT["main"][ev][1];

		let eventSucceeded = true;

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
				const newPlayer = { 
					num: num, 
					myShips: [], 
					possibleEvents: [], 
					possibleTiles: [ {x: startX, y: startY }], 
					docks: [], 
					cities: [], 
					resources: 8, 
					myPlayer: num, 
					myType: 'players',
				};

				// set all relations to 0 (even for future players)
				newPlayer.relations = new Array(this.maxPlayers).fill(0);

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



		return eventSucceeded;
	},

	logEvent: function(ev, inp) {
		// replace all "@[x]" bits with their corresponding input/string/value
		for(let a = 0; a < inp.length; a++) {
			ev = ev.replace( '@[' + a + ']', inp[a] );   				
		}

		// save it inside overall timeline display
		this.allEventsNow.push(ev);

		// log it (for debugging)
		//console.log(ev);
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
				let curUnit, generalEvent = false;
				if(curEv[1] == null || curEv[2] == null) {
					curUnit = null;
					generalEvent = true;
				} else {
					curUnit = this.unitsInWorld[ curEv[1] ][ curEv[2] ];
				}

				// log the event (debugging)
				console.log("TIMED EVENT ||", curEv[3]);
				
				if(curUnit == null || curUnit == undefined) {
					// a general event will not have any unit attached
					if(generalEvent) {
						this.executeSubEventAction(curEv[3], {}, {});
					} else {
						// unit doesn't exist anymore; do nothing
						//console.log("Unit doesn't exist anymore; no further action");
					}
				} else {
					// execute the event (send the event name AND the object to which it pertains)
					// In most cases, that just means an "end" condition: remove this unit or stop this "phase"
					this.executeSubEventAction( curEv[3], curUnit, { unitType: curEv[1], unitIndex: curEv[2] } );	
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
			let p = curPlayers[i];
			let income = (p.docks.length * 0.5) + (p.cities.length * 0.5) - (p.myShips.length*2);
			if(income <= 0) {
				income = 1;
			}

			p.resources += income;

			// the main player can always try to build a ship (after getting income)
			if(p.resources >= 8) {
				p.possibleEvents.push("build-ship");				
			}

			// and if the player senses relationships aren't at their best, he can try a diplomatic action
			// random, for now
			if(Math.random() >= 0.5) {
				p.possibleEvents.push("diplomacy");
			}
		}

		// for each player, check possible events, pick one
		// NOTE: If no possible events, it automatically goes to exploring mode
		for(let i = 0; i < curPlayers.length; i++) {
			// execute one event on the player as a whole/group
			// this is a general event like "start a war"
			let curPlayer = curPlayers[i];

			console.log(curPlayer.possibleEvents);

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
						this.territoryGraphics.fillStyle(ownerColors[curOwner], 0.6);						
					} else {
						this.territoryGraphics.fillStyle(dockColors[curOwner], 0.6);
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

		// update player relations
		for(let i = 0; i < this.unitsInWorld["players"].length; i++) {
			this.playerRelations[i].text = 'Player ' + i + ': ' + JSON.stringify( this.unitsInWorld["players"][i].relations );
		}


		// display text (that shows all events for this step)
		/*
		for(let a = 0; a < this.allEventsNow.length; a++) {
			this.timeGraphics.myTextSprites.push( this.add.text(x, y + 60 + a*20 + extraY, this.allEventsNow[a], { fontSize: 12, color: "#FFFFFF" }).setOrigin(0.5) );
		}
		*/

		// simply log all events (of the current timestep) at once
		console.log(this.timestep);
		// console.log(this.allEventsNow);

		// display vertical line (with correct height to reach the events)
		this.timeGraphics.fillRect(x, y, 3, 60 + extraY);

		// increase timestep
		this.timestep++;

		// arbitrary ending condition (time out after X number of steps)
		if(this.timestep >= this.maxSteps) {
			this.simulationTimer.remove();
		}
	},

	generatePirateName: function() {
		let nameParts = ["black", "beard", "sparrow", "thunder", "storm", "bird", "sun", "silver", "gold", "diamond", "hurricane",
						 "finger", "death", "dance", "fighter", "breaker", "ship", "treasure", "wizard"]
		let nameLength = Math.floor( Math.random() * 2) + 1;

		// keep making new names, until we find one that hasn't already been used
		// TO DO/IDEA: We can have longer names, but then they'll be split into two (first name + last name, or simply a double name)
		let name;
		do {
			name = '';
			for(let i = 0; i < nameLength; i++) {
				name += nameParts[Math.floor( Math.random() * nameParts.length )];
			}
		} while(name in this.treasures);

		// return name CAPITALIZED
		return name.charAt(0).toUpperCase() + name.slice(1);
	},

	placeTreasures: function() {
		this.treasures = {};

		let numTres = this.maxPlayers*3;
		for(let i = 0; i < numTres; i++) {
			this.placeTreasure();
		}
	},


	placeTreasure: function() {
		// find a proper spot for the treasure
		//  => in the ocean
		//  => not under a dock
		//  => not under a city
		let x, y, tileAvailable;
		do {
			x = Math.floor( Math.random() * this.mapWidth );
			y = Math.floor( Math.random() * this.mapHeight );

			tileAvailable = (this.map[y][x].val < 0.2 && this.map[y][x].dock == null && this.map[y][x].city == null)
		} while(!tileAvailable);

		// get a name for this treasure
		// (in the final version, this will simply be the name of the pirate that owned it)
		let treasureName = this.generatePirateName();

		// add treasure to the array
		this.treasures[treasureName] = { x: x, y: y }

		// log it (for testing purposes)
		console.log(" == TREASURE BY " + treasureName + " CREATED! == ");

		// generate clues for this treasure
		let numClues = 2;
		this.generateClues(x, y, treasureName, numClues);
	},

	generateClues: function(x, y, name, numClues) {
		let cluesAlreadyUsed = [];
		let clueType = -1;
		let TOTAL_NUM_CLUES = CLUE_STRINGS.length;
		for(let i = 0; i < numClues; i++) {
			let curClue = {};

			// pick a random clue
			// as long as we haven't used this clue type before
			do {
				clueType = Math.floor( Math.random() * TOTAL_NUM_CLUES );
			} while(cluesAlreadyUsed.includes(clueType))

			// add clue to used clues
			cluesAlreadyUsed.push(clueType)

			// get the correct information
			curClue.type = clueType;
			curClue.name = name;
			curClue.info = this.getClueInfo(x, y, clueType);

			// log it (for testing purposes)
			let clueString = CLUE_STRINGS[clueType];
			clueString = clueString.replace('@[name]', name);

			// static replacements: a number that will never change
			for(let a = 0; a < curClue.info.length; a++) {
				clueString = clueString.replace( '@[' + a + ']', curClue.info[a]);   				
			}

			// dynamic replacements: looking up the name of a dock/city/island/whatever
			// HANDY URL: https://stackoverflow.com/questions/29560913/javascript-regex-to-extract-variables
			// HANDY URL: https://stackoverflow.com/questions/14213848/difference-between-and
			
			// TO DO: Don't replace by result[1], but get the actual parameter (curClue.info[ result[1] ]), and THEN get the actual dock with that

			var regex = new RegExp(/\@\[(\w+?)\]\[(\d+?)\]/gi), result;
			
			while(result = regex.exec(clueString)) {
				let unitIndex = curClue.info[ result[2] ]; // result[2] holds an index only; this index refers to the part of the clue info that we need
				let neededInfo = this.unitsInWorld[ result[1] ][ unitIndex ].name; // once we have the info, we can get the name of the unit

			    clueString = clueString.replace("@[" + result[1] + "][" + result[2] + "]", "[[" + result[1] + "io replaco " + result[2] + " ]]")
			}


			console.log( clueString )
		}
	},

	getClueInfo: function(x, y, num) {
		switch(num) {
			// return whether the treasure is in deep or shallow ocean
			case 0:
				let val = this.map[y][x].val;
				if(val < -0.2) {
					return ['deep']
				}
				return ['shallow'];

				break;

			// get distance to nearest island tile
			case 1:
				break;
		}

		return [];
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
