import { serverInfo } from './sockets/serverInfo'
import dynamicLoadImage from './drawing/dynamicLoadImage'
import { playerColors } from './utils/colors'
import loadPlayerVisuals from './drawing/loadPlayerVisuals'
import loadMainSockets from './sockets/mainSocketsGame'
import loadWatchRoom from './sockets/watchRoomModule'
import { mainStyle } from './utils/styles'

import { gameTimer } from './utils/timers'
import loadGUIOverlay from './utils/loadGUIOverlay'


class GamePlay extends Phaser.State {
  constructor () {
    super()
  }

  preload () {
  }

  create () {
    let gm = this.game
    let socket = serverInfo.socket

    // THIS IS WHERE ALL THE MAGIC HAPPENS

    // Display the game map (hidden or not)

    // Display the messages from the radio

    // Display all the players in the game and the color of their ship (and name/flag?)

    // load timer
    this.timerText = gm.add.text(gm.width*0.5, 60, "", mainStyle.timerText())
    this.timer = serverInfo.timer

    // load GUI overlay (displays room code and such)
    loadGUIOverlay(gm, serverInfo, mainStyle.mainText(), mainStyle.subText())

    loadWatchRoom(socket, serverInfo)

    console.log("Game Play state")
  }

  update () {
    // Update timer
    gameTimer(this, serverInfo)
  }
}

export default GamePlay
