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
    },

    exploreIsland: function(x, y, island) {
    	// add this tile to the island
    	island.push([x,y]);

    	// mark this tile as checked
    	this.checkedTiles[x+"-"+y] = true;

    	// check tiles left/right/top/bottom
    	// TO DO: We don't check diagonally now. Should we?
    	var positions = [[-1,0],[1,0],[0,1],[0,-1]]
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
    		if(this.map[tempY][tempX] >= 0.2 && !(tempKey in this.checkedTiles)) {
    			this.exploreIsland(tempX, tempY, island);
    		}
    	}

    	return island;
    },

	create: function() {
		// create new noise object
		//let gen = new SimplexNoise();
		noise.seed(Math.random());

		let pixelHeight = this.mapHeight*this.tileSize;
		let pixelWidth = this.mapWidth*this.tileSize;
		let halfPxWidth = 0.5*pixelWidth;
		let halfPxHeight = 0.5*pixelHeight;

		// generate map (according to noise object)
		for (let y = 0; y < this.mapHeight; y++) {
			this.map[y] = [];
			for (let x = 0; x < this.mapWidth; x++) { 
				let nx = x*this.tileSize;
				let ny = y*this.tileSize;

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
			}
		}

		/*** DETERMINE ISLANDS ***/
		// loop through the map
		for (let y = 0; y < this.mapHeight; y++) {
			for (let x = 0; x < this.mapWidth; x++) { 
				// everytime we find an island tile ...
				if(this.map[y][x] >= 0.2) {
					// that doesn't already belong to an island ...
					let key = x + "-"+y
					if(!(key in this.checkedTiles)) {
						// start the investigation!
						this.islands.push( this.exploreIsland(x, y, []) );
					}
				}
			}
		}

		console.log(this.islands);

		/*** DETERMINE DOCKS ***/
		// loop through the islands
		for(let a = 0; a < this.islands.length; a++) {
			// pick a random spot at the edge

			// QUESTION: HOW TO DETERMINE IF A TILE IS ON THE EDGE OF AN ISLAND?
			// Oh, wait, I know: it's NOT surrounded on all sides. If at least one side is open, one should be able to reach it.
			// To be certain, though, we might want to go for: tiles that are AT MOST surrounded at 2 sides.
		}


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
