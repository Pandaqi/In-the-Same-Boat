/** Game.js
 *  
 *  This file contains the main game state
 *  It loads the map (that is given to it)
 *  And provides all the gameplay
 *
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

    	this.load.image('aishipskey', 'resIconGold.png');
    },

    calculateRoute: function(start, end) {
    	let Q = new PriorityQueue();

    	Q.put(start, 0);

    	// Maps are fast for searching, need unique values, AND can use an object as the key
    	let came_from = new Map();
    	let cost_so_far = new Map();
    	let tiles_checked = new Map();

    	let startLabel = start[0] + "-" + start[1];

    	came_from.set(startLabel, null);
		cost_so_far.set(startLabel, 0);

		let reachable = false;

		while( !Q.isEmpty() ) {
			let current = Q.get();

			let currentLabel = current[0] + "-" + current[1]
			tiles_checked.set(currentLabel, true);
        
        	// stop when we've found the first "shortest route" to our destination
	        if(current[0] == end[0] && current[1] == end[1]) { reachable = true; break; }

	        // update all neighbours (to new distance, if run through the current tile)
			let positions = [[-1,0],[1,0],[0,1],[0,-1]];
			for(let a = 0; a < 4; a++) {
				let tempX = current[0] + positions[a][0];
	    		let tempY = current[1] + positions[a][1];

	    		if(tempX < 0) { tempX += this.mapWidth; } else if(tempX >= this.mapWidth) { tempX -= this.mapWidth; }
	    		if(tempY < 0) { tempY += this.mapHeight; } else if(tempY >= this.mapHeight) { tempY -= this.mapHeight;}

	    		// don't consider tiles that aren't sea
	    		if(this.map[tempY][tempX] >= 0.2) {
	    			continue;
	    		}

	    		// calculate the new cost
	    		// movement is always 1, in our world 
	    		let new_cost = cost_so_far.get(currentLabel) + 1;

	    		// get the tile
	    		let next = [tempX, tempY];
	    		let nextLabel = tempX + "-" + tempY;

	    		// if the tile hasn't been visited yet, OR the new cost is lower than the current one, revisit it and save the update!
	    		if(!cost_so_far.has(nextLabel) || new_cost < cost_so_far.get(nextLabel) ) {
	    			if(tiles_checked.has(nextLabel)) {
	    				continue;
	    			}

	    			// save the lower cost
	    			cost_so_far.set(nextLabel, new_cost)

	    			// calculate heuristic
	    			// 1) Calculate Manhattan distance to target tile
	    			let dX = Math.abs(tempX - end[0]);
	    			if(dX > 0.5*this.mapWidth) { dX = (this.mapWidth - dX) }

	    			let dY = Math.abs(tempY - end[1]);
	    			if(dY > 0.5*this.mapHeight) { dY = (this.mapHeight - dY) }

    				// 2) Shallow water has a higher cost than deep water
	    			
	    			let heuristic = (dX + dY) + this.map[tempY][tempX]*20;

	    			// add this tile to the priority queue
	    			// 3) Tie-breaker: Add a small number (1.01) to incentivice the algorithm to explore tiles more near the target, instead of at the start
	    			let priority = new_cost + heuristic * (1.0 + 0.01);
	    			Q.put(next, priority);

	    			// save where we came from
	    			came_from.set(nextLabel, current)
	    		}
			}
		}

		// if it was unreachable, tell that
		if(!reachable) {
			console.log("This target was not reachable");
			return [];
		}

		// reconstruct the path
		let path = []
		let current = end

	    while((current[0] != start[0] || current[1] != start[1])) {
	        path.push(current)
	        current = came_from.get(current[0] + "-" + current[1])
	    }

	    path.push(start); // add the start position to the path
	    path.reverse(); // reverse the array (default goes backwards; the reverse should go forward)

		return path
    },

    exploreIsland: function(x, y, island) {
    	// add this tile to the island
    	island.push([x,y]);

    	// mark this tile as checked
    	this.checkedTiles[x+"-"+y] = true;

    	// check tiles left/right/top/bottom
    	// TO DO: We don't check diagonally now. Should we?
    	var positions = [[-1,0],[1,0],[0,1],[0,-1]]
    	var freeTiles = []

    	for(let a = 0; a < 4; a++) {
    		let tempX = x + positions[a][0];
    		let tempY = y + positions[a][1];

    		// the map is seemless => top stitches to the bottom, left stitches to the right
    		if(tempX < 0) { 
    			tempX += this.mapWidth; 
    		} else if(tempX >= this.mapWidth) {
    			tempX -= this.mapWidth;
    		}

    		if(tempY < 0) {
    			tempY += this.mapHeight;
    		} else if(tempY >= this.mapHeight) {
    			tempY -= this.mapHeight;
    		}

    		let tempKey = tempX+"-"+tempY;

    		// if this is an island AND not yet checked, explore it!
    		if(this.map[tempY][tempX] >= 0.2) {
				if(!(tempKey in this.checkedTiles)) {
	    			this.exploreIsland(tempX, tempY, island);
	    		}
    		} else {
    			// if this tile is not an island (a free tile, water), save it
    			freeTiles.push([tempX, tempY]);
    		}
    	}

    	// If there's at least one non-land tile, this tile should be on the edge of the island
    	if(freeTiles.length > 0) {
    		// Pick one of the free spots, add it to the possible docks
    		let randFreeSpot = freeTiles[ Math.floor(Math.random() * freeTiles.length) ];

    		this.possibleDocks.push( randFreeSpot )
    	}

    	return island;
    },

	create: function() {
		// create new noise object
		//let gen = new SimplexNoise();
		//noise = new NOISE();
		
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

				// OLD CODE (2D noise)
				// let zoom = 150;
				//let nx = x*this.tileSize / zoom;
				//let ny = y*this.tileSize / zoom;
				//this.map[y][x] = noise.perlin2(nx, ny)

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
				//this.map[y][x] = NOISE.Simplex.prototype.noise(nx, ny, nz, nw);

		        /*
				// subtract RADIAL GRADIENT
				// value is the distance to the center by X and Y, and then taking the mean
				// this is too harsh => set all center values to 0, and bump the outside values up by 0.5 => creates a nice rolloff
				let radialValue = (Math.abs(nx - halfPxWidth)/halfPxWidth + Math.abs(ny - halfPxHeight)/halfPxHeight) * 0.5;
				if(radialValue < 0.5) {
					radialValue = 0;
				} else {
					radialValue -= 0.5;
				}

				this.map[y][x] = noise.perlin2(nx / 150, ny / 150) - radialValue;
				*/
			}
		}

		this.aiShips = [];

		/*** DETERMINE ISLANDS ***/
		// loop through the map
		for (let y = 0; y < this.mapHeight; y++) {
			for (let x = 0; x < this.mapWidth; x++) { 
				// everytime we find an island tile ...
				if(this.map[y][x] >= 0.2) {
					// that doesn't already belong to an island ...
					let key = x + "-"+y
					if(!(key in this.checkedTiles)) {
						this.possibleDocks = [];

						// start the investigation!
						this.islands.push( this.exploreIsland(x, y, []) );

						// pick a random dock for this island
						// get island size => get amount of free dock locations => determines dock size
						let islandSize = this.possibleDocks.length;
						let randDock = this.possibleDocks[ Math.floor(Math.random() * this.possibleDocks.length)]

						this.docks.push( { pos: randDock, size: islandSize, deal: [[0, 4], [2, 6]] } );
					}
				}
			}
		}

		/*** Place MONSTERS and PLAYER SHIPS ***/
		// determine amount of blocks needed
		let numMonsters = 10;
		let numPlayers = 3;
		let totalBlocks = numMonsters + numPlayers;

		// the ratio must be 3:1 (x to y), so, after solving the equality, this formula follows
		let blocksX = Math.sqrt(3 * totalBlocks);
		let blocksY = 1/3 * blocksX;

		// when rounding, we might get a number too far below or above the right one
		// that's why we need to differentiate between how we round the variables

		if(Math.ceil(blocksX)*Math.floor(blocksY) < totalBlocks) {
			blocksX = Math.floor(blocksX);
			blocksY = Math.ceil(blocksY);
		} else {
			blocksX = Math.ceil(blocksX);
			blocksY = Math.floor(blocksY);
		}

		console.log(blocksX, ' - ', blocksY)

		// populate block array
		let blockArr = [];
		for(let i = 0; i < blocksX; i++) {
			for(let j = 0; j < blocksY; j++) {
				blockArr.push({ x: i, y: j });
			}
		}
		
		console.time("Placing monsters and ships");

		// place monsters AND ships
		this.monsters = [];
		this.playerShips = [];
		for(let i = 0; i < totalBlocks; i++) {
			// monsters only spawn in sea that is deep enough
			// so keep trying, until we found a position
			let randIndex = Math.floor(Math.random() * blockArr.length);
			let randomBlock = blockArr.splice(randIndex, 1)[0];
			let numTries = 0;
			let maxTries = 10;

			// we have a maximum of 10 tries. 
			// If we haven't found a spot then, there's probably (almost) no correct spot within this sector
			let rX, rY;
			do {
				rX = Math.floor( (randomBlock.x + Math.random()) * (this.mapWidth / blocksX) );
				rY = Math.floor( (randomBlock.y + Math.random()) * (this.mapHeight / blocksY) );

				numTries++;
			} while (this.map[rY][rX] >= -0.2 && numTries <= maxTries);
			// If we've exceeded our tries, just pick a random spot on the MAP, not within our own sector
			// This should always succeed, even if it takes 50 or 100 tries, and is reasonably fast
			if(numTries > maxTries) {
				do {
					rX = Math.floor( Math.random() * this.mapWidth );
					rY = Math.floor( Math.random() * this.mapHeight );
				} while (this.map[rY][rX] >= -0.2);
			}

			if(i < numMonsters) {
				this.monsters.push( { x: rX, y: rY, chasing: false, target: null, prevTarget: null, chasingCounter: 0, reputation: 0 } );
			} else {
				this.playerShips.push( { x: rX, y: rY });
			}

		}

		console.timeEnd("Placing monsters and ships");

		/*** CALCULATE ROUTES BETWEEN HARBORS ****/
		console.time("Route calculations");

		let numDocks = this.docks.length;
		let connectionArray = [];

		// the "connection array" contains whether two docks are connected or not
		// this way, we don't need to search through all the docks all the time, we just check this array to see if there's a connection
		for(let i = 0; i < numDocks; i++) {
			// create an array filled with "false" values
			connectionArray[i] = Array(numDocks).fill(false);

			// we DO have a connection to ourselves
			connectionArray[i][i] = true; 

			// initialize routes property for this dock (used in the next loop)
			this.docks[i].routes = [];
		}

		let numAIShips = 0;
		for(let i = 0; i < numDocks; i++) {
			let curNumRoutes = this.docks[i].routes.length; // routes we already received from other docks
			let maxRoutesHarbor = Math.round( Math.sqrt(this.docks[i].size)*0.25 )// max routes our harbor can/should handle

			let maxRoutes = Math.min(this.docks.length - 1, maxRoutesHarbor); // max routes we would be able to find, in TOTAL, across the whole map
			let routesToDo = 0;

			if(curNumRoutes < maxRoutes) {
				routesToDo = maxRoutes - curNumRoutes;
			}

			while(routesToDo > 0) {
				// pick a random dock
				let j = Math.floor( Math.random() * this.docks.length) ;

				// if there's already a connection, continue immediately
				if(connectionArray[i][j]) {
					continue;
				} else {
					// otherwise, make the connection!
					let startPos = this.docks[i].pos;
					let endPos = this.docks[j].pos;

					let route = this.calculateRoute(startPos, endPos)

					// shave first and last bit from the route
					route.splice(0, 1);
					route.splice( (route.length-1) , 1);

					// save it on both docks (but in REVERSE on the second)
					this.docks[i].routes.push( { route: route, target: j } );
					this.docks[j].routes.push( { route: route.slice().reverse(), target: i } );

					// save both connections in the connection Array
					connectionArray[i][j] = true;
					connectionArray[j][i] = true;

					// we've finished one route!
					routesToDo--;
				}
			}

			// if this dock has routes, place an AI ship on each of them
			if(this.docks[i].routes.length > 0) {
				for(let r = 0; r < this.docks[i].routes.length; r++) {
					// TO DO: COPY THIS TO THE ACTUAL GAME
					// It happens more frequently than I thought
					if(this.docks[i].routes[r].route.length < 1) {
						// this route was unreachable
						continue;
					}

					let randRoute = this.docks[i].routes[r].route[0]; // immediately fetch the first (0 index) step of the route

					// save the dock and route index where you started
					// this is used to follow the route
			    	// TO DO: Save resources, attack/defense value, movement speed.
			    	numAIShips++;
			    	this.aiShips.push( { x: randRoute[0], y: randRoute[1], routeIndex: [i, r], routePointer: 0 } );
				}
			}
			
		}
		console.log("Number of computer ships:" + numAIShips);
		console.timeEnd("Route calculations");

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

		// make some different dock colors
		let dockColors = [0xFF00FF, 0x00FFFF, 0xFFFF00, 0xFFFFFF, 0x000000, 0xFF0000, 0x00FF00, 0x0000FF,
						0xFF00FF, 0x00FFFF, 0xFFFF00, 0xFFFFFF, 0x000000, 0xFF0000, 0x00FF00, 0x0000FF];

		// display the docks
		for(let i = 0; i < this.docks.length; i++) {
			let x = this.docks[i].pos[0];
			let y = this.docks[i].pos[1];

			// make the docks ... PURPLE
			graphics.fillStyle(dockColors[i], 1);

			graphics.fillRect(x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);

			// add size
			let dockSize = this.docks[i].size;
			this.add.text(x*this.tileSize, y*this.tileSize, dockSize, { fontSize: 16, color: "#000000" }).setOrigin(0.5);

			// display its routes
			for(let a = 0; a < this.docks[i].routes.length; a++) {
				let r = this.docks[i].routes[a].route;

				// loop through the route
				for(let rr = 0; rr < r.length; rr++) {
					let routeX = r[rr][0];
					let routeY = r[rr][1];

					// draw a small square (half size) for each route point
					graphics.fillRect((routeX + 0.375)*this.tileSize, (routeY + 0.375)*this.tileSize, 0.25*this.tileSize, 0.25*this.tileSize);
				}
			}
		}
		
		// set stroke style (beige, slightly transparent, not too thick)
		graphics.lineStyle(2, 0xF9E4B7, 0.7);

		var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

		// draw grid lines VERTICALLY
		// also add LETTERS at the top
		for (let x = 0; x < this.mapWidth; x++) {
			// x1, y1, x2, y2
			let line = new Phaser.Geom.Line(x*this.tileSize, 0, x*this.tileSize, this.mapHeight*this.tileSize);
			graphics.strokeLineShape(line);

			// supports single letter (A) and double letter (AA) -> (I don't expect to need more)
			let text = '?';
			if(x < 26) {
				text = alphabet[x]
			} else {
				text = alphabet[Math.floor(x / 26) - 1] + alphabet[x % 26];
			}

			this.add.text((x+0.5)*this.tileSize, this.tileSize*0.5, text, { fontSize: 16, color: "#000000" }).setOrigin(0.5);
		}
			
		// draw grid lines HORIZONTALLY
		// also add NUMBERS at the side
		for (let y = 0; y < this.mapHeight; y++) {
			let line = new Phaser.Geom.Line(0, y*this.tileSize, this.mapWidth*this.tileSize, y*this.tileSize);
			graphics.strokeLineShape(line);

			this.add.text(this.tileSize*0.5, (y+0.5)*this.tileSize, y, { fontSize: 16, color: "#000000" }).setOrigin(0.5);
		}

		// display the ships
		for(let i = 0; i < numPlayers; i++) {
			let curShip = this.playerShips[i];

			graphics.lineStyle(2, 0x0000FF, 1.0);
			graphics.fillStyle(0x00FFFF, 1.0);

			graphics.fillRect(curShip.x*this.tileSize, curShip.y*this.tileSize, this.tileSize, this.tileSize);
			graphics.strokeRect(curShip.x*this.tileSize, curShip.y*this.tileSize, this.tileSize, this.tileSize);
		}

		// display the AI ships
		this.aiShipSprites = [];
		for(let i = 0; i < this.aiShips.length; i++) {
			let curShip = this.aiShips[i];

			let newSprite = this.add.sprite(curShip.x*this.tileSize, curShip.y*this.tileSize, 'aishipskey');
			this.aiShipSprites.push(newSprite);

			newSprite.displayWidth = this.tileSize*0.7;
			newSprite.displayHeight = this.tileSize*0.7;
		}

		// display the monsters
		this.monsterSprites = [];
		for(let i = 0; i < numMonsters; i++) {
			let curMon = this.monsters[i];

			/*graphics.lineStyle(2, 0x000000, 1.0);
			graphics.fillStyle(0xFF0000, 1.0);

			graphics.fillRect(curMon.x*this.tileSize, curMon.y*this.tileSize, this.tileSize, this.tileSize);
			graphics.strokeRect(curMon.x*this.tileSize, curMon.y*this.tileSize, this.tileSize, this.tileSize);*/

			let newSprite = this.add.sprite(curMon.x*this.tileSize, curMon.y*this.tileSize, 'keythatdoesntexist');
			this.monsterSprites.push(newSprite);

			newSprite.displayWidth = this.tileSize*0.5;
			newSprite.displayHeight = this.tileSize*0.5;
		}

		

		var timer = this.time.addEvent({
		    delay: 500,                // ms
		    callback: this.moveShips,
		    //args: [],
		    callbackScope: this,
		    loop: true
		});

		//window.graphics = graphics;
	},

	wrapCoords: function(c, bound) {
		if(c < 0) { 
    		c += bound; 
    	} else if(c >= bound) {
			c -= bound;
		}
		return c;
	},

	moveShips: function() {

		// moving AI ships
		for(let i = 0; i < this.aiShipSprites.length; i++) {
			// get the SHIP
			let s = this.aiShips[i];

			let shipSpeed = 3;

			// get the route object (contains the actual route ("route") and the dock where the route ends ("target"))
			let routeObject = this.docks[ s.routeIndex[0] ].routes[ s.routeIndex[1] ];

			//increase pointer by ship speed
			s.routePointer = Math.min(routeObject.route.length - 1, s.routePointer + 3);

			// move SPRITE to next spot
			let nextSpot = routeObject.route[s.routePointer]

			let s1 = this.aiShipSprites[i];

			// NOTE: the "+ 0.5" is only for displaying, must be removed on the server
			s1.x = (nextSpot[0] + 0.5)*this.tileSize;
			s1.y = (nextSpot[1] + 0.5)*this.tileSize;

			// also update the object itself (instead of only the sprite)
			s.x = nextSpot[0];
			s.y = nextSpot[1];

			// if we're at the end, pick a new route
			if(s.routePointer == (routeObject.route.length - 1)) {
				let newDock = this.docks[ routeObject.target ];
				let routeIndex = Math.floor( Math.random() * newDock.routes.length );

				// Save the dock we're coming form (which was previously our target) and which of its routes we're taking
				s.routeIndex = [routeObject.target, routeIndex]
				s.routePointer = -1;
			}
		}

		// moving monsters ALTERNATIVE
		for(let i = 0; i < this.monsterSprites.length; i++) {
			let curSprite = this.monsterSprites[i];
			let curMon = this.monsters[i];

			let chaseSpeed = 3;
			let sightRadius = 6;

			let targetPos;

			// if we've chased for long enough, let go
			// TO DO: Do we always let go? Or only after we've destroyed the ship/stolen what we needed?
			if(curMon.chasingCounter >= 4) {
				curMon.chasingCounter = 0;
				curMon.chasing = false;
				curMon.prevTarget = curMon.target;
				curMon.target = null;
			}

			// if we don't have a target, see if we can find something interesting within our SIGHT radius
			if(curMon.target == null) {
				// check if a dock is near us
				for(let a = 0; a < this.docks.length; a++) {
					let dist = Math.abs(this.docks[a].x - curMon.x) + Math.abs(this.docks[a].y - curMon.y);

					if(dist < sightRadius && this.docks[a] != curMon.prevTarget) {
						curMon.target = this.docks[a];
						curMon.chasing = true;
						break;
					}
				}

				// check if an ai ship is near us
				for(let a = 0; a < this.aiShips.length; a++) {
					let dist = Math.abs(this.aiShips[a].x - curMon.x) + Math.abs(this.aiShips[a].y - curMon.y);

					if(dist < sightRadius && this.aiShips[a] != curMon.prevTarget) {
						curMon.target = this.aiShips[a];
						curMon.chasing = true;
						break;
					}
				}

				// check if a ship is near us
				for(let a = 0; a < this.playerShips.length; a++) {
					let dist = Math.abs(this.playerShips[a].x - curMon.x) + Math.abs(this.playerShips[a].y - curMon.y);

					if(dist < sightRadius && this.playerShips[a] != curMon.prevTarget) {
						curMon.target = this.playerShips[a];
						curMon.chasing = true;
						break;
					}
				}

				// if there's nothing, just pick a random tile

				// if it's still null
				/*
				if(curMon.target == null) {
					// pick a random position around us that is reachable (NOT island)
					let rX, rY;
					const maxTries = 10;
					let numTries = 0;
					do {
						let angle = Math.random() * 2 * Math.PI;
						rX = Math.floor(this.wrapCoords( curMon.x + Math.cos(angle)*moveSpeed, this.mapWidth));
						rY = Math.floor(this.wrapCoords( curMon.y + Math.sin(angle)*moveSpeed, this.mapHeight));

						numTries++;
					} while(this.map[rY][rX] >= -0.3 && numTries <= maxTries);

					if(numTries > maxTries) {
						targetPos = [];
					} else {
						targetPos = [rX, rY];
					}

					curMon.reputation += numTries;
				}*/
			}

			// if we have a target, move to that position
			// (otherwise, it defaults to targetPos => a random location near us)
			if(curMon.target != null) {
				curMon.chasingCounter++;
				targetPos = [curMon.target.x, curMon.target.y];

				// if there is no target ... 
				// or we're already at the target ...
				// don't do anything
				if(targetPos.length < 1) { 
					continue
				}

				if((targetPos[0] == curMon.x && targetPos[1] == curMon.y)) {
					continue;
				}

				// calculate a route to this position
				let tempRoute = this.calculateRoute([curMon.x, curMon.y], targetPos)

				// if destination was unreachable, too bad, try again next turn
				if(tempRoute.length < 1) {
					continue;
				}

				// shave first bit from the route (that's the monster's current position)
				// it's possible that the route is just the starting tile, nothing else, that's why the IF statement is
				tempRoute.splice(0, 1);								

				// follow the route for as long as our moveSpeed allows
				let routeIndex = Math.min(tempRoute.length - 1, chaseSpeed);
				targetPos = tempRoute[routeIndex]
			} else {
				let bestDeepSeaTile = null;
				let bestRemainingTile = null;


				const positions = [[-1,0],[1,0],[0,1],[0,-1]]
				for(let a = 0; a < 4; a++) {
					let tempX = Math.floor(this.wrapCoords( curMon.x + positions[a][0], this.mapWidth));
					let tempY = Math.floor(this.wrapCoords( curMon.y + positions[a][1], this.mapHeight));

					// if this is a deep sea tile, save it!
					// if we already have a deep sea tile saved, there's a 50% chance it will be replaced (to keep movement random)
					if(this.map[tempY][tempX] < -0.3) {
						if(bestDeepSeaTile == null || Math.random() >= 0.5) {
							bestDeepSeaTile = [tempX, tempY];
						}

					// if this is NOT an island tile, save this as a "best of the rest" tile
					} else if(this.map[tempY][tempX] < 0.2) {
						if(bestRemainingTile == null || Math.random() >= 0.5) {
							bestRemainingTile = [tempX, tempY];
						}
					}
				}

				// set target to a deep sea tile
				targetPos = bestDeepSeaTile;

				// if there IS no deep sea tile, choose the best remaining tile
				// alternatively, there's a slight (10%) chance of going out of the deep sea.
				if(targetPos == null || Math.random() >= 0.9) { targetPos = bestRemainingTile; }
				
				// if we still don't have anywhere to go, just don't do anything;
				if(targetPos == null || targetPos.length < 1) { 
					continue
				}
			}

			curMon.x = targetPos[0];
			curMon.y = targetPos[1];

			curSprite.x = (targetPos[0] + 0.5)*this.tileSize;
			curSprite.y = (targetPos[1] + 0.5)*this.tileSize;
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

class PriorityQueue {

	constructor() {
		this.elements = [];
	}

	isEmpty() {
		return (this.elements.length == 0);
	}

	put(item, priority) {
		// check if it already exists
		// THAT SHOULDN'T MATTER

		// loop through current list
		let insertIndex = 0;
		while(insertIndex < this.elements.length) {
			if(this.elements[insertIndex][0] >= priority) {
				break;
			}
			insertIndex++;
		}

		// add this element!
		this.elements.splice(insertIndex, 0, [priority, item]);
	}

	get() {
		// remove first element from elements, return it
		return this.elements.shift()[1];
	}
}
