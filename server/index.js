'use strict'
const http = require('http')
const app = require('./config')
const Server = http.Server(app)
const PORT = process.env.PORT || 8000
const io = require('socket.io')(Server, {origins: "*:*"})

Server.listen(PORT, () => console.log('Game server running on:', PORT))

// this variable will hold all current game rooms (and thus all games that are currently being played)
const rooms = {}

const UPGRADE_DICT = require('../vendor/upgradeDictionary.js')
const noise = require('../vendor/perlinImproved.js');

io.on('connection', socket => {

  /****
   * 
   * The code below handles the CORE FUNCTIONALITY:
   * => Creating a new game
   * => Allowing players to join
   * => Rejoining/watching/destroying games
   *
   ****/

  // when a new room is requested ...
  socket.on('new-room', state => {
    // generate random set of 4 letters
    // until we have an ID that does not exist yet!
    let id = "SHIP";

    /*
    // TO DO: Re-enable this once the thing goes live!
    do {
      id = "";
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" //abcdefghijklmnopqrstuvwxyz0123456789";

      for (let i = 0; i < 4; i++)
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    } while (rooms[id] != undefined);
    */

    // setup the room with the current id
    // create a dictionary to hold all the players (the ones with controllers)
    // (we don't need the monitors saved here, as they do nothing but display the game)
    // also save any other variables we might need (such as drawings and guesses/suggestions submitted)
    rooms[id] = { 
      id: id, 
      players: {},

      gameStarted: false,
      curRound: 0,
      gameState: "Lobby",
      timerEnd: 0,
      timerLeft: 0,

      prepProgress: 0,
      prepSkip: false,

      monsterDrawings: [],
      monsterTypes: [],

      shipDrawings: [],
      
      signalHistory: [],
      peopleDisconnected: [],
      destroyingGame: false,
    }

    // save the main room in the socket, for easy access later
    socket.mainRoom = id

    // join the room (room is "automatically created" when someone joins it)
    socket.join(id + "-Monitor");

    // beam back the room code to the "game monitor"
    socket.emit('room-created', {roomCode: id})

    console.log("New room created: " + id)
  })

  // when a room JOIN is requested ...
  socket.on('join-room', state => {
    // get roomcode requested, turn into all uppercase (just to be sure)
    let room = state.roomCode
    let name = state.userName
    let curRoom = rooms[room]

    // check if the room exists and is joinable
    // also check if the name provided is not empty, too long, or already in use
    let success = true
    let err = ''
    let rejoin = false

    if(curRoom == undefined) {
      err = 'This room is not available'
      success = false
    } else if(curRoom.gameStarted) {
      // If the game has already started ...

      // If the game is paused, this player is a possible rejoiner!
      if(curRoom.peopleDisconnected.length > 0) {
        // Check if the name provided is in the list of disconnected players
        let nameInGame = curRoom.peopleDisconnected.some(function(k) {
            return k[1] === name;
        });

        // if so, we can succesfully rejoin!
        if(nameInGame) {
          rejoin = true
        } else {
          err = 'Attempted rejoin failed: incorrect name'
          success = false
        }
      } else {
        err = 'This game has already started'
        success = false
      }
    } else {
      let nameInUse = Object.keys(curRoom.players).some(function(k) {
          return curRoom.players[k].name === name;
      });

      if(name.length == 0) {
        err = 'Please enter a name!'
        success = false
      } else if(name.length >= 12) {
        err = 'Name must be under 12 characters'
        success = false
      } else if(nameInUse) {
        err = 'This name is already in use'
        success = false
      }
    }

    console.log("Room join requested at room " + room + " || Success: " + success.toString())

    // if joining was succesful ...
    //  => add the player
    //  => check if it's the first player (if so => make it the VIP)
    //  => send an update to all other players (in the same room, of course)
    let vip = false
    let rank = -1
    if(success) {
      socket.join(room + "-Controller")

      // if this is NOT a rejoin, create a new player
      // (if it IS a rejoin, the corresponding player should still exist within the room object, and we can get the correct values from there)
      if(!rejoin) {
        rank = Object.keys(curRoom.players).length

        if(rank < 1) {
          vip = true
        }

        let playerObject =  { 
          name: name, 
          rank: rank,
          vip: vip,  
          profile: null, 
          room: room,
          myShip: -1,
          myRoles: [],
        }
        curRoom.players[socket.id] = playerObject

        sendSignal(room, true, 'new-player', playerObject)
      } else {
        // IMPORTANT: Because it's a rejoin, the socket.id will be different
        // As such, we need to transfer info from the OLD id to the NEW id, and then delete the old one

        // find the old player id
        for(let i = 0; i < curRoom.peopleDisconnected.length; i++) {
          let tempVal = curRoom.peopleDisconnected[i]
          if(tempVal[1] == name) {
            // copy the info over from old id (tempVal[0]) to new id (socket.id)
            curRoom.players[socket.id] = curRoom.players[ tempVal[0] ]

            // remove the player from the disconnected players
            curRoom.peopleDisconnected.splice(i, 1)

            // and permanently delete the old socket.id from the player keys
            delete curRoom.players[ tempVal[0] ]
            break;
          }
        }

        // get the rank
        rank = curRoom.players[socket.id].rank
      }

      // save the main room on the socket object, for easy access later
      socket.mainRoom = room
    }

    // send success response
    // if it's a new player, it will just setup the game and go to the waiting area
    // if it's a rejoin, it will push the player to the correct gamestate
    if(!success) {
      socket.emit('join-response', { success: success, err: err})
    } else {
      let gameState = curRoom.gameState
      let language = curRoom.language

      if(!rejoin) {
        socket.emit('join-response', { success: success, vip: vip, rank: rank, rejoin: rejoin, gameState: gameState, language: language })
      } else {
        /* TO DO: Don't allow rejoins for now 
        
        let preSignal = curRoom.players[socket.id].preSignal
        let playerDone = curRoom.players[socket.id].done
        socket.emit('join-response', { success: success, vip: vip, rank: rank, rejoin: rejoin, gameState: gameState, language: language, preSignal: preSignal, playerDone: playerDone })
      
        */
      }

      // if this was the last one to reconnect, resume the game!
      if(curRoom.peopleDisconnected.length <= 0) {
        // send message to all monitors
        sendSignal(room, true, 'pause-resume-game', false, false)

        // send message to the VIP
        let vipID = Object.keys(curRoom.players).find(key => curRoom.players[key].vip === true)
        sendSignal(room, false, 'pause-resume-game', false, false, vipID)

        // update timer (to account for time lost when pausing)
        curRoom.timerEnd = new Date(curRoom.timerEnd + curRoom.timerLeft*1000)
      }
    }

  })

  // When a room WATCH is requested
  socket.on('watch-room', state => {
    /* 
    TO DO: Don't allow room watching at the moment
    */
    return false;


    let room = state.roomCode
    let curRoom = rooms[room]

    let success = true
    let err = ''
    if(rooms[room] == undefined /* && !rooms[code].gameStarted */) {
      err = 'This room is not available'
      success = false
    }

    console.log("Room watch requested at room " + room + " || Success: " + success.toString())

    // if watch request was succesful ...
    //  => add the watcher (just join the room)
    //  => send the correct info (and pre/post signals) to the new monitor
    let timer = 0
    let gameState = 'Lobby'
    let preSignal = null
    let paused = false
    let language = curRoom.language

    if(success) {
      socket.join(room + "-Monitor")
      socket.mainRoom = room

      // Determine the current TIMER of the game
      if(curRoom.timerEnd == 0) {
        // If there is no set timer end time, the current round must be timerless, so just return 0
        timer = 0
      } else {
        // Otherwise, calculate the time left on the timer
        // Subtraction gives the difference in milliseconds, so divide by 1000 (because our timer works in seconds)
        timer = (curRoom.timerEnd - new Date())/1000
      }

      // Get the next state
      gameState = curRoom.gameState

      if(curRoom.peopleDisconnected.length > 0) {
        paused = true
      }

      // The game should have saved a certain "preSignal", which is the information needed before launching the current state
      // Send it as well
      if(curRoom.preSignal !== null) {
        preSignal = rooms[room].preSignal
      }
    }

    if(!success) {
      socket.emit('watch-response', { success: success, err: err })
    } else {
      socket.emit('watch-response', { success: success, timer: timer, gameState: gameState, language: language, preSignal: preSignal, paused: paused })
    }

  })

  // When a client, who wants to "watch room" a game that's currently underway, has finished loading ... 
  socket.on('finished-loading', state => {
    // replay the signal history (for the current state)
    let room = socket.mainRoom
    let sgs = rooms[room].signalHistory
    for(let i = 0; i < sgs.length; i++) {
      let curSig = sgs[i]
      // 0 is the signal name/title/handler, 1 is the actual info being transmitted
      socket.emit(curSig[0], curSig[1])
    } 
  })

  // The VIP has decided to continue the game without disconnected players
  socket.on('continue-without-disconnects', state => {
    let curRoom = rooms[socket.mainRoom]

    // reduce player count
    curRoom.playerCount -= curRoom.peopleDisconnected.length

    // delete all disconnected players (by socket id)
    for(let i = 0; i < curRoom.peopleDisconnected.length; i++) {
      delete curRoom.players[ curRoom.peopleDisconnected[i][0] ]
    }

    // send message to all monitors
    // (the VIP doesn't need a message, as he was the one that made this decision)
    sendSignal(room, true, 'pause-resume-game', false, false, false)

    // update timer (to account for time lost when pausing)
    curRoom.timerEnd = new Date(curRoom.timerEnd + curRoom.timerLeft*1000)
  })

  // When any client disconnects ...
  socket.on('disconnect', state => {
    let room = socket.mainRoom
    let curRoom = rooms[room]

    // the player wasn't in a room yet; no need for further checks
    // the game was already deleted; also nothing to do anymore
    if(room == undefined || room == null || curRoom == undefined) {
      return;
    }

    if(!(socket.id in curRoom.players)) {
      // if the disconnect was from a MONITOR, no probs
      // The game is still going strong, one just needs to "watch room" again.
    } else {
      // If the disconnect is from a player, VERY MUCH PROBLEMOS
      // If it was the last player, OR it was the VIP, delete the whole room
      if(Object.keys(curRoom.players).length < 1 || curRoom.players[socket.id].vip) {
        delete rooms[room]
      } else {
        // If it wasn't the last player in the room ...
        // If we're in game destroying mode (the players have deliberately chosen to end the game) ...
        if(curRoom.destroyingGame) {
          // Delete the player
          delete curRoom.players[socket.id]

          // Return here; so the game does not PAUSE or try something weird
          return;
        }

        // Pause the game

        // If this is the first one to pause the game (AKA "at this moment, the game is not paused yet")
        if(curRoom.peopleDisconnected.length <= 0) {
          // Save the time left on the timer
          curRoom.timerLeft = (curRoom.timerEnd - new Date())/1000

          // Inform everybody of this change ("true" means the game should pause, "false" means the game should resume)
          sendSignal(room, true, 'pause-resume-game', true, false, false)

          // We only want the VIP (for the controllers)
          let vipID = Object.keys(curRoom.players).find(key => curRoom.players[key].vip === true)
          sendSignal(room, false, 'pause-resume-game', true, false, false)
        }

        // If peopleDisconnected > 0, the game must automatically be paused (this is just more efficient than adding another variable)
        let name = curRoom.players[socket.id].name
        curRoom.peopleDisconnected.push([socket.id, name])
      }
    }
  })

  // When the game is ended/exited/destroyed
  socket.on('destroy-game', state => {
    // set our room to destroy mode (sounds exciting)
    rooms[socket.mainRoom].destroyingGame = true

    // disconnect everyone
    sendSignal(room, true, 'force-disconnect', {}, false, false)
    sendSignal(room, false, 'force-disconnect', {}, false, false)

    // room should be automatically destroyed when last player is removed (see "disconnect" eventListener)
  })

  /****
   * 
   * End of core functionality
   *
   ****/

  // When the VIP has decided to start the game ...
  socket.on('start-game', state => {
    let room = socket.mainRoom
    let curRoom = rooms[room]

    if(curRoom == undefined) {
      console.log("Error: Tried to start game in undefined room")
      return;
    }

    curRoom.playerCount = Object.keys(curRoom.players).length;

    // Determine map seed
    curRoom.mapSeed = Math.random();

    // Distribute roles
    createPlayerShips(curRoom);

    // Make the game started (in the eyes of the server)
    curRoom.gameStarted = true;

    // If the current room skips preparation, jump straight to the main game
    if(curRoom.prepSkip) {
      gotoNextState(room, 'Play')
    } else {
      // Otherwise, switch to the preparation phase
      // This should send the correct roles to each player (as a preSignal)
      // And then switch to the preparation state
      gotoNextState(room, 'Prep')
    }

    
  })

  // When someone submits a drawing ...
  socket.on('submit-profile-pic', state => {
    let room = socket.mainRoom
    let curRoom = rooms[room]
    let curPlayer = curRoom.players[socket.id]

    console.log('Received profile pic in room ' + room);

    // save the drawing as profile picture (for this player)
    curPlayer.profile = state.dataURI

    // update the waiting screen
    sendSignal(room, true, 'player-updated-profile', curPlayer)
  })

  /***
   *
   * These signals below are very specific signals for each role 
   * (adjusting the compass, lowering the sails, firing the cannons, buying a new cannon, etc.)
   *
   */

  // When someone updated their compass
  // @parameter orientation = desired orientation of the ship (integer between 0 and 8)
  socket.on('compass-up', orientation => {
    // update orientation directly
    socket.curShip.orientation = orientation;
  })

  // When someone updated their sails
  // @parameter lvl = desired sail level/height for the ship
  socket.on('sail-up', lvl => {
    // get difference in crew that needs to work the sails (based on previous amount)
    let deltaCrew = (lvl - socket.curShip.roleStats[3].sailLvl);

    // check if we can "spend" the extra crew
    // (this should automatically work for a negative delta, in which case resources will just be added)
    if( resourceCheck(socket, 3, -1, { 1: deltaCrew }, 1) ) {
      // update sails to the new level
      socket.curShip.roleStats[3].sailLvl = lvl;
    }
    
  })

  // When someone updated their peddles
  // @parameter lvl = desired peddle level/strength for the ship
  socket.on('peddle-up', lvl => {
    // get difference in crew that needs to work the peddles (based on previous amount)
    // Remember: peddle crew costs twice as much (per level) => 2 CREW = 1 PEDDLE EXTRA
    let deltaCrew = (lvl*2 - socket.curShip.roleStats[3].peddleLvl*2);

    // check if we can "spend" the extra crew
    if( resourceCheck(socket, 3, -1, { 1: deltaCrew }, 1) ) {
      // update sails to the new level
      socket.curShip.roleStats[3].peddleLvl = lvl;
    }

  })

  // When someone wants to add extra load to a cannon
  // @parameter cannon = index of the cannon to be loaded up
  socket.on('load-up', cannon => {
    // If we have a single cannonball to spare ...
    if( resourceCheck(socket, 4, -1, { 3: 1} )) {
      // ... update cannon directly
      socket.curShip.cannons[cannon]++;
    }
  })

  // When someone wants to buy a cannon
  // @parameter cannon = index of the cannon to be bought
  socket.on('buy-cannon', cannon => {
    // If we have the resources for a (cumulative) cannon purchase ...
    if( resourceCheck(socket, 4, -1, null, 2) ) {
      // ... set cannon load to 0 (negative means unbought, positive means bought)
      socket.curShip.cannons[cannon] = 0;
    }
  })

  // When someone orders their ship to fire
  // This signal is dataless, that's why it has a function without parameters
  socket.on('fire', function() {
    // calculate required resources
    let cannonLevel = socket.curShip.roleStats[4].lvl;
    let numberOfCannons = 0;
    for(let i = 0; i < 4; i++) {
        if(socket.curShip.cannons[i] >= 0) {
            numberOfCannons++;
        }
    }

    let costs = { 1: Math.round((cannonLevel + 1) / 2) * numberOfCannons }

    // Check if we have the resources to fire
    if( resourceCheck(socket, 0, -1, costs, 3) ) {
      // Remember that the ship will fire, when the new turn starts
      socket.curShip.willFire = true;
    }

  });

  socket.on('name-island', data => {
    // data.name holds the desired name (a string)
    // data.island holds the index of the island to be named (an integer)
    rooms[socket.mainRoom].islands[data.island].name = data.name;
    rooms[socket.mainRoom].islands[data.island].discovered = true;

    // TO DO: If island is discovered, inform everyone and display/reveal it on the monitor
  });

  socket.on('dock-trade', function() {
    // TO DO
    // The dock we're trading with should be saved on the ship (when we arrived there)
    // The deal should be saved on the dock object itself

    // Check if we have the resources
    // If so, trade and update stats
    // If not, return error message
  });


  // When someone wants an upgrade
  // @parameter role = index of the role that wants an upgrade
  socket.on('upgrade', role => {
    let curShip = socket.curShip;
    let curLevel = curShip.roleStats[role].lvl;

    // if resources and costs check out ...
    if( resourceCheck(socket, role, curLevel) ) {
      // ... execute upgrade
      curShip.roleStats[role].lvl += 1;
      curShip.roleStates[role].lvlUp = true;
    }
  })

  /***
   *
   * This signal is received when a player finishes the preparation for a certain role
   *
   */
  socket.on('submit-preparation', state => {
    // The info submitted depends on the role (captain does title and ship, for example)
    // ... but it's ALWAYS an object 
    let room = socket.mainRoom
    let curRoom = rooms[room]

    // ... sets the right values on this ship
    for(var key in state) {
      // if it's a resource ... add it!
      if(key.substring(0,3) == 'res') {
        let i = parseInt( key.substring(3,4) ); // which resource? numerical index
        socket.curShip.resources[i] += parseInt( state[key] );

      // if it's a monster drawing, add it to the monster _drawings_ array
      } else if(key == 'shipMonsterDrawing') {
        curRoom.monsterDrawings.push( state[key] );

      // if it's a monster title, add the monster (with that title) to the array with POSSIBLE monsters (not actual monsters)
      // NOTE: Because title + drawing are sent at the same time, they will automatically receive the same index
      } else if(key == 'shipMonster') {
        curRoom.monsterTypes.push( state[key] );

      } else if(key == 'shipDrawing') {
        // save the ship's drawing, at the correct index
        curRoom.shipDrawings[socket.curShip.num] = state[key];

        // also save the drawing on the ship itself, for easy reference
        socket.curShip[key] = state[key];
      // otherwise, just copy the VALUE directly to the ship, and put it on index KEY
      } else {
        socket.curShip[key] = state[key];
      }     
    }

    // ... and saves preparation progress
    curRoom.prepProgress++;
    let tempProgress = rooms[room].prepProgress;

    // if everyone has submitted their preparation, start the game immediately!
    // preparation needed = number of ships * number of roles per ship
    let prepNeeded = curRoom.playerShips.length * 5;

    if(tempProgress == prepNeeded) {
      // START THE GAME!
      console.log("Preparation finished => starting game");

      // Go to the next state ("Play"), lots of stuff will be configured there
      gotoNextState(room, 'Play');
    } else {
      // if we're not done yet, simply inform monitors of progress
      sendSignal(room, true, 'preparation-progress', Math.round(tempProgress / prepNeeded * 10)/10, false, true)
    }
  })

  /***
   *
   * This signal is received when the VIP timer runs out => a new turn should start
   * This calls finishTurn, which calls startTurn, then the turn has actually begun
   *
   */
  socket.on('timer-complete', state => {
    let room = socket.mainRoom

    finishTurn(room);
  })

  // room: the current room to move to the next state
  // nextState: which state to move to
  function gotoNextState(room, nextState) {
    let timer = 0
    let curPlayerID = null
    let p = null
    let r = null
    let curRoom = rooms[room]

    if(curRoom == undefined) {
      console.log("Error: tried to switch states in a non-existent room")
      return;
    }

    // reset signal history here (because there might be more preSignals added later, before the state switch)
    curRoom.signalHistory = []
    curRoom.preSignal = null

    // clear player signals
    for(let player in curRoom.players) { 
      curRoom.players[player].preSignal = null
    }
    
    switch(nextState) {
      // If the next state is the preperation state (first of the game, before actual gameplay starts)
      case 'Prep':

        // inform all players of their ship and roles
        // we need to loop through the players, instead of sending a general player signal, because each of them will have different roles/a different ship
        for(let playerID in curRoom.players) {
          let curPlayer = curRoom.players[playerID]
          sendSignal(room, false, 'pre-signal', { myShip: curPlayer.myShip, myRoles: curPlayer.myRoles }, true, true, playerID);
        }

        // no timer in preparation - it ends when everyone has submitted the required information
        timer = 0
        break;

      // If the next state is gameplay state 
      // (this is called ONCE at the beginning of the game, from that moment on, the startTurn() and finishTurn() functions regulate turns)
      case 'Play':
        // start a turn, set gameStart to "true" (to initialize some stuff)
        startTurn(room, true);
        
        // set turn timer
        timer = 20;
        break;

      // If the next state is the game over state ...
      case 'Over':
        // TO DO
        break;
    }

    // calculate when the timer should end (on the server)
    // this is only used to make the "watch room" functionality possible (where people might drop in at any time)
    if(timer == 0) {
      curRoom.timerEnd = 0
    } else {
      curRoom.timerEnd = new Date(new Date().getTime() + timer*1000)  
    }

    // finally, actually start the next state, and notify both Monitors and Controllers
    curRoom.gameState = nextState

    sendSignal(room, true, 'next-state', { nextState: nextState, timer: timer }, false, false)
    sendSignal(room, false, 'next-state', { nextState: nextState, timer: timer }, false, false)
  }
})

/*
  This function takes care of sending all global signals. (This means they are not socket-specific signals, such as "joining the room was succesful")
  The reason this is a function, is because there are 
   => several types of signals (pre signal, normal signal, player-specific signal, etc.)
   => AND we want to save those signals in history (to allow rejoin/room watch functionality)
  Right now, players have no signalHistory (just a preSignal and a is-the-player-done boolean; this could change when I start making more complex games)

  @parameter room => the main room in which to send the signal
  @parameter monitor => true if the signal is sent to monitors, false if it's sent to controllers
  @parameter label => the name/label for the signal
  @parameter info => the info that's sent with the signal
  @parameter preSignal => whether it's a presignal 
                          (presignals are stored elsewhere than all other signals, because they are sent at different times for different purposes)
  @parameter storeSignal => true if the signal should be saved, false if not
  @parameter playerID => the specific player that should receive the signal (if applicable)
*/
function sendSignal(room, monitor, label, info, preSignal = false, storeSignal = true, playerID = null) {
  if(monitor) {
    io.in(room + "-Monitor").emit(label, info)
    
    if(storeSignal) {
      if(preSignal) {
        rooms[room].preSignal = info
      } else {
        rooms[room].signalHistory.push([label, info])
      }
    }

  } else {
    if(playerID == null) {
      io.in(room + "-Controller").emit(label, info)

      if(storeSignal) {
        if(preSignal) {
          for(let player in rooms[room].players) { 
            rooms[room].players[player].preSignal = info
          }
        } else {
          // at the moment, players don't need a signalHistory
        }
      }
    } else {
      io.to(playerID).emit(label, info)

      if(storeSignal) {
        if(preSignal) {
          rooms[room].players[playerID].preSignal = info
        } else {
          // at the moment, players don't need a signalHistory
        }
      }
    }
  }
}



function createPlayerShips(room) {
  // TO DO: with many players, there might be more players per boat than there are roles. 
  //         => Perform a check for this. 

  // algorithm to determine a random distribution of boat sizes
  // it just picks a number of boats, and then (retroactively) determines how many players will be in each boat
  const num = room.playerCount;
  let numberBoats = Math.round(Math.sqrt(num)) + Math.round( (Math.random()-0.5)*Math.sqrt(num) )

  // there can never be fewer than two boats
  if(numberBoats < 2) {
    numberBoats = 2;
  }

  // exception: if 1 player, number of boats is always 1. For debugging on my own :(
  if(num == 1) {
    numberBoats = 1;
  }

  // create ship (object) for each ship
  room.playerShips = [];
  for(let i = 0; i < numberBoats; i++) {
    room.playerShips.push( createShip(i) );
  }

  // now we loop over it and determine player distribution
  // the keys here are the player's socket IDs
  let curBoat = 0;
  const keys = Object.keys(room.players)
  for (const key of keys) {
    // add this player to the current boat
    room.playerShips[curBoat].players.push(key);

    // also inform the player this is his boat
    room.players[key].myShip = curBoat;

    // save this ship on the socket object (for easier/faster reference in later functions)
    io.sockets.connected[key].curShip = room.playerShips[curBoat];

    console.log("Player " + key + " will be on ship number " + curBoat);
    
    // switch to the next boat
    curBoat = (curBoat + 1) % numberBoats;
  }

  console.log("These players are on ship 0: " + room.playerShips[0].players);

  // now we distribute roles for each ship.
  // for each boat ...
  for(let i = 0; i < numberBoats; i++) {
    let fullRoleList = [0,1,2,3,4];
    let playersOnShip = room.playerShips[i].players.length;

    let curPlayer = 0;
    // ... loop through all players, 
    // and give them one role at a time, 
    // until no more roles are left
    while(fullRoleList.length > 0) {
      let tempKey = room.playerShips[i].players[curPlayer];

      console.log("Going once; player " + tempKey);
      console.log(fullRoleList);

      let roleToGive = fullRoleList.splice(0,1)[0];
      room.players[tempKey].myRoles.push(roleToGive);

      curPlayer = (curPlayer + 1) % playersOnShip;

      // the captain of each ship is saved on the ship (by socket id)
      // tempKey is the key in the player dictionary, which is equal to the socket.id
      if(roleToGive == 0) {
        room.playerShips[i].captain = tempKey;
      }
    }
  }

  console.log(room.playerShips);
}

/*

  This function checks if spending a certain cost/number of resources is ALLOWED (or POSSIBLE)
  If so, it immediately informs the captain of the change.
  If not, it immediately informs the captain of the failure (with an error message)

  It returns true/false value, because what's actually being bought/upgraded can change heavily.

  @parameter room => the room in which a new turn should be started
  @parameter gameStart => if true, this means it is the first signal of the game, and some extra info needs to be sent.

*/
function resourceCheck(socket, role, curLevel, costs = null, actionType = 0) {
  let curShip = socket.curShip

  /**** GET THE COST ****/

  // If we haven't been given a predetermined cost (by some other function), calculate it ourselves (as an UPGRADE)
  if(costs == null) {
    // If the current level is -1, this means we're BUYING something
    // Calculate cumulative costs
    costs = {} 
    if(curLevel == -1) {
      let targetLevel = curShip.roleStats[role].lvl;

      // For each level ...
      for(let i = 0; i <= targetLevel; i++) {
          let c = UPGRADE_DICT[role][i];

          // Go through the different resource costs at this level ...
          for(let key in c) {
              // If this resource isn't in our costs yet, add it (with this value)
              if(costs[key] == undefined) {
                  costs[key] = c[key];
              // If this resource is already in the costs object, just add this value to it
              } else {
                  costs[key] += c[key];
              }
          }
      }
    } else {
      // If it's a regular upgrade/purchase, just get the value from the dictionary
      costs = UPGRADE_DICT[role][(curLevel + 1)]
    }
  }

  /**** CHECK COST AGAINST SHIP RESOURCES ****/
  let upgradePossible = true;
  for(let key in costs) {
    let convKey = parseInt(key);
    if(costs[key] > curShip.resources[convKey]) {
      upgradePossible = false;
      break;
    }
  }

  /**** PERFORM ACTIONS (based on whether the purchase is possible/goes through or not) ****/

  // If possible ... 
  if(upgradePossible) {
    // subtract resources
    for(let key in costs) {
      let convKey = parseInt(key);
      curShip.resources[convKey] -= costs[key];

      // if it's crew, but we're not ALLOCATING crew (but spending it) actually spend it
      if(convKey == 1 && actionType != 1) {
        curShip.workingCrew -= costs[key];
      }
    }

    // inform captain
    sendSignal(socket.mainRoom, false, 'res-up', curShip.resources, false, false, curShip.captain)
  } else {
    // If not possible, do not upgrade
    // send the captain an error message (informing him of the failure) 
    // Error messages have this form: Array (2); 0 = message type, 1 = role that created the error

    // TO DO/REMARK: it takes the actionType (which determines the error message) directly from this function.
    // In the future, I might want to differentiate or performe extra checks
    sendSignal(socket.mainRoom, false, 'error-msg', [actionType, role], false, false, curShip.captain)
  }

  return upgradePossible;
}

function dealDamage(obj, dmg) {
  obj.health -= dmg;

  // TO DO: Inform player of damage ??

  // if we're dead ...
  if(obj.health <= 0) {
    // respawn (based on unit type)
    let uType = obj.myUnitType;

    switch(uType) {
      // Player ship: no respawning, inform of game over
      case 0:
        break;

      // Monster: respawn to respawn location for this type
      case 1:
        // TO DO

        break;

      // AI ship: respawn to random dock (with a route, which you pick immediately)
      case 2:
        // TO DO

        break;

      // Docks (3) can't respawn.
    }
  }
}


/*

  This function takes care of starting a turn
  @parameter room => the room in which a new turn should be started
  @parameter gameStart => if true, this means it is the first signal of the game, and some extra info needs to be sent.

*/
function startTurn(room, gameStart = false) {
  console.log("Starting turn in room " + room)

  let curRoom = rooms[room]

  /* 

  == Update MONITORS ==
  
  Each monitor should have the world situation updated. This means
   => New position (and orientation) for all units (ships and sea monsters)
   => New deals at the docks
   => ...

  In many cases, only information that has _CHANGED_ is sent. 
  
  */

  // variable that will hold the monitor package (thus mPack)
  let mPack = {}

  /*

    This is where GAME INITIALIZATION takes place

    The comments speak for themselves. 
    It simply creates the map and everything on it, including resources, docks (and their trading routes), etc.

  */
  if(gameStart) {
    // send the map seed
    mPack["mapSeed"] = curRoom.mapSeed;

    // create the actual BASE MAP (sea and islands)
    createBaseMap(curRoom)

    // discover ISLANDS
    // these only need to be saved inside the map (for each tile that's part of an island, save its island index)
    // this function also adds a DOCK to each island
    discoverIslands(curRoom)

    // create routes between docks
    // save the routes themselves within the dock
    // create an AI ship for each dock, pick a random route, place the ship at the start of the route
    createDockRoutes(curRoom);

    // create all monsters (individual array)
    createSeaMonsters(curRoom);

    // distribute MONSTERS and PLAYERS (both already have their individual array; update that and now place them inside the map)
    distributeStartingUnits(curRoom);

    // add ALL this information to the "mPackage": the seed, the drawings of creatures/ships, dock position, etc.

    // send the drawings (include FLAG and PLAYER DRAWINGS ??)
    mPack["monsterDrawings"] = curRoom.monsterDrawings;
    mPack["shipDrawings"] = curRoom.shipDrawings;
    mPack["aiShipDrawings"] = [];

    // send the units
    // TO DO: Only send the information we need: the type (for displaying the drawing) and their location (perhaps orientation)
    // TO DO: Later on, we need to send the dock deals, and which islands have been discovered
    mPack["docks"] = curRoom.docks;
    mPack["monsters"] = curRoom.monsters;
    mPack["aiShips"] = curRoom.aiShips;
    mPack["playerShips"] = curRoom.playerShips;
  } else {
     // send UPDATED information about all units
    //  => their new position
    //  => ?? anything else ??
    mPack["monsters"] = curRoom.monsters;
    mPack["aiShips"] = curRoom.aiShips;
    mPack["playerShips"] = curRoom.playerShips;
  }

  // send the mPack to all monitors
  sendSignal(room, true, 'pre-signal', mPack, true)




  /* 

  == Update PLAYERS ==

  Each player should have updated information - BUT ONLY FOR THEIR ROLES
  For each player, a "package" is put together that contains only what this player needs (based on his roles)
  This puts slightly more strain on the server, but limits internet traffic significantly (and thus increases speed)

  pPack = "player package" 

  (didn't want to do this, but had some trouble with reserved words and all)

  */

  // loop through all ships
  // some information only needs to be determined ONCE per ship
  //  => adjacency checks (next to a dock? next to an undiscovered island?)
  //  => cartographer checks (enemies within range?)
  for(let i = 0; i < curRoom.playerShips.length; i++) {
    let curShip = curRoom.playerShips[i];
    curShip.captainCanTrade = -1;

    // == ADJACENCY (CAPTAIN) STUFF ==
    // check the tiles left/right/top/bottom
    const positions = [[-1,0],[1,0],[0,1],[0,-1]];
    let islandsWeAlreadyChecked = {};
    let captainTasks = [];
    for(let j = 0; j < 4; j++) {
      // get tile
      // TO DO: I REALLY need to make a function for these "wrap around the map" calculations
      let xTile = curShip.x + positions[j][0];
      let yTile = curShip.y + positions[j][1];
      if(xTile < 0) { xTile += curRoom.mapWidth } else if(xTile >= curRoom.mapWidth) { xTile -= curRoom.mapWidth }
      if(yTile < 0) { yTile += curRoom.mapHeight } else if(yTile >= curRoom.mapHeight) { yTile -= curRoom.mapHeight }

      let curTile = curRoom.map[yTile][xTile]

      // check against TASK CONDITIONS

      // island discovery; if it's an island, get its index, check if it's already been discovered
      if(isIsland(curTile)) {
        const ind = curTile.island;
        // if it hasn't been discovered, AND it's not an island we're currently discovering (the ship can touch multiple tiles of the same island at once)
        // send a task to discover an island ("1"), and send WHICH island we're discovering
        if(!curRoom.islands[ind].discovered && !(ind in islandsWeAlreadyChecked) ) {
          captainTasks.push([1,ind]);
          islandsWeAlreadyChecked[ind] = true;
        }
      }

      // dock trade
      if(hasDock(curTile)) {
        // send the deal to the captain
        const ind = curTile.dock;
        captainTasks.push([2,ind]);

        curShip.captainCanTrade = ind;
      }
    }

    // == CARTOGRAPHER STUFF ==
    // Get the map range AND what units are visible
    let mapSize = 3, sightLvl = 0;

    // Determine map size and visible units based on instrument level
    switch(curShip.roleStats[2].lvl) {
        case 0:
            mapSize = 3;
            sightLvl = 0;
            break;

        case 1:
            mapSize = 5
            sightLvl = 0
            break;

        case 2:
            mapSize = 5
            sightLvl = 1
            break;

        case 3:
            mapSize = 7
            sightLvl = 1
            break;

        case 4:
            mapSize = 7
            sightLvl = 2
            break;

        case 5:
            mapSize = 9
            sightLvl = 2
            break;
    }

    // TO DO: Override for testing. Remove this in deployment
    mapSize = 20;
    sightLvl = 2;

    // Loop through these tiles to find all units within them
    // Generate a 2D array with a "personalized" view of all the units
    curShip.personalUnits = [];
    let transX = curShip.x - Math.floor(0.5*mapSize), transY = curShip.y - Math.floor(0.5*mapSize);
    
    // The client only needs to know what image to display and where to display it. (Cartographer doesn't even need dock deals, for example.)
    //       => The "where" is in the "x" and "y" values
    //       => The "which drawing is it" is in the index
    // It's created as a flat 1D array, because that is probably more efficient. (There'll probably only be a few units around you, so no need for a large 2D array.)

    for(let y = 0; y < mapSize; y++) {
      for(let x = 0; x < mapSize; x++) {
        // transform coordinates so that our ship is centered
        let xTile = x + transX;
        if(xTile < 0) { xTile += curRoom.mapWidth } else if(xTile >= curRoom.mapWidth) { xTile -= curRoom.mapWidth }

        let yTile = y + transY;
        if(yTile < 0) { yTile += curRoom.mapHeight } else if(yTile >= curRoom.mapHeight) { yTile -= curRoom.mapHeight }

        let mapTile = curRoom.map[yTile][xTile];

        // if our sight is at least level 1, we can see docks and AI ships
        if(sightLvl >= 1) {
          // if this tile has a dock, add it
          if(mapTile.dock != null) {
            curShip.personalUnits.push({ myType: 3, index: 0, x: x, y: y });
          }

          // if this tile has ai ships, add them
          if(mapTile.aiShips.length > 0) {
            // send the type of this object AND the drawing index (or "AI type")
            for(let aa = 0; aa < mapTile.aiShips.length; aa++) {
              const myIndex = mapTile.aiShips[aa];
              curShip.personalUnits.push({ myType: 2, index: curRoom.aiShips[myIndex].myShipType, x: x, y: y });
            }
          }
        }

        // if our sight is at least level 2, we can see monsters and player ships as well!
        if(sightLvl >= 2) {
          // if this tile has monsters, add them
          if(mapTile.monsters.length > 0) {
            for(let aa = 0; aa < mapTile.monsters.length; aa++) {
              const myIndex = mapTile.monsters[aa];
              curShip.personalUnits.push({ myType: 1, index: curRoom.monsters[myIndex].myMonsterType, x: x, y: y });
            }
          }

          // if this tile has player ships, add them
          if(mapTile.playerShips.length > 0) {
            for(let aa = 0; aa < mapTile.playerShips.length; aa++) {
              const myIndex = mapTile.playerShips[aa];
              curShip.personalUnits.push({ myType: 0, index: curRoom.playerShips[myIndex].num, x: x, y: y });
            }
          }
        }
      }
    }

    // TO DO: I think we need to subtract our own ship :p
    // Or, we could accept we'll always find ourselves, and just say "units found > 1"
    // This checks if we can fire or not (and sends the captain that task, if so)
    if(curShip.personalUnits.length > 0) {
      captainTasks.push([0,0])
      curShip.captainCanFire = true;
    } else {
      curShip.captainCanFire = false;
    }

    curShip.captainTasks = captainTasks;
  }

  // loop through all players
  for(let playerID in curRoom.players) {
    let curPlayer = curRoom.players[playerID]
    let curShip = curRoom.playerShips[curPlayer.myShip]

    let pPack = {}

    // if this is the first turn, send the basic info (ship title, flag)
    // Health isn't necessary (always starts at 100%)
    // Instrument level (before upgrades) isn't necessary (all instruments start at level 1)
    if(gameStart) {
      pPack["shipTitle"] = curShip.shipTitle;
      pPack["shipFlag"] = curShip.shipFlag;

      // if preparation was skipped, we need to resend the essential information
      if(curRoom.prepSkip) {
        pPack["myShip"] = curPlayer.myShip;
        pPack["myRoles"] = curPlayer.myRoles;
      }
    } else {
      // on every turn EXCEPT the first, all players receive ship health
      pPack["shipHealth"] = curShip.health;
    }

    // check this player's roles
    let rList = curPlayer.myRoles;
    for(var i = 0; i < rList.length; i++) {
      let role = rList[i];

      switch(role) {
        // Captain
        case 0:
          // replenish crew
          // REMEMBER: curShip.workingCrew is the total crew number 
          //   => curShip.resources only contains the current resources, with allocated stuff subtracted
          curShip.resources[1] = curShip.workingCrew;

          // (Basic) Ship resources (gold, crew, wood, gun powder)
          pPack["resources"] = curShip.resources;

          // List of current tasks
          pPack["taskList"] = curShip.captainTasks;

          // if we can fire, calculate the cost of firing
          if(curShip.captainCanFire) {
            // reduce function calculates the number of cannons (positive loads), multiplies by (half) the current weaponeer value
            let numCannons = curShip.cannons.reduce(function(tot, cur) { if(cur >= 0) { return tot + 1; } else { return tot; } }, 0)
            pPack["firingCosts"] = Math.round((curShip.roleStats[4].lvl + 1) / 2) * numCannons;
          }

          // if we can trade, send the dock deal
          if(curShip.captainCanTrade > -1) {
            pPack["dockDeal"] = curRoom.docks[curShip.captainCanTrade].deal;
          }
          
          break;

        // First Mate
        case 1:
          // Current ship orientation
          pPack["orientation"] = curShip.orientation;
          break;

        // Cartographer
        case 2:
          // Only at game start, send initial map information (like the seed and some drawings)
          if(gameStart) {
            pPack["mapSeed"] = curRoom.mapSeed;

            // send all drawings in advance (this includes our own ship's drawing)
            // TO DO: AI Ships drawings. (Right now, you can't draw your own AI ship, but that might change)
            pPack['monsterDrawings'] = curRoom.monsterDrawings;
            pPack['shipDrawings'] = curRoom.shipDrawings;
            pPack['aiShipDrawings'] = [];
          }

          // send the whole unit thing to the client (determined beforehand in the SHIP LOOP)
          // he saves it in mapUnits, should display it properly on his map
          pPack["mapUnits"] = curShip.personalUnits;

          // Send our own location
          // ?? This is also send along with the other units, BUT if we send it ourselves, we don't have to search for it!
          pPack["x"] = curShip.x;
          pPack["y"] = curShip.y;
          break;

        // Sailor
        case 3:
          // TO DO?? I think the sailor doesn't need to know anything extra
          // Perhaps, they could receive the previous setting on their sails, but doesn't feel really necessary
          break;

        // Weapon Specialist
        case 4:
          // Send the correct cannon load (just a number, negative means the cannon hasn't been bought yet)
          pPack["shipCannons"] = curShip.cannons;
          break;
      }

      // If this role was upgraded last turn, solidify the upgrade (this is true for ALL roles)
      // Send the new level back to the role
      if(curShip.roleStats[role].lvlUp) {
        pPack["roleUpdate"] = true;
        curShip.roleStats[role].lvlUp = false;
      }
    }

    // send the whole package
    sendSignal(room, false, 'pre-signal', pPack, true, true, playerID);

    // if it isn't the start of the game (which would INSTEAD mean a "state switch" to the Play state) ...
    if(!gameStart) {
      // ... tell everyone (both monitors and controllers) to start the new turn
      sendSignal(room, false, 'new-turn', {}, false, false)
      sendSignal(room, true, 'new-turn', {}, false, false)
    }
    
  }

}


/*

  This function takes care of finishing a turn
  @parameter room => the room in which a turn needs finishing
  
*/
function finishTurn(room) {
  console.log("Finishing turn in room " + room)
  let curRoom = rooms[room];

  /*** 

    FIGHT BATTLES

  ***/
  // Ships shoot cannonballs. They always fire everything at once.
  // We follow the cannonball along its path. 
  //  => If it hits something, it damages that thing, and then disappears. (If that is an AI ship, it might just fight back)
  //  => Otherwise, if it hits the end of its range, it just disappears
  //
  // NOTE: Islands do not count. Docks do count.
  // NOTE: Yes, this is a separate loop from the next one. All units battle FIRST, then MOVE.
  for(let i = 0; i < curRoom.playerShips.length; i++) {
    let curShip = curRoom.playerShips[i];

    // if this ship doesn't fire, well, there's no battle here
    if(!curShip.willFire) {
      continue;
    }

    let ammo = curShip.cannons;

    // Set range based on level
    let weaponLvl = curShip.roleStats[4].lvl;
    let range = 4, spread = 3;
    switch(weaponLvl) {
      case 0:
        range = 1;
        spread = 0;
        break

      case 1:
        range = 2
        spread = 0
        break

      case 2:
        range = 2
        spread = 1
        break

      case 3:
        range = 3
        spread = 1
        break

      case 4:
        range = 3
        spread = 2
        break

    }

    // establish the ship angle
    // shooting directions are based on that
    let baseAngle = curShip.orientation * 45;

    // go through all the cannons
    for(let c = 0; c < 4; c++) {
      // if no load, or cannon isn't even purchased, continue immediately
      const curAmmo = ammo[c];
      if(curAmmo <= 0) {
        continue;
      }

      // increase angle (each cannon represents a different side, 90 degrees rotated towards the previous)
      const angle = (baseAngle + c*90) * Math.PI / 180;
      let directionVector = [Math.round( Math.cos(angle) ), Math.round( Math.sin(angle) )];
      let perpendicularVector = [directionVector[1], -directionVector[0]]

      // otherwise, go through all the bullets
      // QUESTION: Does a bullet hit EVERYTHING on a certain tile? Or just one random unit (if there are multiple)?
      for(let b = 0; b < curAmmo; b++) {
        // determine starting position: a cannon with spread has multiple possibilites
        let tempSpread = Math.round( Math.random()*spread*2 - spread);
        let tempX = curShip.x + tempSpread * perpendicularVector[0];
        let tempY = curShip.y + tempSpread * perpendicularVector[1];
        
        // bS stands for "bullet steps", not what you think it might mean
        for(let bS = 0; bS < range; bS++) {
          tempX += directionVector[0];
          tempY += directionVector[1];

          if(tempX < 0) { tempX += curRoom.mapWidth } else if(tempX >= curRoom.mapWidth) { tempX -= curRoom.mapWidth }
          if(tempY < 0) { tempY += curRoom.mapHeight } else if(tempY >= curRoom.mapHeight) { tempY -= curRoom.mapHeight }

          let tile = curRoom.map[tempY][tempX];

          // if this tile has no units, nothing to do!
          if(!tile.hasUnits) {
            continue;

          // if it's a dock, stop the bullet immediately
          } else if(hasDock(tile)) {
            break;

          // if we're still here, this means there is something to hit
          // hit it, then break out of the loop (the bullet is finished)
          } else {
            for(let i = 0; i < tile.monsters.length; i++) {
              dealDamage(tile.monsters[i], 10);

              // TO DO: Receive reward
              // TO DO: Send message with succesful attack??
            }

            for(let i = 0; i < tile.aiShips.length; i++) {
              dealDamage(tile.aiShips[i], 10);

              // TO DO: Receive reward
              // TO DO: Send message with succesful attack??

              // TO DO: With a certain chance, the ai ship FIGHTS BACK
            }

            for(let i = 0; i < tile.playerShips.length; i++) {
              dealDamage(tile.playerShips[i], 10);

              // TO DO: Receive reward
              // TO DO: Send message with succesful attack??
            }
          } 
        }
      }

      // set ammo to zero
      curShip.cannons[c] = 0;
    }

  }

  /*** 

    LET MONSTERS FIGHT

  ***/
  // Attack the target, if we're close enough
  // TO DO (QUESTION): Do I still need to check everything in their vicinity? Meh, makes monsters more dangerous, but also unrealistic (you can't fight ten ships simultaneously)
  for(let i = 0; i < curRoom.monsters.length; i++) {
    const target = curRoom.monsters[i].target;
    if(target != null) {
      const dist = Math.abs(target.x - curRoom.monsters[i].x) + Math.abs(target.y - curRoom.monsters[i].y);

      // TO DO: Get attack range from monster object
      let attackRange = 6;
      if(dist <= attackRange) {
        dealDamage(target);
      }
    }
  }

  /*** 

    MOVE PLAYER SHIPS

  ***/
  let averageResources = [0,0,0,0]; // to keep track of average player resources, to know what docks should deal
  for(let i = 0; i < curRoom.playerShips.length; i++) {
    // get ship
    let curShip = curRoom.playerShips[i];

    // (update average resources)
    for(let res = 0; res < 4; res++) {
      averageResources += curShip.resources[res];
    }

    // get vector from orientation
    let angle = curShip.orientation * 45 * Math.PI / 180;

    // round everything non-zero upwards to a 1 
    // this ONLY works because we're working with 8 angles; diagonal angles still get rounded (to 1 or -1, depending on the angle)
    let movementVector = [Math.round( Math.cos(angle) ), Math.round( Math.sin(angle) )];

    let speed = curShip.roleStats[3].sailLvl + curShip.roleStats[3].peddleLvl*2;
    let oldObj = { x: curShip.x, y: curShip.y, index: i }
    let x = curShip.x, y = curShip.y;

    // move through it stepwise
    for(let a = 0; a < speed; a++) {
      let tempX = x + movementVector[0];
      let tempY = y + movementVector[1];

      let tile = curRoom.map[tempY][tempX];

      // check if the next tile (we want to go to) is reachable
      // NOT REACHABLE if: an island or a dock
      if(isIsland(tile) || hasDock(tile)) {
        dealDamage(curShip, 10)

        // TO DO: Inform captain of damage

        break;

      // if it's reachable, then we just update the position and move to the next step
      } else {
        x = tempX;
        y = tempY;
      }
    }

    // move the unit to the final location
    placeUnit(curRoom, oldObj, x, y, 'playerShips');
  }

  /*** 

    MOVE AI SHIPS

  ***/
  // Just follow their predetermined route
  for(let i = 0; i < curRoom.aiShips.length; i++) {
    // get the SHIP
    let s = curRoom.aiShips[i];

    // TO DO
    // Get ship properties (like speed) from the ai ship object
    let shipSpeed = 3;

    // get the route object (contains the actual route ("route") and the dock where the route ends ("target"))
    let routeObject = curRoom.docks[ s.routeIndex[0] ].routes[ s.routeIndex[1] ];

    //increase pointer by ship speed
    s.routePointer = Math.min(routeObject.route.length - 1, s.routePointer + 3);

    // move to next spot
    let nextSpot = routeObject.route[s.routePointer]

    // IMPORTANT: Use the placeUnit function! Otherwise it doesn't update the map (correctly)
    placeUnit(curRoom, { x: s.x, y: s.y, index: i}, nextSpot[0], nextSpot[1], 'aiShips');

    // if we're at the end, pick a new route
    if(s.routePointer == (routeObject.route.length - 1)) {
      let newDock = curRoom.docks[ routeObject.target ];
      let routeIndex = Math.floor( Math.random() * newDock.routes.length );

      // Save the dock we're coming form (which was previously our target) and which of its routes we're taking
      s.routeIndex = [routeObject.target, routeIndex]
      s.routePointer = -1;
    }
  }

  /*** 

    MOVE MONSTERS

  // NOTE: They move AFTER the player ships, as monsters can then succesfully CHASE them.
  ***/
  

  // For each monster ...
  for(let i = 0; i < curRoom.monsters.length; i++) {
    let curMon = curRoom.monsters[i];
    // Loop through their sight radius to pick a target
    // We use a SPIRAL, starting from the right hand of the monster. (TO DO: Maybe give monsters orientation as well, start the spiral from there)
    // Just pick the first one we can find (which should automatically be within the sight distance)

    // TO DO: Get these from the monster object
    let sightRadius = 6;
    let chaseSpeed = 3;

    let targetPos;

    // if we've chased for long enough, let go
    // TO DO: Do we always let go? Or only after we've destroyed the ship/stolen what we needed?
    if(curMon.chasingCounter >= 4) {
      curMon.chasingCounter = 0;
      curMon.chasing = false;
      curMon.target = null;
    }

    /***

      PICK A TARGET

    ***/
    let bestDeepSeaTile = null;
    let bestRemainingTile = null;

    if(curMon.target == null) {
      // (di, dj) is a vector - direction in which we move right now
      let curDir = [1,0]
      // length of current segment
      let segLength = 1;

      // with sight radius of "X", the number of sight points would be X*X-1 
      let numberOfSightPoints = sightRadius*sightRadius - 1;

      // current position (x,y) and how much of current segment we passed
      let tempX = curMon.x;
      let tempY = curMon.y;
      let segPassed = 0;
      for (let n = 0; n < numberOfSightPoints; n++) {
          // make a step, add 'direction' vector to current position
          tempX += curDir[0];
          tempY += curDir[1];

          if(tempX < 0) { tempX += curRoom.mapWidth } else if(tempX >= curRoom.mapWidth) { tempX -= curRoom.mapWidth }
          if(tempY < 0) { tempY += curRoom.mapHeight } else if(tempY >= curRoom.mapHeight) { tempY -= curRoom.mapHeight }
          
          // here we actually check if there's something of value
          let curTile = curRoom.map[tempY][tempX];

          // if we're one tile away, already find possible tiles
          if(n < 8) {
            if(curTile.val <= -0.3) {
              if(bestDeepSeaTile == null || Math.random() >= 0.5) {
                bestDeepSeaTile = [tempX, tempY]
              }
            } else if(curTile.val < 0.2) {
              if(bestRemainingTile == null || Math.random() >= 0.5) {
                bestRemainingTile = [tempX, tempY]
              }
            }
          }

          // if this tile has units, pick the first one we like!
          // It always picks player ships first. Then docks (with a chance of failure). Then ai ships (with a chance of failure)
          if(curTile.hasUnits) {
            if(curTile.playerShips.length > 0) {
              curMon.target = curTile.playerShips[ Math.floor(Math.random() * curTile.playerShips.length) ];
            } else if(curTile.dock != null && Math.random() >= 0.5) {
              curMon.target = curTile.dock
            } else if(curTile.aiShips.length > 0 && Math.random() >= 0.5) {
              curMon.target = curTile.aiShips[ Math.floor(Math.random() * curTile.aiShips.length) ];
            }
          }

          // this code is for switching to the next tile again.
          // this is responsible for rotating to a new segment (and increasing length) once this one's finished
          segPassed++;
          if (segPassed == segLength) {
              // done with current segment
              segPassed = 0;

              // 'rotate' directions
              curDir = [-curDir[1], curDir[0]]

              // increase segment length if necessary
              if (curDir[1] == 0) {
                  segLength++;
              }
          }
      }
    }

    /***

      MOVE TOWARDS TARGET

    ***/
    // if we have a target, keep pursuing it
    if(curMon.target != null) {
      curMon.chasingCounter++;
      targetPos = [curMon.target.x, curMon.target.y];

      // if we're already at our target, no need to calculate the route again!
      if((targetPos[0] == curMon.x && targetPos[1] == curMon.y)) {
        // nothing
      } else {
        // calculate a route to this position
        let tempRoute = calculateRoute(curRoom, [curMon.x, curMon.y], targetPos)

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
      }

    // if there's no target, pick the best tile around us 
    } else {
      targetPos = bestDeepSeaTile;

      // if there IS no deep sea tile, choose the best remaining tile
      // alternatively, there's a slight (10%) chance of going out of the deep sea.
      if(targetPos == null || Math.random() >= 0.9) { targetPos = bestRemainingTile; }
    }


    // check one last time that we have a position to go to
    if(targetPos != null || targetPos.length > 0) { 
      // Use the placeUnit function to move the unit across the map, as close as possible towards the target position
      placeUnit(curRoom, {x: curMon.x, y: curMon.y, index: i}, targetPos[0], targetPos[1], 'monsters');
    }
  }

  /*** 

    CHANGE DOCK DEALS

  ***/
  let changeDeals = (Math.random() <= 0.2); // on average, change deals every ~5 turns

  // With X% probability, change the deals on the docks
  // Use the "averageResources" variable to get a random deal, then improve it (by lowering one and raising the other - no negative numbers)
  // Scale the result based on dock size
  if(changeDeals) {
    for(let d = 0; d < curRoom.docks.length; d++) {
      let good1 = Math.floor(Math.random() * 4)
      let good2 = Math.floor(Math.random() * 4)

      // TO DO (QUESTION): Is this a good concept?
      if(good1 == 1) { good1 = 0; } // you cannot trade away your crew, instead it ensures more deals start with you spending gold

      let val1 = Math.max( averageResources[good1] - Math.random()*3, 0);
      let val2 = averageResources[good2] + Math.random()*3
      const maxVal = Math.max(val1, val2);

      // this formula is similar to how we determine how many routes each dock gets
      // the larger the dock, the more I want to "compress" its size with a square root (or similar function)
      const dockSize = Math.sqrt(curRoom.docks[d].size)*0.5;
      val1 = val1 / maxVal * dockSize;
      val2 = val2 / maxVal * dockSize;

      // this is the final deal, with the right goods and correctly scaled values
      const finalDeal = [[good1, val1], [good2, val2]];

      // save the deal on the dock
      curRoom.docks[d].deal = finalDeal

      // TO DO: Update monitors (not necessary right now)
    }
  }

  // Start next turn
  startTurn(room)
}

/* 
  This function creates a new SHIP (object)

  Each ship object has:
  => index number (determines color, makes referencing easier)
  => list of players
  => coordinates (tile => x,y)
  => orientation (number from 0 to 7; 0 is pointing to the right)
  => resources (gold, crew, wood, guns)
  => health 
  => roleStats (the level of each role's instrument)
  => cannons (the load of cannons; negative indicates the cannon hasn't been bought yet)
 */
function createShip(index) {

  return {
    num: index,
    myUnitType: 0, 
    players: [], 
    resources: [10, 0, 10, 10], // [5,1,1,0], 
    workingCrew: 10,
    x: 0, 
    y: 0, 
    orientation: 0, 
    health: 100, 
    roleStats: [
      { lvl: 0, lvlUp: false }, 
      { lvl: 0, lvlUp: false }, 
      { lvl: 0, lvlUp: false }, 
      { lvl: 0, lvlUp: false, sailLvl: 0, peddleLvl: 0 }, 
      { lvl: 0, lvlUp: false } ], 
    cannons: [2, -1, -1, -1]
  }

}

/*

  This function moves an object across the map
  
  First, it removes the object from its previous position. (If there is one.)
  Then, it adds the object into the new tile

  @parameter obj => the object
  @parameter x, y => the new (desired) map location
  @parameter uType => the type of unit (which determines where/how it's saved)

*/
function placeUnit(room, obj, x, y, uType) {
  // get the map (from this room)
  let map = room.map;

  // if this object has a position ...
  if(obj.x >= 0 && obj.y >= 0) {
    // ... remove it from that position
    let unitsList = map[obj.y][obj.x][uType];

    // search the units list, 
    // find one with the same INDEX (must be the same object; units of same type are stored in indexed array), 
    // splice it from the array
    for(let i = 0; i < unitsList.length; i++) {
      if(unitsList[i].index == obj.index) {
        unitsList.splice(i,1);
        break;
      }
    }

    // check if this tile has any units left
    let curTile = map[obj.y][obj.x];
    if(curTile.monsters.length < 1 && curTile.playerShips.length < 1 && curTile.aiShips.length < 1 && curTile.dock == null) {
      map[y][x].hasUnits = false;
    }
  }

  // now place it into its desired position
  // and remember this has at least one unit
  map[y][x][uType].push(obj.index);
  map[y][x].hasUnits = true;

  // get the ACTUAL object, update its position as well
  let fullObj = room[uType][obj.index];
  fullObj.x = x;
  fullObj.y = y;
}

/*

  This function creates the base map from 4D Perlin noise
  This just creates sea/islands (including deep sea and shores) and saves them in the map variable.

  These values will be added as objects, because each tile (during the game) also saves who/what is on it

*/
function createBaseMap(room) {
  // seed the noise object (with the mapSeed)
  noise.seed(room.mapSeed);

  // initialize some variables determining map size (and zoom level)
  let x1 = 0, y1 = 0, x2 = 10, y2 = 10
  let mapWidth = 60, mapHeight = 30;

  room.mapWidth = mapWidth;
  room.mapHeight = mapHeight;

  room.map = []; //initialize map variable (I almost forgot)

  // loop through all tiles, determine noise level, and save it
  for (let y = 0; y < mapHeight; y++) {
    room.map[y] = [];
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

      room.map[y][x] = { val: noise.perlin4(nx, ny, nz, nw), monsters: [], playerShips: [], aiShips: [] };
    }
  }
}

/*** == Begin of DISCOVERING and SAVING islands + docks == ***/

function discoverIslands(room) {
  room.islands = []; // initialize islands variable
  room.docks = []; // initialize docks variable

  for (let y = 0; y < room.mapHeight; y++) {
    for (let x = 0; x < room.mapWidth; x++) { 
      let curTile = room.map[y][x];

      // if this tile is an island, but hasn't been checked yet, let's start a new island!
      if(isIsland(curTile) && !isChecked(curTile)) {

        // create new island (with unknown name, and no free spots/dock known)
        let islandIndex = room.islands.length;
        room.islands.push( { name: 'Undiscovered Island', freeSpots: [], discovered: false } );

        // explore this tile (which automatically leads to the whole island)
        exploreTile(room, curTile, x, y, islandIndex)

        // pick random spot for a dock
        // get the amount of free spots => indicator of island size => determines dock size
        let islandSize = room.islands[islandIndex].freeSpots.length;
        let randDock = room.islands[islandIndex].freeSpots[ Math.floor(Math.random() * islandSize)]

        // create new DOCK OBJECT
        // deals are random (there's no information about what might be useful)
        // TO DO: Scale these and find SOME heuristic for generating nice dock deals at the start
        let good1 = Math.floor(Math.random()*4), good2 = Math.floor(Math.random()*4), val1 = Math.round(Math.random()*5), val2 = Math.round(Math.random()*5);

        room.docks.push( { x: randDock.x, y: randDock.y, size: islandSize, deal: [[good1, val1], [good2, val2]], myUnitType: 3 } );

        // add this object into the map (only by index)
        room.map[randDock.y][randDock.x].dock = (room.docks.length - 1);
      }
    }
  }
}

function isIsland(obj) {
  return obj.val >= 0.2;
}

function hasDock(obj) {
  return (obj.dock != undefined && obj.dock != null);
}

function isChecked(obj) {
  return (obj.checked == true);
}

function exploreTile(room, tile, x, y, islandIndex) {
  // add this tile to the island
  tile.island = islandIndex;

  // mark this tile as checked
  tile.checked = true;

  // check tiles left/right/top/bottom
  // TO DO: We don't check diagonally now. Should we?
  const positions = [[-1,0],[1,0],[0,1],[0,-1]]
  let freeTiles = []

  for(let a = 0; a < 4; a++) {
    let tempX = x + positions[a][0];
    let tempY = y + positions[a][1];

    // the map is seemless => top stitches to the bottom, left stitches to the right
    if(tempX < 0) { tempX += room.mapWidth; } else if(tempX >= room.mapWidth) { tempX -= room.mapWidth;}
    if(tempY < 0) { tempY += room.mapHeight; } else if(tempY >= room.mapHeight) { tempY -= room.mapHeight;}

    const newTile = room.map[tempY][tempX];
    // if tile is an island, and hasn't been checked, explore it!
    if(isIsland(newTile)) {
      if(!isChecked(newTile)) {
        exploreTile(room, newTile, tempX, tempY, islandIndex)
      }
    } else {
      // if this tile is not an island (a free tile, water), save it
      freeTiles.push({ x: tempX, y: tempY });
    }
  }

  // If there's at least one non-land tile, this tile should be on the edge of the island
  if(freeTiles.length > 0) {
    // Pick one of the free spots, add it to the possible docks
    let randFreeSpot = freeTiles[ Math.floor(Math.random() * freeTiles.length) ];

    room.islands[islandIndex].freeSpots.push( randFreeSpot )
  }
}

/*** == END of island code == ***/


/*** == BEGIN of creating the ROUTES between docks on the map + placing an AI ship next to them == ***/
function createDockRoutes(room) {
  let numDocks = room.docks.length;
  let connectionArray = [];

  room.aiShips = [];

  // the "connection array" contains whether two docks are connected or not
  // this way, we don't need to search through all the docks all the time, we just check this array to see if there's a connection
  for(let i = 0; i < numDocks; i++) {
    // create an array filled with "false" values
    connectionArray[i] = Array(numDocks).fill(false);

    // we DO have a connection to ourselves
    connectionArray[i][i] = true; 

    // initialize routes property for this dock (used in the next loop)
    room.docks[i].routes = [];
  }

  for(let i = 0; i < numDocks; i++) {
    let curNumRoutes = room.docks[i].routes.length; // routes we already received from other docks
    let maxRoutesHarbor = Math.round( Math.sqrt(room.docks[i].size)*0.25 )// max routes our harbor can/should handle

    let maxRoutes = Math.min(room.docks.length - 1, maxRoutesHarbor); // max routes we would be able to find, in TOTAL, across the whole map
    let routesToDo = 0;

    if(curNumRoutes < maxRoutes) {
      routesToDo = maxRoutes - curNumRoutes;
    }

    while(routesToDo > 0) {
      // pick a random dock
      let j = Math.floor( Math.random() * room.docks.length) ;

      // if there's already a connection, continue immediately
      if(connectionArray[i][j]) {
        continue;
      } else {
        // otherwise, make the connection!
        let startPos = [room.docks[i].x, room.docks[i].y];
        let endPos = [room.docks[j].x, room.docks[j].y];

        let route = calculateRoute(room, startPos, endPos)

        // shave first and last bit from the route
        route.splice(0, 1);
        route.splice( (route.length-1) , 1);

        // save it on both docks (but in REVERSE on the second)
        room.docks[i].routes.push( { route: route, target: j } );
        room.docks[j].routes.push( { route: route.slice().reverse(), target: i } );

        // save both connections in the connection Array
        connectionArray[i][j] = true;
        connectionArray[j][i] = true;

        // we've finished one route!
        routesToDo--;
      }
    }

    // if this dock has routes, place an AI ship on each of them
    let numRoutes = room.docks[i].routes.length;
    if(numRoutes > 0) {
      for(let r = 0; r < numRoutes; r++) {
        let randRoute = room.docks[i].routes[r].route[0]; // immediately fetch the first (0 index) step of the route

        // save the dock and route index where you started
        // this is used to follow the route

        // TO DO: Give the ship some more properties (outside of its position and route)
        // This creates a new AI SHIP OBJECT (create function for this?)
        room.aiShips.push( createAIShip(randRoute, [i,r])  );

        // also place the AI ship on the map
        placeUnit(room, { x: -1, y: -1, index: (room.aiShips.length-1) }, randRoute[0], randRoute[1], 'aiShips');
      }

    }
    
  }
}

function createAIShip(route, routeIndex) {
  return { 
    myUnitType: 2,
    x: route[0], 
    y: route[1], 
    routeIndex: routeIndex, 
    routePointer: 0,
    myShipType:0 }
}

function calculateRoute(room, start, end) {
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
    const positions = [[-1,0],[1,0],[0,1],[0,-1]];
    for(let a = 0; a < 4; a++) {
      let tempX = current[0] + positions[a][0];
      let tempY = current[1] + positions[a][1];

      if(tempX < 0) { tempX += room.mapWidth; } else if(tempX >= room.mapWidth) { tempX -= room.mapWidth; }
      if(tempY < 0) { tempY += room.mapHeight; } else if(tempY >= room.mapHeight) { tempY -= room.mapHeight;}

      // don't consider tiles that aren't sea
      if(isIsland(room.map[tempY][tempX].val >= 0.2)) {
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
        if(dX > 0.5*room.mapWidth) { dX = (room.mapWidth - dX) }

        let dY = Math.abs(tempY - end[1]);
        if(dY > 0.5*room.mapHeight) { dY = (room.mapHeight - dY) }

        // 2) Shallow water has a higher cost than deep water
        
        let heuristic = (dX + dY) + room.map[tempY][tempX].val*20;

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
  // TO DO: It doesn't throw the route away or anything, might be dangerous. Write exception for this?
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
}

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

/*** == END of trading routes (and AI ship placement) code == ***/

/*** == BEGIN of monster creation code == ***/
function createSeaMonsters(room) {
  const numMonsters = 10;
  room.monsters = [];

  for(let i = 0; i < numMonsters; i++) {
    let randomMonsterType = Math.floor( Math.random() * room.monsterTypes.length );
    let newMon = createMonster(randomMonsterType, i);

    room.monsters.push( newMon );
  }
}

/*

  This function creates a new MONSTER (object)

  Each monster has the following properties:
    => INDEX (within the monster array)
    => NAME
    => COORDINATES (x and y)
    => LEVEL
    => DNA

  The level ranges from 0 up to (and including) 4. With each level, all stats of the monster increase.

  The dna determines the "specialization" (or "type") of the monster. It controls these statistics:
    => Attack
    => Attack range
    => Health
    => Speed (movement)
    => Loot (size)

  If the dna has a 0 for a certain value, it gets the minimum value (for the level).
  If it has a 1, it has talent for this, and gets a buff for this property.

*/
function createMonster(myType, index) {
  // TO DO: Stats are differentiated, once in combat, based on the monster LEVEL and DNA (or "fingerprint")

  // create dna
  // NOTE: Right now, points are distributed equally. No property has more than 1, or less than 0.
  // In the future, I might allow more extreme distributions like [3,0,0,0,0]
  let pointsLeft = 3;
  let dna = [0,0,0,0,0];
  while(pointsLeft > 0) {
    // pick random part of the dna
    let rDna = Math.floor(Math.random() * dna.length);

    // if that part hasn't been improved yet, improve it
    if(dna[rDna] == 0) {
      dna[rDna]++;
      pointsLeft--;
    }
  }

  return {
    myMonsterType: myType,
    myUnitType: 1,
    index: index,
    x: 0,
    y: 0,
    level: Math.round(Math.random() * 4), // generates a random level for this monster
    dna: dna,
    chasing: false,
    target: null,
    chasingCounter: 0,
  }
}

/*** == END of monster creation code == ***/

/*** == BEGIN of distribution code == ***/
function distributeStartingUnits(room) {
  // determine amount of blocks needed
  const numMonsters = room.monsters.length;
  const numPlayers = room.playerShips.length;
  const totalBlocks = numMonsters + numPlayers;

  // the ratio must be 3:1 (x to y), so, after solving the equality, this formula follows
  let blocksX = Math.sqrt(3 * totalBlocks);
  let blocksY = 1/3 * blocksX;

  // when rounding, we might get a number too far below or above the right one
  // that's why we need to check how low we can go
  blocksX = Math.ceil(blocksX);
  blocksY = Math.ceil(blocksY);

  if(blocksX*(blocksY-1) >= totalBlocks) {
    blocksY--;
  } else if((blocksX-1)*blocksY >= totalBlocks) {
    blocksX--;
  }

  // populate block array
  let blockArr = [];
  for(let i = 0; i < blocksX; i++) {
    for(let j = 0; j < blocksY; j++) {
      blockArr.push({ x: i, y: j });
    }
  }

  // place monsters AND ships
  for(let i = 0; i < totalBlocks; i++) {
    // monsters only spawn in sea that is deep enough
    // so keep trying, until we found a position
    const randIndex = Math.floor(Math.random() * blockArr.length);
    const randomBlock = blockArr.splice(randIndex, 1)[0];
    const maxTries = 10;
    let numTries = 0;

    // we have a maximum of 10 tries. 
    // If we haven't found a spot then, there's probably (almost) no correct spot within this sector
    let rX, rY;
    do {
      rX = Math.floor( (randomBlock.x + Math.random()) * (room.mapWidth / blocksX) );
      rY = Math.floor( (randomBlock.y + Math.random()) * (room.mapHeight / blocksY) );

      numTries++;
    } while (room.map[rY][rX].val >= -0.2 && numTries <= maxTries);

    // If we've exceeded our tries, just pick a random spot on the MAP, not within our own sector
    // This should always succeed, even if it takes 50 or 100 tries, and is reasonably fast
    if(numTries > maxTries) {
      do {
        rX = Math.floor( Math.random() * room.mapWidth );
        rY = Math.floor( Math.random() * room.mapHeight );
      } while (room.map[rY][rX].val >= -0.2);
    }

    // if it's a monster, place the unit in the monsters array of a tile (and get the right index)
    if(i < numMonsters) {
      const index = i;
      placeUnit(room, { x: -1, y: -1, index: index }, rX, rY, 'monsters');

    // if it's a playership, place it into the ships array of a tile (and get the right index)
    } else {
      const index = i - numMonsters;
      placeUnit(room, { x: -1, y: -1, index: index }, rX, rY, 'playerShips');
    }

  }
}
