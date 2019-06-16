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


class GamePlay extends Phaser.State {
  constructor () {
    super()
  }

  preload () {

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
      TO DO: Create/place units (docks, aiShips, monsters, playerShips)
      TO DO: Update these units when receiving a server signal (at start of new turn)

    ***/

    // seed the noise object (with the mapSeed)
    noise.seed(serverInfo.mapSeed);

    // initialize some variables determining map size (and zoom level)
    let x1 = 0, y1 = 0, x2 = 10, y2 = 10
    let mapWidth = 60, mapHeight = 30;

    this.map = []; //initialize map variable

    var graphics = this.add.graphics(0, 0);
    let tileSize = Math.min(window.innerWidth / mapWidth, window.innerHeight / mapHeight);

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
        this.map[y][x] = curVal;

        // display the map
        // DEEP OCEAN
        if(curVal < -0.3) {
            graphics.beginFill(0x1036CC);
        // SHALLOW OCEAN
        } else if(curVal < 0.2) {
            graphics.beginFill(0x4169FF);
        // BEACH
        } else if(curVal < 0.25) {
            graphics.beginFill(0xEED6AF);
        // ISLAND
        } else {
            graphics.beginFill(0x228B22);
        }

        graphics.drawRect(x*tileSize, y*tileSize, tileSize, tileSize);
      }
    }

    /*

      Display all units

      Some of the units need to be saved as SPRITES, so they can be moved around later.
      (These are the same units that need to load an image from a baseURI)
      This means that dynamicLoadImage doesn't work. 

      Instead, load all baseURIs into cache at the start, then just create sprites from them.

    */
    // Display docks
    let docks = serverInfo.docks;
    this.dockSprites = [];
    for(let i = 0; i < docks.length; i++) {
      let x = docks[i].x, y = docks[i].y;

      let cacheLabel = 'dock';

      let newSprite = gm.add.sprite(x*tileSize, y*tileSize, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      this.dockSprites.push(newSprite);
    }

    // Display monsters
    console.log(serverInfo.monsters);
    let monsters = serverInfo.monsters;
    this.monsterSprites = [];
    for(let i = 0; i < monsters.length; i++) {
      let x = monsters[i].x, y = monsters[i].y;

      let cacheLabel = 'monsterNum' + monsters[i].myMonsterType;

      let newSprite = gm.add.sprite(x*tileSize, y*tileSize, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      this.monsterSprites.push(newSprite);
    }

    // Display AI Ships
    console.log(serverInfo.aiShips);

    let aiShips = serverInfo.aiShips;
    this.aiShipSprites = [];
    for(let i = 0; i < aiShips.length; i++) {
      let x = aiShips[i].x, y = aiShips[i].y;

      let cacheLabel = 'aiShipNum' + aiShips[i].myShipType;

      let newSprite = gm.add.sprite(x*tileSize, y*tileSize, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      this.aiShipSprites.push(newSprite);
    }

    // Display player Ships
    console.log(serverInfo.playerShips);

    let playerShips = serverInfo.playerShips;
    this.playerShipSprites = [];
    for(let i = 0; i < playerShips.length; i++) {
      let x = playerShips[i].x, y = playerShips[i].y;
      let cacheLabel = 'shipNum' + playerShips[i].num;

      let newSprite = gm.add.sprite(x*tileSize, y*tileSize, cacheLabel);
      newSprite.width = newSprite.height = tileSize;
      this.playerShipSprites.push(newSprite);
    }

    // Display the messages from the radio

    // Display all the players in the game and the color of their ship (and name/flag?)

    // load timer
    this.timerText = gm.add.text(gm.width*0.5, 60, "", mainStyle.timerText())
    this.timer = serverInfo.timer

    // load GUI overlay (displays room code and such)
    loadGUIOverlay(gm, serverInfo, mainStyle.mainText(), mainStyle.subText())

    loadMainSockets(socket, gm, serverInfo)
    loadWatchRoom(socket, serverInfo)

    // Function that is called whenever a new turn starts
    // Resets timer, resets other stuff, displays new situation, etc.
    let ths = this;
    socket.on('new-turn', data => {
      console.log("New turn => resetting timer to " + serverInfo.timer);

      // reset the timer 
      ths.timer = serverInfo.timer;

      // move the units around
      for(let i = 0; i < this.monsterSprites.length; i++) {
        this.monsterSprites[i].x = serverInfo.monsters[i].x * tileSize;
        this.monsterSprites[i].y = serverInfo.monsters[i].y * tileSize;
      }

      for(let i = 0; i < this.aiShipSprites.length; i++) {
        this.aiShipSprites[i].x = serverInfo.aiShips[i].x * tileSize;
        this.aiShipSprites[i].y = serverInfo.aiShips[i].y * tileSize;
      }

      for(let i = 0; i < this.playerShipSprites.length; i++) {
        this.playerShipSprites[i].x = serverInfo.playerShips[i].x * tileSize;
        this.playerShipSprites[i].y = serverInfo.playerShips[i].y * tileSize;
      }

      // TO DO
      // Reset stuffiebuffie
    })

    console.log("Game Play state")
  }

  update () {
    // Update timer
    gameTimer(this, serverInfo)
  }
}

export default GamePlay
