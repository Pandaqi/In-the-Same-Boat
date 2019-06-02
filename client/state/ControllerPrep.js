import { serverInfo } from './sockets/serverInfo'
import { playerColors } from './utils/colors'
import loadMainSockets from './sockets/mainSocketsController'
import loadRejoinRoom from './sockets/rejoinRoomModule'
import { ROLE_DICTIONARY } from './utils/roleDictionary'
import LOAD_TAB from './utils/loadTab'

class ControllerPrep extends Phaser.State {
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

    // TO DO
    // Add the loadTab function for switching tabs
    // Actually load the correct interfaces

    // Add the health bar at the top
    let healthBar = document.createElement("div");
    healthBar.id = "healthBar";
    healthBar.classList.add('shipColor' + serverInfo.myShip); // set bar to the right color
    div.appendChild(healthBar);

    // Add the ship info (name + flag)
    let shipInfo = document.createElement("div");
    shipInfo.id = 'shipInfo';
    shipInfo.innerHTML = '<img src="assets/pirate_flag.jpg" /> == Untitled Ship == ';
    shipInfo.classList.add('shipColor' + serverInfo.myShip); // set font to the right color
    div.appendChild(shipInfo);

    // Add the tabs for switching roles
    // first create the container
    let shipRoles = document.createElement("div");
    shipRoles.id = 'shipRoles';

    // then add the roles
    let roles = serverInfo.myRoles;
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
      // REMEMBER: <this> is the object associated with the event listener, ev.target is the thing that was actually clicked
      newTab.addEventListener('click', function(ev) {
        ev.preventDefault(); 

        LOAD_TAB(this.id, curTab);
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
    // by calling loadTab on the first tab
    // TO DO
    LOAD_TAB("label0", curTab)

    /*
     * FOR TESTING IF INFORMATION WAS WELL-RECEIVED
     *

    let p1 = document.createElement("p")
    p1.innerHTML = 'Ship number: ' + serverInfo.myShip;
    div.appendChild(p1)

    let p2 = document.createElement("p")
    p2.innerHTML = 'Roles: ' + serverInfo.myRoles;
    div.appendChild(p2)
    */

    // TO DO
    // Load the main interface (ship title + color above, roles tab list below)
    // Provide a little explanation (for each or your roles, you need to do a little preparation. The game will start once everyone has submitted their preparation.)
    // Then provide the interface
    // "Please finish your drawing/title" before switching to another role, otherwise you will lose your progress."

    loadMainSockets(socket, gm, serverInfo)

    console.log("Controller Preparation state");
  }

  update () {
    // This is where we listen for input (such as drawing)!
  }
}

export default ControllerPrep
