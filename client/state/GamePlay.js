import { serverInfo } from './sockets/serverInfo'
import dynamicLoadImage from './drawing/dynamicLoadImage'
import { playerColors } from './utils/colors'
import loadPlayerVisuals from './drawing/loadPlayerVisuals'
import loadMainSockets from './sockets/mainSocketsGame'
import loadWatchRoom from './sockets/watchRoomModule'
import { mainStyle } from './utils/styles'

import { gameTimer } from './utils/timers'
import loadGUIOverlay from './utils/loadGUIOverlay'

import noise from '../../vendor/perlinImproved'

import { SHIP_COLORS } from './utils/shipColors'


class GamePlay extends Phaser.State {
  constructor () {
    super()
  }

  preload () {
    this.game.stage.backgroundColor = "#FFFFFF";

    /*

      Load all images into the cache

      The "preload" function waits until everything is loaded, before calling the create function
      Which should give us time to load all images

    */

    // monsters
    let mDrawings = serverInfo.monsterDrawings;
    for(let i = 0; i < mDrawings.length; i++) {
      this.game.load.image('monsterNum'+i, mDrawings[i])
    }

    if(mDrawings.length < 1) {
      this.game.load.image('monsterNum0', serverInfo.backupMonsterDrawing);
      this.game.load.image('monsterNum1', serverInfo.backupMonsterDrawing);
      this.game.load.image('monsterNum2', serverInfo.backupMonsterDrawing);
    }

    // player ships
    let sDrawings = serverInfo.shipDrawings;
    for(let i = 0; i < sDrawings.length; i++) {
      this.game.load.image('shipNum'+i, sDrawings[i])
    }

    if(sDrawings.length < 1) {
      this.game.load.image('shipNum0', serverInfo.backupShipDrawing);
      this.game.load.image('shipNum1', serverInfo.backupShipDrawing);
      this.game.load.image('shipNum2', serverInfo.backupShipDrawing);
    }

    // ai ships
    let aiDrawings = serverInfo.aiShipDrawings;
    for(let i = 0; i < aiDrawings.length; i++) {
      this.game.load.image('aiShipNum'+i, aiDrawings[i])
    }

    if(aiDrawings.length < 1) {
      this.game.load.image('aiShipNum0', serverInfo.backupShipDrawing);
      this.game.load.image('aiShipNum1', serverInfo.backupShipDrawing);
      this.game.load.image('aiShipNum2', serverInfo.backupShipDrawing);
      this.game.load.image('aiShipNum3', serverInfo.backupShipDrawing);
    }

    // docks
    this.game.load.image('dock', serverInfo.dockDrawing);
    
  }

  create () {
    let gm = this.game
    let socket = serverInfo.socket

    /***

      Recreate the map (based on the seed)
      This creates the 4D noise value on each location, and immediately displays the correct (colored) square

      TO DO: Determine islands by myself? Or receive them from the server? (Might just as well send them, if we're sending this much information)
             => Because, I need to know which tiles to "reveal" on the map, and where to put the text with the ISLAND NAME

    ***/

    // seed the noise object (with the mapSeed)
    noise.seed(serverInfo.mapSeed);

    // initialize some variables determining map size (and zoom level)
    let x1 = 0, y1 = 0, x2 = 10, y2 = 10
    let mapWidth = 60, mapHeight = 30;

    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    this.map = []; //initialize map variable

    //var graphics = this.add.graphics(0, 0);
    let tileSize = Math.min(window.innerWidth / mapWidth, window.innerHeight / mapHeight);
    this.tileSize = tileSize;

    var baseMapGroup = gm.add.group();

    // loop through all tiles, determine noise level, and save it
    for (let y = 0; y < mapHeight; y++) {
      this.map[y] = [];
      for (let x = 0; x < mapWidth; x++) { 
        // 4D noise => wraps back to 2D map with seamless edges
        let s = x / mapWidth
        let t = y / mapHeight
        let dx = (x2 - x1)
        let dy = (y2 - y1)
        let pi = Math.PI

        // Walk over two independent circles (perpendicular to each other)
        let nx = x1 + Math.cos(s*2*pi) * dx / (2*pi)
        let nz = y1 + Math.sin(s*2*pi) * dy / (2*pi)

        let ny = x1 + Math.cos(t*2*pi) * dx / (2*pi)
        let nw = y1 + Math.sin(t*2*pi) * dy / (2*pi)

        // save the noise value
        let curVal = noise.perlin4(nx, ny, nz, nw);
        this.map[y][x] = { val: curVal, checked: false, fog: true };

        // display the map
        let tileColor;
        // DEEP OCEAN
        if(curVal < -0.3) {
            tileColor = '#1036CC';
        // SHALLOW OCEAN
        } else if(curVal < 0.2) {
            tileColor = '#4169FF';
        // BEACH
        } else if(curVal < 0.25) {
            tileColor = '#EED6AF';
        // ISLAND
        } else {
            tileColor = '#228B22';
        }

        // create square, color it, add it as a sprite, add it to group
        let tempTile = gm.add.bitmapData(this.tileSize, this.tileSize);
        tempTile.rect(0, 0, tileSize, tileSize, tileColor);

        let tempSprite = gm.add.sprite(x*this.tileSize, y*this.tileSize, tempTile);
        baseMapGroup.add(tempSprite);

        /*
        graphics.drawRect(x*tileSize, y*tileSize, tileSize, tileSize);

        graphics.lineStyle(1, 0xF9E4B7, 1); // last parameter is transparency: might be too expensive for the computer to set this to something else than 0
        graphics.drawRect(x*tileSize, y*tileSize, tileSize, tileSize);
        */
      }
    }

    // draw grid lines VERTICALLY
    for (let x = 0; x < mapWidth; x++) {
      let tempTile = gm.add.bitmapData(1, this.mapHeight*this.tileSize);
      tempTile.line(0, 0, 0, this.mapHeight*this.tileSize, '#CCCCCC', 1);

      let tempSprite = gm.add.sprite(x*this.tileSize, 0, tempTile);
      baseMapGroup.add(tempSprite);
    }
      
    // draw grid lines HORIZONTALLY
    for (let y = 0; y < mapHeight; y++) {
      let tempTile = gm.add.bitmapData(this.mapWidth*this.tileSize, 1);
      tempTile.line(0, 0, this.mapWidth*this.tileSize, 0, '#CCCCCC', 1);

      let tempSprite = gm.add.sprite(0, y*this.tileSize, tempTile);
      baseMapGroup.add(tempSprite);
    }

    // put the complete base map into the cache
    baseMapGroup.cacheAsBitmap = true;

    /*

      Discover islands (cheaper to do it locally than to get it from the server)

    */
    this.discoverIslands();

    /*

      Create texture that holds all the shadows

    */
    this.unitShadows = gm.add.bitmapData(gm.width, gm.height);
    this.shadowSprite = gm.add.image(0,0, this.unitShadows);
    //this.shadowSprite.blendMode = Phaser.blendModes.MULTIPLY;
    this.shadowSprite.alpha = 0.66;



    /*

      Display all units

      Some of the units need to be saved as SPRITES, so they can be moved around later.
      (These are the same units that need to load an image from a baseURI)
      This means that dynamicLoadImage doesn't work. 

      Instead, load all baseURIs into cache at the start, then just create sprites from them.

    */
    // Display docks
    let dotBmd = gm.add.bitmapData(tileSize, tileSize);
    dotBmd.circle(0.5*tileSize, 0.5*tileSize, 0.5*tileSize, '#000000');

    let docks = serverInfo.docks;
    this.dockSprites = [];
    for(let i = 0; i < docks.length; i++) {
      let x = docks[i].x, y = docks[i].y;

      let cacheLabel = 'dock';

      // create the sprite
      let newSprite = gm.add.sprite(x*tileSize, (y-0.5)*tileSize, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      
      newSprite.visible = false;
      newSprite.originalX = x;
      newSprite.originalY = y;

      this.dockSprites.push(newSprite);

      // also create THE DOT!
      let newDot = gm.add.sprite(x*tileSize, y*tileSize, dotBmd);
      newDot.width = newDot.height = tileSize;

      newSprite.myFogDot = newDot;
    }

    // Display monsters
    console.log(serverInfo.monsters);
    let monsters = serverInfo.monsters;
    this.monsterSprites = [];
    for(let i = 0; i < monsters.length; i++) {
      let x = monsters[i].x, y = monsters[i].y;

      let cacheLabel = 'monsterNum' + monsters[i].myMonsterType;

      let newSprite = gm.add.sprite(0,0, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      newSprite.visible = false;
      this.monsterSprites.push(newSprite);

      // also create THE DOT!
      let newDot = gm.add.sprite(x*tileSize, y*tileSize, dotBmd);
      newDot.width = newDot.height = tileSize;

      newSprite.myFogDot = newDot;
    }

    // Display AI Ships
    console.log(serverInfo.aiShips);

    let aiShips = serverInfo.aiShips;
    this.aiShipSprites = [];
    for(let i = 0; i < aiShips.length; i++) {
      let x = aiShips[i].x, y = aiShips[i].y;

      let cacheLabel = 'aiShipNum' + aiShips[i].myShipType;

      let newSprite = gm.add.sprite(0,0, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      newSprite.visible = false;
      this.aiShipSprites.push(newSprite);



      // also create THE DOT!
      let newDot = gm.add.sprite(x*tileSize, y*tileSize, dotBmd);
      newDot.width = newDot.height = tileSize;

      newSprite.myFogDot = newDot;
    }

    // Display player Ships
    console.log(serverInfo.playerShips);

    let playerShips = serverInfo.playerShips;
    this.playerShipSprites = [];
    for(let i = 0; i < playerShips.length; i++) {
      let x = playerShips[i].x, y = playerShips[i].y;
      let cacheLabel = 'shipNum' + playerShips[i].num;

      let newSprite = gm.add.sprite(0,0, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      newSprite.visible = false;
      this.playerShipSprites.push(newSprite);

      // also create THE DOT!
      let newDot = gm.add.sprite(x*tileSize, y*tileSize, dotBmd);
      newDot.width = newDot.height = tileSize;

      newSprite.myFogDot = newDot;
    }

    // Display fog
    this.fogBmd = gm.add.bitmapData(gm.width, gm.height);
    this.fogBmd.rect(0,0,gm.width,gm.height, '#CCCCCC');

    let fogSprite = gm.add.sprite(0,0, this.fogBmd);

    // move units to correct location, draw extras (shadows, etc.), or a dot if not visible
    this.moveUnits();

    // Display the messages from the radio
    // TO DO

    // Display NIGHT OVERLAY (for nighttime)
    this.shadowTexture = gm.add.bitmapData(gm.width, gm.height);
    this.lightSprite = gm.add.image(0,0, this.shadowTexture);
    this.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    this.lightSprite.visible = false;    

    // load timer; the first turn is always twice as long!
    this.timerText = gm.add.text(gm.width*0.5, 60, "", mainStyle.timerText())
    this.timer = serverInfo.timer*2

    // load GUI overlay (displays room code and such)
    loadGUIOverlay(gm, serverInfo, mainStyle.mainText(), mainStyle.subText())

    loadMainSockets(socket, gm, serverInfo)
    loadWatchRoom(socket, serverInfo)

    let ths = this;

    // Function that is activated when a new island is discovered
    socket.on('island-discovered', data => {
      // get island with this index
      let curIsland = this.islands[data.index];

      // reveal all tiles associated with this island
      let averageX = 0, averageY = 0;
      for(let i = 0; i < curIsland.myTiles.length; i++) {
        let x = curIsland.myTiles[i][0], y = curIsland.myTiles[i][1]

        averageX += x;
        averageY += y;

        this.map[y][x].fog = false;
        ths.fogBmd.clear(x*ths.tileSize, y*ths.tileSize, ths.tileSize, ths.tileSize);
      }

      averageX /= curIsland.myTiles.length;
      averageY /= curIsland.myTiles.length;

      // display the island name on top of the island (add up and AVERAGE all x and y coordinates to get the center position)
      // TO DO: Averaging doesn't work with world wrapping. Find a solution for this
      gm.add.text(averageX*ths.tileSize, averageY*ths.tileSize, data.name, mainStyle.timerText())
    })

    // Function that is activated when a dock is discovered
    socket.on('dock-discovered', data => {
      // TO DO
      // Get dock
      // Reveal tile (remove fog; also a bit around it?)
      // Always display dock trade from now on
    })

    // Function that is called whenever a new turn starts
    // Resets timer, resets other stuff, displays new situation, etc.
    socket.on('new-turn', data => {
      console.log("New turn => resetting timer to " + serverInfo.timer);

      // reset the timer 
      ths.timer = serverInfo.timer;

      // update fog
      // go through all discoveredTiles, remove the fog on them
      for(let i = 0; i < serverInfo.discoveredTiles.length; i++) {
        // get tile (by coordinates [x,y])
        let x = serverInfo.discoveredTiles[i].x, y = serverInfo.discoveredTiles[i].y

        // remove the fog, both behind the scenes, and visually
        this.map[y][x].fog = false;
        ths.fogBmd.clear(x*ths.tileSize, y*ths.tileSize, ths.tileSize, ths.tileSize);
      }

      // move all units to their new positions
      ths.moveUnits();

      // switch to day/night if necessary
      serverInfo.turnCount++;
      if(serverInfo.turnCount % 10 == 0) {
        serverInfo.dayTime = !serverInfo.dayTime;

        // if night, the overlay is turned on
        // if day, the overlay is turned off
        if(!serverInfo.dayTime) {
          this.lightSprite.visible = true;
          this.updateShadowTexture();
        } else {
          this.lightSprite.visible = false;
        }
      }

      if(!serverInfo.dayTime) {
        // update NIGHT OVERLAY; Only if it's actually nighttime!
        this.updateShadowTexture();
      }
    })

    console.log("Game Play state")
  }

  update () {
    // Update timer
    gameTimer(this, serverInfo)
  }

  moveUnits() {
    this.unitsOnMap = [];

    this.tempMap = [];
    for(var y = 0; y < this.mapHeight; y++) {
      this.tempMap[y] = [];
      for(var x = 0; x < this.mapWidth; x++) {
        this.tempMap[y][x] = [0, 0]; // index 0 = number of units on tile, index 1 = current counter (when displaying)
      }
    }

    // create ONE array that holds all sprites
    // Simultaneously, check how many units are on a certain tile
    for(let i = 0; i < this.dockSprites.length; i++) {
      this.unitsOnMap.push(this.dockSprites[i]);
    }

    for(let i = 0; i < this.monsterSprites.length; i++) {
      this.monsterSprites[i].originalX = serverInfo.monsters[i].x;
      this.monsterSprites[i].originalY = serverInfo.monsters[i].y;

      this.unitsOnMap.push(this.monsterSprites[i]);
      this.tempMap[ serverInfo.monsters[i].y ][ serverInfo.monsters[i].x ][0]++;
    }

    for(let i = 0; i < this.aiShipSprites.length; i++) {
      this.aiShipSprites[i].originalX = serverInfo.aiShips[i].x;
      this.aiShipSprites[i].originalY = serverInfo.aiShips[i].y;

      this.unitsOnMap.push(this.aiShipSprites[i]);
      this.tempMap[ serverInfo.aiShips[i].y ][ serverInfo.aiShips[i].x ][0]++;
    }

    for(let i = 0; i < this.playerShipSprites.length; i++) {
      this.playerShipSprites[i].originalX = serverInfo.playerShips[i].x;
      this.playerShipSprites[i].originalY = serverInfo.playerShips[i].y;

      this.unitsOnMap.push(this.playerShipSprites[i]);
      this.tempMap[ serverInfo.playerShips[i].y ][ serverInfo.playerShips[i].x ][0]++;
    }


    // reset the shadow canvas, set the fill style to transparent black
    this.unitShadows.clear()
    this.unitShadows.context.fillStyle = '#000000';

    let disp = [0, -0.5]; // displacement of the unit; usually slightly above the tile, so it sticks out

    // for all sprites (monsters, AI ships, player ships), move the sprite, then draw the shadow underneath it
    for(let i = 0; i < this.unitsOnMap.length; i++) {
      // this code simply gets the current unit and checks if the tile is still in fog
      let curUnit = this.unitsOnMap[i];
      let isInFog = this.map[ curUnit.originalY ][ curUnit.originalX ].fog;

      // the code below is for repositioning and rescaling sprites, in case there are multiple on a single tile
      let getTile = this.tempMap[ curUnit.originalY ][ curUnit.originalX ]
      let unitsOnTile = getTile[0];
      let curCounter = getTile[1];

      let tempPos = [ curUnit.originalX * this.tileSize, curUnit.originalY * this.tileSize]
      
      // scale down sprites, but not linearly (/unitsOnTile) => allow overlap, bigger sprites
      let newWidth = ( this.tileSize / Math.sqrt(unitsOnTile) );

      // display as a column, with random horizontal placement
      tempPos[1] += ( (curCounter + 0.5) / unitsOnTile) * this.tileSize - newWidth;
      tempPos[0] += (this.tileSize - newWidth) + (Math.random()*0.2 - 0.4)*this.tileSize;

      // increase counter
      this.tempMap[ this.unitsOnMap[i].originalY ][ this.unitsOnMap[i].originalX ][1]++;

      if(isInFog) {
        // only display the dot
        curUnit.visible = false;
        curUnit.myFogDot.visible = true;
        this.game.world.bringToTop(curUnit.myFogDot);

        // set it to the right position and scale
        curUnit.myFogDot.width = curUnit.myFogDot.height = newWidth;
        curUnit.myFogDot.x = tempPos[0];
        curUnit.myFogDot.y = tempPos[1];
      } else {
        curUnit.myFogDot.visible = false;

        // display the sprite + the shadow
        curUnit.visible = true;
        curUnit.width = curUnit.height = newWidth;

        // place the unit
        this.unitsOnMap[i].x = tempPos[0];
        this.unitsOnMap[i].y = tempPos[1];

        // change color for player ships
        // this.unitShadows.context.fillStyle = SHIP_COLORS[i];

        // draw the shadow
        this.unitShadows.context.beginPath();
        this.unitShadows.context.ellipse(tempPos[0] + newWidth*0.5, tempPos[1] + newWidth, newWidth*0.5, newWidth*0.3, 0, 0, 2 * Math.PI);
        this.unitShadows.context.fill();
      }

    }

    this.unitShadows.dirty = true;
  }

  updateShadowTexture() {
    this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
    this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

    // For all docks, display a light
    let docks = this.dockSprites;
    for(let i = 0; i < docks.length; i++) {
      let x = docks[i].x + 0.5*this.tileSize, y = docks[i].y, radius = this.tileSize*2 + Math.random()*0.2*this.tileSize;

      var gradient =
          this.shadowTexture.context.createRadialGradient(
              x, y, 0,
              x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 150, 150, 1.0)');
      gradient.addColorStop(1, 'rgba(255, 150, 150, 0.0)');

      this.shadowTexture.context.beginPath();
      this.shadowTexture.context.fillStyle = gradient;
      this.shadowTexture.context.arc(x, y, radius, 0, Math.PI*2, false);
      this.shadowTexture.context.fill();      
    }

    this.shadowTexture.dirty = true;
  }

  discoverIslands() {
    this.islands = []; // initialize islands variable

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) { 
        let curTile = this.map[y][x];

        // if this tile is an island, but hasn't been checked yet, let's start a new island!
        if(curTile.val >= 0.2 && !curTile.checked) {

          // create new island (with unknown name, and no free spots/dock known)
          let islandIndex = this.islands.length;
          this.islands.push( { myTiles: [] } );

          // explore this tile (which automatically leads to the whole island)
          this.exploreTile(curTile, x, y, islandIndex)
        }
      }
    }
  }

  exploreTile(tile, x, y, islandIndex) {
    // also save the tile in the island object, for quick reference
    this.islands[islandIndex].myTiles.push([x,y]);

    // mark this tile as checked
    tile.checked = true;

    // check tiles left/right/top/bottom
    const positions = [[-1,0],[1,0],[0,1],[0,-1]]

    for(let a = 0; a < 4; a++) {
      let tempX = this.wrapCoords(x + positions[a][0], this.mapWidth);
      let tempY = this.wrapCoords(y + positions[a][1], this.mapHeight);

      const newTile = this.map[tempY][tempX];
      // if tile is an island, and hasn't been checked, explore it!
      if(newTile.val >= 0.2 && !newTile.checked) {
        this.exploreTile(newTile, tempX, tempY, islandIndex)
      }
    }
  }

  wrapCoords(c, bound) {
    if(c < 0) { 
        c += bound; 
      } else if(c >= bound) {
      c -= bound;
    }
    return c;
  }

}

export default GamePlay
