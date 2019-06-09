import { serverInfo } from './sockets/serverInfo'
import { playerColors } from './utils/colors'
import loadMainSockets from './sockets/mainSocketsController'
import loadRejoinRoom from './sockets/rejoinRoomModule'

import { controllerTimer } from './utils/timers'

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

    let div = document.getElementById("main-controller")

    // load player interface here



    this.timer = serverInfo.timer
    loadMainSockets(socket, gm, serverInfo)

    console.log("Controller Play state");
  }

  update () {
    // Update timer
    controllerTimer(this, serverInfo)
  }
}

export default ControllerWaiting
