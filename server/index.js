'use strict'
const http = require('http')
const app = require('./config')
const Server = http.Server(app)
const PORT = process.env.PORT || 8000
const io = require('socket.io')(Server, {origins: "*:*"})

Server.listen(PORT, () => console.log('Game server running on:', PORT))

// this variable will hold all current game rooms (and thus all games that are currently being played)
const rooms = {}

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
      prepSkip: true,
      
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
   * This signal is received when a player finishes the preparation for a certain role
   *
   */
  socket.on('submit-preparation', state => {
    // The info submitted depends on the role (captain does title and ship, for example)
    // ... but it's ALWAYS an object 
    let room = socket.mainRoom
    let curPlayer = rooms[room].players[socket.id]

    // Find the corresponding SHIP 
    let curShip = curPlayer.myShip;

    // ... sets the right values on this ship
    for(var key in state) {
      // if it's a resource ... add it!
      if(key.substring(0,3) == 'res') {
        let i = parseInt( key.substring(3,4) ); // which resource? numerical index
        rooms[room].playerShips[curShip].resources[i] += parseInt( state[key] );

      // otherwise, just copy the VALUE directly to the ship, and put it on index KEY
      } else {
       rooms[room].playerShips[curShip][key] = state[key];
      }     
    }

    // ... and saves preparation progress
    rooms[room].prepProgress++;
    let tempProgress = rooms[room].prepProgress;

    // if everyone has submitted their preparation, start the game immediately!
    // preparation needed = number of ships * number of roles per ship
    let prepNeeded = rooms[room].playerShips.length * 5;

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
      curRoom.players[player].done = false
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
        timer = 120;
        break;

      // If the next state is the game over (aka "end of round") state ...
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

  if(numberBoats < 2) {
    numberBoats = 2;
  }

  if(num == 1) {
    numberBoats = 1;
  }

  /* 
    Create a ship object for each ship
    Each ship object has:
    => index number (determines color, makes referencing easier)
    => list of players
    => coordinates (tile => x,y)
    => orientation (number from 0 to 7; 0 is pointing to the right)
    => resources (gold, crew, wood, guns)
    => health 
   */
  room.playerShips = [];
  for(let i = 0; i < numberBoats; i++) {
    room.playerShips.push({ num: i, players: [], resources: [10,2,5,0], x: 0, y: 0, orientation: 0, health: 100 });
  }

  // now we loop over it and determine player distribution
  let curBoat = 0;
  const keys = Object.keys(room.players)
  for (const key of keys) {
    // add this player to the current boat
    room.playerShips[curBoat].players.push(key);

    // also inform the player this is his boat
    room.players[key].myShip = curBoat;

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


      room.players[tempKey].myRoles.push(fullRoleList.splice(0,1)[0]);

      curPlayer = (curPlayer + 1) % playersOnShip;
    }
  }

  console.log(room.playerShips);
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

  Only information that has _CHANGED_ is sent. 
  
  */

  // variable that will hold the monitor package (thus mPack)
  let mPack = {}

  // at game start, we need to send initial information
  //  => seed of the map
  //  => locations/deals on docks (island groups only need to be saved on server)
  //  => locations of all units
  //  => overview of players and their ships (+ titles/flags)

  // TO DO
  if(gameStart) {
    mPack["mapSeed"] = curRoom.mapSeed;
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
          // (Basic) Ship resources (gold, crew, wood, gun powder)
          pPack["resources"] = curShip.resources;

          // List of current tasks
          pPack["taskList"] = [[0, 0], [1, 5], [2, 7]];
          break;

        // First Mate
        case 1:
          // Current ship orientation
          pPack["orientation"] = curShip.orientation;

          break;

        // Cartographer
        case 2:
          // Map seed and other static info is already known
          // TO DO: Check units in vicinity, send them to him
          pPack["mapSeed"] = curRoom.mapSeed; // TO DO: Map seed shouldn't be send every turn, should only be send once at the start

          // Send our own location (?? or is this sent along with the other units?)
          pPack["x"] = curShip.x;
          pPack["y"] = curShip.y;

          break;

        // Sailor
        case 3:
          // TO DO?? I think the sailor doesn't need to know anything extra

          break;

        // Weapon Specialist
        case 4:
          // Amount of cannons and their level are already known (by sending a negative number, we indicate a cannon does not exist yet?)
          // TO DO: Cannon load
          pPack["shipCannons"] = [ { load: 2, level: 0 }, { load: -1, level: 0 }, { load: -1, level: 0 }, { load: -1, level: 0 } ];

          break;
      }
    }

    // send the whole package
    sendSignal(room, false, 'pre-signal', pPack, true, true, playerID);
  }

}


/*

  This function takes care of finishing a turn
  @parameter room => the room in which a turn needs finishing
  
*/
function finishTurn(room) {
  console.log("Finishing turn in room " + room)

  // Fight battles

  // Move ships

  // Solidify upgrades (to instruments)

  // Replenish crew

  // With X% probability, change the deals on the docks

  // Start next turn
  startTurn(room)
}