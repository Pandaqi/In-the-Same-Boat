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

				this.map[y][x] = noise.perlin2(nx / 150, ny / 150);
			}
		}

		/*** CREATE MAP VISUALS ***/

		// Graphics docs: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html
		// display map
		var graphics = this.add.graphics(0, 0);

		/* DISPLAY TILES */
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
			}
		}

		graphics.lineStyle(3, 0xFF0000, 1.0);

		// display the WIND MAP
		for (let y = 0; y < this.mapHeight; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				let curVal = this.map[y][x];

				let nextX = (x+1) % this.mapWidth;
				let nextY = (y+1) % this.mapHeight;

				// calculate gradient for x and y axis
				let gradX = (this.map[y][nextX] - this.map[y][x]);
				let gradY = (this.map[nextY][x] - this.map[y][x]);

				// turn the gradient 90 degrees (for 2D, this is simple)
				// switch X and Y, negate one of them
				let grad = [gradY, -gradX];

				let norm = Math.sqrt(grad[0] * grad[0] + grad[1] * grad[1]);
				grad = [grad[0] / norm * 0.5, grad[1] / norm * 0.5];

				// draw line
				let line = new Phaser.Geom.Line((x+0.5)*this.tileSize, (y+0.5)*this.tileSize, (x + 0.5 + grad[0])*this.tileSize, (y + 0.5 + grad[1])*this.tileSize);
				let invertLine = new Phaser.Geom.Line((x+0.5)*this.tileSize, (y+0.5)*this.tileSize, (x + 0.5 - grad[0])*this.tileSize, (y + 0.5 - grad[1])*this.tileSize);

				graphics.lineStyle(3, 0x00FF00, 1.0);
				graphics.strokeLineShape(invertLine);

				/*
				// wind speed
				let windSpeed = Math.round(norm*10); // when determined by the curling field
				if(windSpeed == 0) {
					graphics.lineStyle(3, 0x550000, 0.3);
				} else if (windSpeed == 1) {
					graphics.lineStyle(3, 0x880000, 0.5);
				} else if(windSpeed == 2) {
					graphics.lineStyle(3, 0xAA0000, 0.7);
				} else {
					graphics.lineStyle(3, 0xFF0000, 1.0);
				}
				*/

				// wind speed (alternative)
				let windSpeed = curVal;
				graphics.lineStyle((1 - windSpeed)*2, 0xFF0000, 1.0); //when determined by Perlin value
				
				graphics.strokeLineShape(line);
				

				//this.add.text((x+0.5)*this.tileSize, (y+0.5)*this.tileSize, Math.round(norm * 10), { fontSize: 16 }).setOrigin(0.5);
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
