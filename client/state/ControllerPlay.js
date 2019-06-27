import { serverInfo } from './sockets/serverInfo'
import { playerColors } from './utils/colors'
import loadMainSockets from './sockets/mainSocketsController'
import loadRejoinRoom from './sockets/rejoinRoomModule'

import { ROLE_DICTIONARY } from './utils/roleDictionary'
import { ROLE_HELP_TEXT } from './utils/roleHelpText'
import LOAD_TAB from './utils/loadTab'

import { controllerTimer } from './utils/timers'

import LOAD_ERROR_MESSAGE from './interfaces/loadErrorMessage'

class ControllerWaiting extends Phaser.State {
  constructor () {
    super()
    // construct stuff here, if needed
  }

  preload () {
    // load stuff here, if needed

    // if this player has the cartographer role, preload drawings
    // includes backups for when preparation is skipped
    if(serverInfo.myRoles.includes(2)) {
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
  }
  
  create () {    
    let gm = this.game
    let socket = serverInfo.socket

    let curTab = { num: 0 }

    let div = document.getElementById("main-controller")
    let ths = this; // for referencing the original "this" object within eventListeners

    /**** 

      DO SOME EXTRA INITIALIZATION 

    *****/
    // TO DO: This could be much simpler. No need to go through all the roles; just initialize everything to zero.
    // loop through all the roles
    let roles = serverInfo.myRoles;
    serverInfo.roleStats = [ { lvl: 0 }, { lvl: 0 }, { lvl: 0 }, { lvl: 0}, { lvl: 0} ];
    for(let i = 0; i < roles.length; i++) {
      let roleNum = roles[i];
      switch(roleNum) {
        // Captain needs to listen to resource changes
        case 0:
          // res-up => resource update
          socket.on('res-up', data => {
            // save the received resources
            serverInfo.resources = data;

            // if the captain tab is currently displaying, update it
            if(curTab.num == 0) {
              for(let i = 0; i < data.length; i++) {
                document.getElementById('shipResource'+i).innerHTML = data[i];
              }
            }
          });

          // error-msg => error message (because another crew member screwed up)
          socket.on('error-msg', msg => {
            serverInfo.errorMessages.push(msg);

            // if the captain tab is currently displaying, update it with the new error
            if(curTab.num == 0) {
              document.getElementById('tab0').appendChild( LOAD_ERROR_MESSAGE(msg, (serverInfo.errorMessages.length - 1)) );
            }
          })

          break;

        // First mate
        // Set compass level to 0; set (and save) orientation
        case 1:
          serverInfo.roleStats[1].lvl = 0;

          serverInfo.oldOrientation = 0;
          serverInfo.orientation = 0;

          break;

        // Cartographer
        // Set map/telescope level to 0
        case 2:
          serverInfo.roleStats[2].lvl = 0;

          break;

        // Sailor
        // Set instrument level to 0
        case 3:
          serverInfo.roleStats[3].lvl = 0;
          serverInfo.roleStats[3].sailLvl = 0;
          serverInfo.roleStats[3].peddleLvl = 0;

          serverInfo.roleStats[3].oldSailLvl = 0;
          serverInfo.roleStats[3].oldPeddleLvl = 0;

          serverInfo.speed = 0;
          serverInfo.oldSpeed = 0;

          break;

        // Cannoneer
        // Set cannon level to 0
        case 4:
          serverInfo.roleStats[4].lvl = 0;

          // Also, create variable that checks if cannon has already been loaded
          serverInfo.roleStats[4].cannonsLoaded = {};

          break;
      }
    }

    /**** 

      DISPLAY INTERFACE 

    *****/

    // Add the "help" overlay (and event listener to close it)
    let helpOverlay = document.createElement("div")
    helpOverlay.classList.add("helpOverlay")

    helpOverlay.addEventListener('click', function(ev) {
      helpOverlay.style.display = 'none';
    }, false)

    div.appendChild(helpOverlay);

    // Add the health bar at the top
    let healthBar = document.createElement("div");
    healthBar.id = "healthBar";
    healthBar.classList.add('shipColor' + serverInfo.myShip); // set bar to the right color
    div.appendChild(healthBar);

    // Add the ship info (name + flag)
    let shipInfo = document.createElement("div");
    shipInfo.id = 'shipInfo';
    shipInfo.innerHTML = '<img src="' + serverInfo.shipFlag + '" />' + serverInfo.shipTitle;
    shipInfo.classList.add('shipColor' + serverInfo.myShip); // set font to the right color
    div.appendChild(shipInfo);

    // Add the help button (which will trigger the helpOverlay)
    let helpButton = document.createElement("div");
    helpButton.innerHTML = '?'
    helpButton.classList.add('helpButton');

    // On clicking the help button, an overlay appears with help text
    helpButton.addEventListener('click', function() {
      // make overlay visible
      helpOverlay.style.display = 'block'

      // fill it with the right text (based on current role tab)
      helpOverlay.innerHTML = ROLE_HELP_TEXT[curTab.num]

      // the overlay itself has an event listener for closing it
    }, false);

    div.appendChild(helpButton)

    // Add the tabs for switching roles
    // first create the container
    let shipRoles = document.createElement("div");
    shipRoles.id = 'shipRoles';

    // then add the roles
    //let roles = serverInfo.myRoles;
    for(let i = 0; i < roles.length; i++) {
      let roleNum = roles[i];

      // create a new tab object (with correct/unique label and z-index)
      let newTab = document.createElement("span");
      newTab.classList.add("shipRoleGroup");
      newTab.id = 'label'+i;
      newTab.style.zIndex = (5-i);

      // add the ICON and the ROLE NAME within the tab
      newTab.innerHTML = '<img src="assets/roleIcon' + roleNum + '.png"/><span class="shipRoleTitle">' + ROLE_DICTIONARY[roleNum] + '</span>';

      // when you click this tab, unload the previous tab, and load the new one!
      // REMEMBER: "this" is the object associated with the event listener, "ev.target" is the thing that was actually clicked
      newTab.addEventListener('click', function(ev) {
        ev.preventDefault(); 
        LOAD_TAB(this.id, curTab, 1);
      })

      shipRoles.appendChild(newTab);
    }

    // finally, add the whole thing to the page
    div.appendChild(shipRoles);

    // add the area for the role interface
    let shipInterface = document.createElement("div");
    shipInterface.id = 'shipInterface';
    div.appendChild(shipInterface);

    // automatically load the first role 
    // (by calling LOAD_TAB with value 0; third parameter loads play interface instead of prep interface)
    LOAD_TAB("label0", curTab, 1)

    // The first turn is always twice as long!
    this.timer = serverInfo.timer*2

    loadMainSockets(socket, gm, serverInfo)

    console.log("Controller Play state");

    /**** 

      LISTEN FOR "NEW TURN" SIGNALS

    *****/

    // Function that is called whenever a new turn starts
    // Resets timer, cleans interface variables, reloads first tab
    // This is called AFTER the pre-signal that sets all sorts of information
    socket.on('new-turn', data => {
      console.log("New turn => resetting timer to " + serverInfo.timer);

      // reset the timer (if you're the VIP)
      if(serverInfo.vip) {
        ths.timer = serverInfo.timer
      }

      // clean interface variables
      // errorMessages are "cleaned" by the server sending a new array, which might be empty
      serverInfo.submittedUpgrade = {}
      serverInfo.roleStats[4].cannonsLoaded = {};

      // save orientation, so you can play with it without the ghost ship changing
      serverInfo.oldOrientation = serverInfo.orientation

      serverInfo.oldSpeed = serverInfo.speed
      serverInfo.oldSailLvl = serverInfo.roleStats[3].sailLvl;
      serverInfo.oldPeddleLvl = serverInfo.roleStats[3].peddleLvl;

      // update ship health
      document.getElementById('healthBar').style.width = serverInfo.health + '%';

      // switch to day/night if necessary
      serverInfo.turnCount++;
      if(serverInfo.turnCount % 10 == 0) {
        serverInfo.dayTime = !serverInfo.dayTime;

        // TO DO
        // Do something with the fact that it's now night?
      }

      // reload first tab
      LOAD_TAB("label0", curTab, 1)
    })

  }

  update () {
    // Update timer
    controllerTimer(this, serverInfo)
  }
}

export default ControllerWaiting
