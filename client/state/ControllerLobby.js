import { serverInfo } from './sockets/serverInfo'
import { playerColors } from './utils/colors'
import loadMainSockets from './sockets/mainSocketsController'
import loadRejoinRoom from './sockets/rejoinRoomModule'

class ControllerLobby extends Phaser.State {
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

    let div = document.getElementById("main-controller")

    // display VIP message
    // and start button
    if(serverInfo.vip) {
      let p2 = document.createElement("p")
      p2.innerHTML = serverInfo.translate("vip-message-waiting")
      div.appendChild(p2)

      let btn1 = document.createElement("button")
      btn1.innerHTML = serverInfo.translate("start-game")
      btn1.addEventListener('click', function(event) {
        if(btn1.disabled) { return; }

        btn1.disabled = true;

        // send message to server that we want to start
        socket.emit('start-game', {} )
        
        // we don't need to go to the next state; that happens automatically when the server responds with "okay! we start!"
      })
      div.appendChild(btn1)
    }
    
    // ask user to draw their own profile pic
    let p3 = document.createElement("p")
    p3.innerHTML = serverInfo.translate('controller-waiting-1')
    div.appendChild(p3)

    // move canvas inside GUI
    let canvas = document.getElementById("canvas-container")
    div.appendChild(canvas)

    // IMPORTANT: the canvas gets a reference to the game
    // (we need this reference to create bitmaps and scale the canvas = game properly)
    canvas.myGame = gm;

    // make canvas the correct size
    // check what's the maximum width or height we can use
    let maxWidth = document.getElementById('main-controller').clientWidth
    // calculate height of the viewport, subtract the space lost because of text above the canvas, subtract space lost from button (height+padding+margin)
    let maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - canvas.getBoundingClientRect().top - (16+8*2+4*2)
    // determine the greatest width we can use (either the original width, or the width that will lead to maximum allowed height)
    let finalWidth = Math.min(maxWidth, maxHeight / 1.3)
    // scale the game immediately (both stage and canvas simultaneously)
    gm.scale.setGameSize(finalWidth, finalWidth * 1.3)

    // add a bitmap for drawing
    gm.bmd = gm.add.bitmapData(gm.width, gm.height);
    gm.bmd.ctx.strokeStyle = playerColors[serverInfo.rank]; // THIS is the actual drawing color      
    gm.bmd.ctx.lineWidth   = 10;     
    gm.bmd.ctx.lineCap     = 'round';    
    gm.bmd.isDragging = false;
    gm.bmd.lastPoint = null;  
     
    gm.canvasSprite = gm.add.sprite(0, 0, gm.bmd); 

    // display button to submit drawing
    let btn2 = document.createElement("button")
    btn2.innerHTML = serverInfo.translate("submit-drawing")
    btn2.addEventListener('click', function(event) {
      let dataURI = gm.bmd.canvas.toDataURL()

      // send the drawing to the server (including the information that it's a profile pic)
      socket.emit('submit-profile-pic', { dataURI: dataURI, type: "profile"})

      // Remove submit button
      btn2.remove();

      // Disable canvas
      canvas.style.display = 'none';

      if(!serverInfo.vip) {
        p3.innerHTML = serverInfo.translate('controller-waiting-2')
      } else {
        p3.innerHTML = ''
      }

    })
    div.appendChild(btn2)

    loadMainSockets(socket, gm, serverInfo)

    console.log("Controller Lobby state");
  }

  update () {
    // This is where we listen for input!

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
    }
  }
}

export default ControllerLobby
