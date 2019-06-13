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
    },

    calculateRouteAlternative: function(start, end) {
    	console.log("Trying to get from " + start + " to " + end);

    	let Q = new PriorityQueue();

    	Q.put(start, 0);

    	// Maps are fast for searching, need unique values, AND can use an object as the key
    	let came_from = new Map();
    	let cost_so_far = new Map();
    	let tiles_checked = new Map();

    	let startLabel = start[0] + "-" + start[1];

    	came_from.set(startLabel, null);
		cost_so_far.set(startLabel, 0);

		let cc = 0;

		while( !Q.isEmpty() ) {
			let current = Q.get();

			let currentLabel = current[0] + "-" + current[1]
			tiles_checked.set(currentLabel, true);
        
        	// stop when we've found the first "shortest route" to our destination
	        if(current[0] == end[0] && current[1] == end[1]) { break; }

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

    calculateRoute: function(start, end) {
		let Q = { }
		let prev = { }

		// PROFILER: This part takes about 1-2 ms
		// turn the 2D grid into nodes
		for(let y = 0; y < this.map.length; y++) {
    		for(let x = 0; x < this.map[y].length; x++) {
    			// only save the tile if it's actually sea (and not land)
    			// remember that the j and i are switched; j = x, i = y
    			if(this.map[y][x] < 0.2) {
    				let label = x + "," + y;

    				Q[label] = Infinity; // Q functions as the "dist" variable, the x and y can be gathered from the KEY
    			}
    		}
    	}

    	// PROFILER: This part takes about 50-200 ms
    	// distance from start to start is, obviously, 0
    	let startLabel = start[0] + "," + start[1]
    	Q[ startLabel ] = 0;
		
		// normally, you'd go through the vertex set, until it is empty
		// because we have a 2D grid, we can do it differently:
		// check every tile left/right/top/bottom that hasn't been checked yet
		let verticesLeft = Object.keys(Q).length;
		while(verticesLeft > 0) {
			// find the tile with closest distance to start tile
			// start on a random tile, otherwise we might not find anything
			let startKeys = Object.keys(Q);
			let shortestKey = startKeys[ startKeys.length * Math.random() << 0]
    		let shortestDist = Q[shortestKey]

			for(let key in Q) {
				if(Q[key] < shortestDist) {
					shortestDist = Q[key];
					shortestKey = key;		
				}
			}

			// derive position + distance (as object) from shortestKey
			let getPos = shortestKey.split(",");
			let u = { x: parseInt(getPos[0]), y: parseInt(getPos[1]), dist: shortestDist}

			// remove this tile from the Queue
			delete Q[shortestKey];
			verticesLeft--;

			// terminate if we've found the target
			if(u.x == end[0] && u.y == end[1]) {
				break;
			}

			// update all neighbours (to new distance, if run through u)
			let positions = [[-1,0],[1,0],[0,1],[0,-1]]
			for(let a = 0; a < 4; a++) {
				let tempX = u.x + positions[a][0];
	    		let tempY = u.y + positions[a][1];

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

	    		let newLabel = tempX + "," + tempY

	    		// if the vertex isn't in our "queue to check", we don't need to update it
	    		// 
	    		if(!(newLabel in Q)) {
	    			continue;
	    		} else {
	    			// This heuristic helps speed up the search 

	    			// Nodes that are further from our destination node are less likely to be the right ones
	    			// TO DO: Additionally, ties are broken 

	    			// map is seamless, so distance depends based on the side you're on
	    			let dX = Math.abs(tempX - end[0]);
	    			if(dX > 0.5*this.mapWidth) {
	    				dX = (this.mapWidth - dX)
	    			}

	    			let dY = Math.abs(tempY - end[1]);
	    			if(dY > 0.5*this.mapHeight) {
	    				dY = (this.mapHeight - dY)
	    			}

	    			let heuristicFunc = (dX + dY); 

	    			// base costs + shallow waters move slower
	    			// (we want to sail through deep sea (not near the shores))
	    			let costFunc = 1 + (2 + this.map[tempY][tempX]*2); 

	    			let alt = u.dist + 1;
				
					if(alt < Q[newLabel]) {
						Q[newLabel] = alt;
						prev[newLabel] = u;
					}
	    		}
			}

		}

		// PROFILER: This part takes 0 ms
		// Reverse the found path, so we can read it properly
		let S = [];
		let tempTile = { x: end[0], y: end[1] };
		let tempLabel = tempTile.x + "," + tempTile.y;

		if( (tempLabel in prev) || (tempTile.x == start[0] && tempTile.y == start[1])) {
			while( tempLabel in prev) {
				S.unshift( tempTile );

				tempTile = prev[tempLabel];
				tempLabel = tempTile.x + "," + tempTile.y;
			}
		}

		return S;
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
		let x1=0, y1=0, x2=150, y2=150
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

		        console.log(nx, ny, nz, nw)

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
						// get island size => determines dock size
						let islandSize = this.islands[this.islands.length - 1].length;
						let randDock = this.possibleDocks[ Math.floor(Math.random() * this.possibleDocks.length)]

						this.docks.push( { pos: randDock, size: islandSize, deal: [[0, 4], [2, 6]] } );

						// place an AI ship next to this harbor => get a free spot next to this port
			    		// this "harborSpot" is used by the AI ships: they start on such a spot.
			    		// I DON'T need to use these in routes: I can just chop off the final movement of the route, to ensure AI ships stop _before_ a dock (instead of _on_ it)
			    		let harborSpot = [];
			    		let positions = [[-1,0],[1,0],[0,1],[0,-1]]
			    		for(let a = 0; a < 4; a++) {
				    		let tempX = randDock[0] + positions[a][0];
				    		let tempY = randDock[1] + positions[a][1];

				    		// the map is seemless => top stitches to the bottom, left stitches to the right
				    		if(tempX < 0) { tempX += this.mapWidth; } else if(tempX >= this.mapWidth) { tempX -= this.mapWidth;}
				    		if(tempY < 0) { tempY += this.mapHeight; } else if(tempY >= this.mapHeight) {tempY -= this.mapHeight;}

				    		if(this.map[tempY][tempX] < 0.2) {
				    			harborSpot = [tempX, tempY]
				    			break;
				    		}
				    	}

				    	// ai starts next to the dock, saves the index of the dock it started (to get route), 
				    	// TO DO: Save resources, attack/defense value, movement speed.
				    	this.aiShips.push( { x: harborSpot[0], y: harborSpot[1], startDock: (this.docks.length - 1) });
					}
				}
			}
		}

		/*** Place MONSTERS and PLAYER SHIPS ***/
		// determine amount of blocks needed
		let numMonsters = 0;
		let numPlayers = 0;
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
				this.monsters.push( { x: rX, y: rY, id: 'mon'+i, class: 0, hp: 3, atk: 5 } );
			} else {
				this.playerShips.push( { x: rX, y: rY });
			}

		}

		console.timeEnd("Placing monsters and ships");

		console.log(this.islands);
		console.log(this.docks);

		/*** CALCULATE ROUTES BETWEEN HARBORS ****/
		/*
		let numDocks = this.docks.length;
		for(let i = 0; i < numDocks; i++) {
			// pick a few other routes, based on SQUARE ROOT of ISLAND SIZE
			// TO DO: For now, keep routes small
			let numRoutes = Math.max( Math.ceil( Math.sqrt(this.docks[i].size)) - 2, 0);

			// initialize routes property
			this.docks[i].routes = [];

			// find routes with other docks 
			// you can't find more routes than there are docks :p
			let maxRoutes = Math.min(numRoutes, this.docks.length - 1);
			for(let j = 0; j < maxRoutes; j++) {
				if(j == i) { continue; } // don't make a route towards ourselves

				console.time('Calculating route ' + j + ' on dock ' + i + '!');

				this.docks[i].routes.push( this.calculateRouteAlternative(this.docks[i].pos, this.docks[j].pos) );

				console.timeEnd('Calculating route ' + j + ' on dock ' + i + '!');
			}
		}
		*/

		/*** CREATE MAP VISUALS ***/

		// Graphics docs: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html
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

			/*
			// display its routes
			for(let a = 0; a < this.docks[i].routes.length; a++) {
				let r = this.docks[i].routes[a];

				// loop through the route
				for(let rr = 0; rr < r.length; rr++) {
					let routeX = r[rr][0];
					let routeY = r[rr][1];

					// draw a small square (half size) for each route point
					graphics.fillRect((routeX + 0.25)*this.tileSize, (routeY + 0.25)*this.tileSize, 0.5*this.tileSize, 0.5*this.tileSize);
				}
			}
			*/
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

		// display the monsters
		for(let i = 0; i < numMonsters; i++) {
			let curMon = this.monsters[i];

			graphics.lineStyle(2, 0x000000, 1.0);
			graphics.fillStyle(0xFF0000, 1.0);

			graphics.fillRect(curMon.x*this.tileSize, curMon.y*this.tileSize, this.tileSize, this.tileSize);
			graphics.strokeRect(curMon.x*this.tileSize, curMon.y*this.tileSize, this.tileSize, this.tileSize);
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
		for(let i = 0; i < this.aiShips.length; i++) {
			let curShip = this.aiShips[i];

			graphics.lineStyle(2, 0x00FF00, 1.0);
			graphics.fillStyle(0x000000, 1.0);

			graphics.fillRect(curShip.x*this.tileSize, curShip.y*this.tileSize, this.tileSize, this.tileSize);
			graphics.strokeRect(curShip.x*this.tileSize, curShip.y*this.tileSize, this.tileSize, this.tileSize);
		}

		window.graphics = graphics;
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
