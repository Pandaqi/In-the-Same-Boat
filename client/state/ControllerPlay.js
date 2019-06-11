import { serverInfo } from './sockets/serverInfo'
import { playerColors } from './utils/colors'
import loadMainSockets from './sockets/mainSocketsController'
import loadRejoinRoom from './sockets/rejoinRoomModule'

import { ROLE_DICTIONARY } from './utils/roleDictionary'
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
  }

  create () {    
    let gm = this.game
    let socket = serverInfo.socket

    let curTab = { num: 0 }

    let div = document.getElementById("main-controller")

    /**** DO SOME EXTRA INITIALIZATION *****/
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
        // Set compass level to 0
        case 1:
          serverInfo.roleStats[1].lvl = 0;

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

          break;

        // Weapon Specialist
        // Set cannon level to 0
        case 4:
          serverInfo.roleStats[4].lvl = 0;

          // Also, create variable that checks if cannon has already been loaded
          serverInfo.roleStats[4].cannonsLoaded = {};

          break;
      }
    }

    /**** DISPLAY INTERFACE *****/

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
      newTab.innerHTML = '<img src="assets/pirate_flag.jpg"/><span class="shipRoleTitle">' + ROLE_DICTIONARY[roleNum] + '</span>';

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
    // (by calling LOAD_TAB with value 0; third paramter loads play interface instead of prep interface)
    LOAD_TAB("label0", curTab, 1)

    this.timer = serverInfo.timer
    loadMainSockets(socket, gm, serverInfo)

    console.log("Controller Play state");

    // Function that is called whenever a new turn starts
    // Resets timer, cleans interface variables, reloads first tab
    socket.on('new-turn', data => {
      // reset the timer (if you're the VIP)
      if(serverInfo.vip) {
        serverInfo.timer = serverInfo.timerBackup;
      }

      // clean interface variables
      serverInfo.submittedUpgrade = {}
      serverInfo.errorMessages = []

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
