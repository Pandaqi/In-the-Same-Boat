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
      newTab.innerHTML = '<img src="assets/roleIcon' + roleNum + '.png"/><span class="shipRoleTitle">' + ROLE_DICTIONARY[roleNum] + '</span>';

      // when you click this tab, unload the previous tab, and load the new one!
      // REMEMBER: "this" is the object associated with the event listener, "ev.target" is the thing that was actually clicked
      newTab.addEventListener('click', function(ev) {
        ev.preventDefault(); 
        LOAD_TAB(this.id, curTab, 0);
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
    // (by calling LOAD_TAB with value "label0"; the other 0 determines its the preparation interface, not the play interface)
    LOAD_TAB("label0", curTab, 0)

    loadMainSockets(socket, gm, serverInfo)

    console.log("Controller Preparation state");
  }

  shutdown () {
    serverInfo.socket.off('pre-signal')
  }

  update () {
    // This is where we listen for input (such as drawing)!

    /***
     * DRAW STUFF
     ***/
    let gm = this.game;
    if(gm.input.activePointer.isUp) {        
      gm.bmd.isDragging = false;        
      gm.bmd.lastPoint = null;      
    }      

    if (gm.input.activePointer.isDown) {            
      gm.bmd.isDragging = true;        
      gm.bmd.ctx.beginPath();                        
      var newPoint = new Phaser.Point(gm.input.x, gm.input.y);        

      if(gm.bmd.lastPoint) {          
        gm.bmd.ctx.moveTo(gm.bmd.lastPoint.x, gm.bmd.lastPoint.y);          
        gm.bmd.ctx.lineTo(newPoint.x, newPoint.y);        
      }        

      gm.bmd.lastPoint = newPoint;        
      gm.bmd.ctx.stroke();        
    
      gm.bmd.dirty = true;

      gm.bmd.hasBeenEdited = true;
    }
  }
}

export default ControllerPrep
