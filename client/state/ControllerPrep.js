import { serverInfo } from './sockets/serverInfo'
import { playerColors } from './utils/colors'
import loadMainSockets from './sockets/mainSocketsController'
import loadRejoinRoom from './sockets/rejoinRoomModule'

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

    // TO DO
    // Load the main interface (ship title + color above, roles tab list below)
    // Provide a little explanation (for each or your roles, you need to do a little preparation. The game will start once everyone has submitted their preparation.)
    // Then provide the interface
    // "Please finish your drawing/title" before switching to another role, otherwise you will lose your progress."

    loadMainSockets(socket, gm, serverInfo)

    console.log("Controller Preparation state");
  }

  update () {
    // This is where we listen for input!

    /***
     * DRAW STUFF
     ***/
    if(this.game.input.activePointer.isUp) {        
      this.bmd.isDragging = false;        
      this.bmd.lastPoint = null;      
    }      

    if (this.game.input.activePointer.isDown) {            
      this.bmd.isDragging = true;        
      this.bmd.ctx.beginPath();                        
      var newPoint = new Phaser.Point(this.game.input.x, this.game.input.y);        

      if(this.bmd.lastPoint) {          
        this.bmd.ctx.moveTo(this.bmd.lastPoint.x, this.bmd.lastPoint.y);          
        this.bmd.ctx.lineTo(newPoint.x, newPoint.y);        
      }        

      this.bmd.lastPoint = newPoint;        
      this.bmd.ctx.stroke();        
    
      this.bmd.dirty = true;
    }
  }
}

export default ControllerPrep
