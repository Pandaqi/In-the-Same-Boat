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
    /*
      
      Load debug settings

      These can switch some parts of the game on/off (such as fog), to help debug

    */

    this.debugSettings = {
      removeFog: false,
      showTreasure: false,
    }



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
    this.game.load.image('dock_front', '/assets/lighthouse_front.png');
    this.game.load.image('dock_back', '/assets/lighthouse_back.png');
    this.game.load.image('dock_side', '/assets/lighthouse_side.png');

    // cities
    this.game.load.image('city_front', '/assets/coastcity_front.png');
    this.game.load.image('city_back', '/assets/coastcity_back.png');
    this.game.load.image('city_side', '/assets/coastcity_side.png');
    
    
    
  }

  create () {
    let gm = this.game
    let socket = serverInfo.socket

    /***

      Recreate the map (based on the seed)
      This creates the 4D noise value on each location, and immediately displays the correct (colored) square

    ***/

    // seed the noise object (with the mapSeed)
    noise.seed(serverInfo.mapSeed);

    // initialize some variables determining map size (and zoom level)
    let dx = serverInfo.config.dx, dy = serverInfo.config.dy;
    let mapWidth = serverInfo.config.mapWidth, mapHeight = serverInfo.config.mapHeight;

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
        let pi = Math.PI

        // Walk over two independent circles (perpendicular to each other)
        let nx = Math.cos(s*2*pi) * dx / (2*pi)
        let nz = Math.sin(s*2*pi) * dy / (2*pi)

        let ny = Math.cos(t*2*pi) * dx / (2*pi)
        let nw = Math.sin(t*2*pi) * dy / (2*pi)

        // save the noise value
        let curVal = noise.perlin4(nx, ny, nz, nw);
        this.map[y][x] = { val: curVal, checked: false, fog: true };
        
        if(this.debugSettings.removeFog) {
          this.map[y][x].fog = false;          
        }

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

        if(this.debugSettings.showTreasure) {
          // check if there's a treasure here
          for(var key in serverInfo.treasures) {
            let curTres = serverInfo.treasures[key];

            if(curTres.x == x && curTres.y == y) {
              tileColor = '#FF0000';

              this.game.add.text(x*tileSize, y*tileSize, key);
            }
          }
        }

        // create square, color it, add it as a sprite, add it to group
        let tempTile = gm.add.bitmapData(tileSize, tileSize);
        tempTile.rect(0, 0, tileSize, tileSize, tileColor);

        let tempSprite = gm.add.sprite(x*tileSize, y*tileSize, tempTile);
        baseMapGroup.add(tempSprite);

        // if this is ocean, but the tile above us is land, display 3D-effect pop-out
        if(curVal < 0.2 && y >= 1 && this.map[y - 1][x].val >= 0.2) {
          // display a dark-brown rectangle, same width as tile, but small height ( = pop-out height)
          let tempPopout = gm.add.bitmapData(tileSize, tileSize*0.2);
          tempPopout.rect(0,0,tileSize, tileSize*0.2, '#321C02')

          baseMapGroup.add( gm.add.sprite(x*tileSize, y*tileSize, tempPopout) );

          // Shadow underneath (over the water)
          let tempShadow = gm.add.bitmapData(tileSize, tileSize*0.15);
          tempShadow.rect(0,0,tileSize, tileSize*0.15, '#000000')

          let tempShadowSprite = gm.add.sprite(x*tileSize, (y + 0.2)*tileSize, tempShadow);
          tempShadowSprite.alpha = 0.3;

          baseMapGroup.add( tempShadowSprite );
        }

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
    //this.unitNums = [];

    this.unitGroup = gm.add.group();

    // Display fog
    this.fogBmd = gm.add.bitmapData(gm.width, gm.height);
    this.fogBmd.rect(0,0,gm.width,gm.height, '#CCCCCC');
    let fogSprite = gm.add.sprite(0,0, this.fogBmd);

    if(this.debugSettings.removeFog) {
      fogSprite.visible = false;      
    }

    this.dotGroup = gm.add.group();

    // Display docks
    let dotBmd = gm.add.bitmapData(tileSize, tileSize);
    dotBmd.circle(0.5*tileSize, 0.5*tileSize, 0.5*tileSize, '#000000');

    let docks = serverInfo.docks;
    this.dockSprites = [];
    for(let i = 0; i < docks.length; i++) {
      let x = docks[i].x, y = docks[i].y;

      let cacheLabel = 'dock_front';
      let dir = 'front';
      // check if this dock is viewed from the front/back/left side/right side
      if(this.map[ this.wrapCoords(y - 1, this.mapHeight)][x].val >= 0.2) {
        cacheLabel = 'dock_front';
        dir = 'front';
      } else if(this.map[ this.wrapCoords(y + 1, this.mapHeight)][x].val >= 0.2) {
        cacheLabel = 'dock_back';
        dir = 'back';
      } else if(this.map[y][ this.wrapCoords(x - 1, this.mapWidth) ].val >= 0.2) {
        cacheLabel = 'dock_side'
        dir = 'right';
      } else {
        cacheLabel = 'dock_side';
        dir = 'left'
      }

      // create the sprite
      let newSprite = this.unitGroup.create(x*tileSize, (y-0.5)*tileSize, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      
      newSprite.visible = false;
      newSprite.originalX = x;
      newSprite.originalY = y;

      newSprite.myType = 3;
      newSprite.dir = dir;


      this.dockSprites.push(newSprite);

      // also create THE DOT!
      let newDot = this.dotGroup.create(x*tileSize, y*tileSize, dotBmd);
      newDot.width = newDot.height = tileSize;

      newSprite.myFogDot = newDot;
    }

    // Display cities
    let cities = serverInfo.cities;
    this.citySprites = [];
    for(let i = 0; i < cities.length; i++) {
      let x = cities[i].x, y = cities[i].y;

      let cacheLabel = 'city_front';
      let dir = 'front';
      // check if this city is viewed from the front/back/left side/right side
      if(this.map[ this.wrapCoords(y - 1, this.mapHeight)][x].val >= 0.2) {
        cacheLabel = 'city_front';
        dir = 'front';
      } else if(this.map[ this.wrapCoords(y + 1, this.mapHeight)][x].val >= 0.2) {
        cacheLabel = 'city_back';
        dir = 'back';
      } else if(this.map[y][ this.wrapCoords(x - 1, this.mapWidth) ].val >= 0.2) {
        cacheLabel = 'city_side'
        dir = 'right';
      } else {
        cacheLabel = 'city_side';
        dir = 'left'
      }

      // create the sprite
      let newSprite = this.unitGroup.create(x*tileSize, (y-0.5)*tileSize, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      
      newSprite.visible = false;
      newSprite.originalX = x;
      newSprite.originalY = y;

      newSprite.myType = 4;
      newSprite.dir = dir;

      this.citySprites.push(newSprite);

      // also create THE DOT!
      let newDot = this.dotGroup.create(x*tileSize, y*tileSize, dotBmd);
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

      let newSprite = this.unitGroup.create(0,0, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      newSprite.visible = false;
      newSprite.index = i;

      this.monsterSprites.push(newSprite);

      // also create THE DOT!
      let newDot = this.dotGroup.create(x*tileSize, y*tileSize, dotBmd);
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

      let newSprite = this.unitGroup.create(0,0, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      newSprite.visible = false;
      newSprite.index = i;

      this.aiShipSprites.push(newSprite);

      // also create THE DOT!
      let newDot = this.dotGroup.create(x*tileSize, y*tileSize, dotBmd);
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

      let newSprite = this.unitGroup.create(0,0, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      newSprite.visible = false;
      newSprite.index = i;

      this.playerShipSprites.push(newSprite);

      // also create THE DOT!
      let newDot = this.dotGroup.create(x*tileSize, y*tileSize, dotBmd);
      newDot.width = newDot.height = tileSize;

      newSprite.myFogDot = newDot;
    }

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

      // this variable determines if the island wraps around the edges
      // and if so, on which side the island name should be displayed then
      let tilesQuadrant = [0,0,0,0] // "more to the left", "more to the right", "more to the top", "more to the bottom"

      // reveal all tiles associated with this island
      // also count on which side most of the tiles are
      let averageX = 0, averageY = 0;
      let wrapsX = false, wrapsY = true;
      let curTiles = curIsland.myTiles;
      for(let i = 0; i < curTiles.length; i++) {
        let x = curTiles[i][0], y = curTiles[i][1]

        if(x == 0 || x == (this.mapWidth - 1)) {
          wrapsX = true;
        }

        if(y == 0 || y == (this.mapHeight - 1)) {
          wrapsY = true;
        }

        if(x < 0.5*this.mapWidth) { tilesQuadrant[0]++; }
        else { tilesQuadrant[1]++; }

        if(y < 0.5*this.mapHeight) { tilesQuadrant[2]++; }
        else { tilesQuadrant[3]++; }

        this.map[y][x].fog = false;
        ths.fogBmd.clear(x*ths.tileSize, y*ths.tileSize, ths.tileSize, ths.tileSize);
      }

      let wrapSideX = 'none', wrapSideY = 'none';

      // determine which is the dominant side (both X and Y)
      if(wrapsX) {
        if(tilesQuadrant[0] > tilesQuadrant[1]) {
          wrapSideX = 'left';
        } else {
          wrapSideX = 'right';
        }
      }

      if(wrapsY) {
        if(tilesQuadrant[2] > tilesQuadrant[3]) {
          wrapSideY = 'top';
        } else {
          wrapSideY = 'bottom';
        }
      }

      // calculate the position of the island
      // average all locations
      // but, change locations on the wrapside, so they match
      // finally, ensure the text stays on screen, at all times
      for(let i = 0; i < curTiles.length; i++) {
        let x = curTiles[i][0], y = curTiles[i][1]

        // transform X
        if(x >= this.mapwidth*0.5 && wrapSideX == 'left') {
          x -= this.mapWidth;
        } else if(x < this.mapWidth*0.5 && wrapSideX == 'right') {
          x += this.mapWidth;
        }

        // transform Y
        if(y >= this.mapHeight*0.5 && wrapSideY == 'top') {
          y -= this.mapHeight;
        } else if(y < this.mapWidth*0.5 && wrapSideY == 'bottom') {
          y += this.mapHeight;
        }

        // add final coordinates to average
        averageX += x;
        averageY += y;
      }

      // keep the text on screen
      // ?? Just bound it to the map rectangle, and perhaps change the anchor to match?  (e.g. if the text is pushed against the left edge, the anchor should be (0, 0.5))

      // divide by total, to get the actual average
      averageX /= curTiles.length;
      averageY /= curTiles.length;

      // display the island name on top of the island (add up and AVERAGE all x and y coordinates to get the center position)
      // TO DO: Averaging doesn't work with world wrapping. Find a solution for this
      let islandName = gm.add.text(averageX*ths.tileSize, averageY*ths.tileSize, data.name, mainStyle.mainText())
      islandName.anchor.setTo(0.5, 0.5)
    })

    // Function that is activated when a DOCK is discovered
    socket.on('dock-discovered', data => {
      // Get corresponding dock
      let curDock = serverInfo.docks[data.index];
      let x = curDock.x, y = curDock.y;

      // Add name on top of it
      // (give it a different color and wrap it sooner)
      let dockTitle = gm.add.text(x*ths.tileSize, y*ths.tileSize, data.name, mainStyle.mainText(150, '#FFFF00'))
      dockTitle.anchor.setTo(0.5, 1.0);

      // Clear the fog here
      this.map[y][x].fog = false;
      ths.fogBmd.clear(x*ths.tileSize, y*ths.tileSize, ths.tileSize, ths.tileSize);

      // TO DO
      // Always display the corresponding dock trade from now on
    })

    // Function that is activated when a CITY / TOWN is discovered
    socket.on('city-discovered', data => {
      // Get corresponding dock
      let curCity = serverInfo.cities[data.index];
      let x = curCity.x, y = curCity.y;

      // Add name on top of it
      // (give it a different color and wrap it sooner)
      let cityTitle = gm.add.text(x*ths.tileSize, y*ths.tileSize, data.name, mainStyle.mainText(150, '#FF00FF'))
      cityTitle.anchor.setTo(0.5, 1.0);

      // Clear the fog here
      this.map[y][x].fog = false;
      ths.fogBmd.clear(x*ths.tileSize, y*ths.tileSize, ths.tileSize, ths.tileSize);
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

      // TO DO: Remove once night mode is active; now it's just annoying
      this.lightSprite.visible = false;

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
      this.unitsOnMap[y] = [];
      for(var x = 0; x < this.mapWidth; x++) {
        this.tempMap[y][x] = [0, 0]; // index 0 = number of units on tile, index 1 = current counter (when displaying)
      }
    }

    /* FOR DEBUGGING (displays unit numbers)
    for(let i = 0; i < this.unitNums.length; i++) {
      this.unitNums[i].destroy();
    }

    this.unitNums = [];
    */

    // IMPORTANT: Sprites are saved based on y-coordinate, so that they are automatically ordered and overlap correctly

    // create ONE array that holds all sprites
    // Simultaneously, check how many units are on a certain tile
    for(let i = 0; i < this.dockSprites.length; i++) {
      this.unitsOnMap[ this.dockSprites[i].originalY ].push(this.dockSprites[i]);
    }

    for(let i = 0; i < this.citySprites.length; i++) {
      this.unitsOnMap[ this.citySprites[i].originalY ].push(this.citySprites[i]);
    }

    for(let i = 0; i < this.monsterSprites.length; i++) {
      this.monsterSprites[i].originalX = serverInfo.monsters[i].x;
      this.monsterSprites[i].originalY = serverInfo.monsters[i].y;

      this.unitsOnMap[ this.monsterSprites[i].originalY ].push(this.monsterSprites[i]);
      this.tempMap[ serverInfo.monsters[i].y ][ serverInfo.monsters[i].x ][0]++;
    }

    for(let i = 0; i < this.aiShipSprites.length; i++) {
      this.aiShipSprites[i].originalX = serverInfo.aiShips[i].x;
      this.aiShipSprites[i].originalY = serverInfo.aiShips[i].y;

      this.unitsOnMap[ this.aiShipSprites[i].originalY ].push(this.aiShipSprites[i]);
      this.tempMap[ serverInfo.aiShips[i].y ][ serverInfo.aiShips[i].x ][0]++;
    }

    for(let i = 0; i < this.playerShipSprites.length; i++) {
      this.playerShipSprites[i].originalX = serverInfo.playerShips[i].x;
      this.playerShipSprites[i].originalY = serverInfo.playerShips[i].y;

      this.unitsOnMap[ this.playerShipSprites[i].originalY ].push(this.playerShipSprites[i]);
      this.tempMap[ serverInfo.playerShips[i].y ][ serverInfo.playerShips[i].x ][0]++;
    }


    // reset the shadow canvas, set the fill style to transparent black
    this.unitShadows.clear()
    this.unitShadows.context.fillStyle = '#000000';

    let disp = [0, -0.5]; // displacement of the unit; usually slightly above the tile, so it sticks out

    // for all sprites (monsters, AI ships, player ships), move the sprite, then draw the shadow underneath it
    for(let y = 0; y < this.mapHeight; y++) {
      for(let i = 0; i < this.unitsOnMap[y].length; i++) {
        // this code simply gets the current unit and checks if the tile is still in fog
        let curUnit = this.unitsOnMap[y][i];
        let isInFog = this.map[ curUnit.originalY ][ curUnit.originalX ].fog;

        // the code below is for repositioning and rescaling sprites, in case there are multiple on a single tile
        let getTile = this.tempMap[ curUnit.originalY ][ curUnit.originalX ]
        let unitsOnTile = getTile[0];
        let curCounter = getTile[1];

        let tempPos = [ curUnit.originalX * this.tileSize, curUnit.originalY * this.tileSize]

        let newWidth = this.tileSize;
        // docks and cities don't count towards units, and should always be displayed in full
        if(curUnit.myType == 3 || curUnit.myType == 4) {
          tempPos[1] += 0;
          tempPos[0] += 0;
        } else {
          // scale down sprites, but not linearly (/unitsOnTile) => allow overlap, bigger sprites
          newWidth = ( this.tileSize / Math.sqrt(unitsOnTile) );

          //let xDisp =  (Math.random()*0.2 - 0.4)*this.tileSize;
          let xDisp = 0;

          // display as a column, with random horizontal placement
          tempPos[1] += ( (curCounter + 0.5) / unitsOnTile) * this.tileSize - newWidth;
          tempPos[0] += (this.tileSize - newWidth) + xDisp;
        }
        
        

        // increase counter
        this.tempMap[ curUnit.originalY ][ curUnit.originalX ][1]++;

        if(isInFog) {
          // only display the dot
          curUnit.visible = false;
          curUnit.myFogDot.visible = true;

          // set it to the right position and scale
          curUnit.myFogDot.width = curUnit.myFogDot.height = newWidth;
          curUnit.myFogDot.x = tempPos[0];
          curUnit.myFogDot.y = tempPos[1];
        } else {
          curUnit.myFogDot.visible = false;

          this.unitGroup.bringToTop(curUnit);

          if(curUnit.myType == 3 || curUnit.myType == 4) {
            // if it's a DOCK or a CITY, make sure we change proportions+placement accordingly
            curUnit.visible = true;

            if(curUnit.dir == 'front') {
              curUnit.height = newWidth*2;
              curUnit.width = newWidth;

              curUnit.x = tempPos[0];
              curUnit.y = tempPos[1] - newWidth;
            } else if(curUnit.dir == 'back') {
              curUnit.height = newWidth*2;
              curUnit.width = newWidth;

              curUnit.x = tempPos[0];
              curUnit.y = tempPos[1];
            } else if(curUnit.dir == 'right') {
              curUnit.height = curUnit.width = newWidth * 2;

              curUnit.x = tempPos[0] - newWidth;
              curUnit.y = tempPos[1] - newWidth;
            } else if(curUnit.dir == 'left') {
              curUnit.anchor.setTo(0.5, 0.5);

              curUnit.height = newWidth * 2;
              curUnit.width = -1 * newWidth * 2;

              curUnit.x = tempPos[0] + newWidth;
              curUnit.y = tempPos[1];
            }
            
          } else {
             // display the sprite + the shadow
            curUnit.visible = true;
            curUnit.width = curUnit.height = newWidth;

            // place the unit
            curUnit.x = tempPos[0];
            curUnit.y = tempPos[1];

            // change color for player ships
            // this.unitShadows.context.fillStyle = SHIP_COLORS[i];

            // draw the shadow
            this.unitShadows.context.beginPath();
            this.unitShadows.context.ellipse(tempPos[0] + newWidth*0.5, tempPos[1] + newWidth, newWidth*0.5, newWidth*0.3, 0, 0, 2 * Math.PI);
            this.unitShadows.context.fill();
          }

         
        }

        // DEBUGGING: Display index of unit
        //let newText = this.game.add.text(curUnit.x, curUnit.y, curUnit.index);
        //this.unitNums.push(newText);
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
