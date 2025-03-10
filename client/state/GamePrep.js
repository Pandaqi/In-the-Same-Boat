import { serverInfo } from './sockets/serverInfo'
import dynamicLoadImage from './drawing/dynamicLoadImage'
import { playerColors } from './utils/colors'
import loadPlayerVisuals from './drawing/loadPlayerVisuals'
import loadMainSockets from './sockets/mainSocketsGame'
import loadWatchRoom from './sockets/watchRoomModule'
import { mainStyle } from './utils/styles'

import loadGUIOverlay from './utils/loadGUIOverlay'

class GamePrep extends Phaser.State {
  constructor () {
    super()
  }

  preload () {
    this.game.stage.backgroundColor = "#FFFFFF";
  }

  create () {
    let gm = this.game
    let socket = serverInfo.socket

    gm.add.text(gm.width * 0.5 - 250, 20, 'Please look at your devices and perform the preparation for each role.', mainStyle.mainText(500, '#000000'));

    gm.add.text(gm.width * 0.5 - 250, 100, 'IMPORTANT: Submit your drawing/title/settings before switching to a different role, or you will lose your progress.', mainStyle.mainText(500, '#333333'));

    // display a loading bar
    this.loadingSprite = gm.add.sprite(gm.width * 0.5, 400, 'nonexistent_index')
    this.loadingSprite.anchor.setTo(0.5, 0.5);
    this.loadingSprite.height = 50;
    this.loadingSprite.width = 0;

    // update loading bar during the state (when progress signals are received from the server)
    // @parameter data => percentage of preparation that has finished
    socket.on('preparation-progress', data => {
      this.loadingSprite.width = 500 * data
    })

    // load GUI overlay (displays room code and such)
    loadGUIOverlay(gm, serverInfo, mainStyle.mainText(), mainStyle.subText())

    loadMainSockets(socket, gm, serverInfo)
    loadWatchRoom(socket, serverInfo)

    console.log("Game Preparation state")
  }

  // The shutdown function is called when we switch from one state to another
  shutdown() {

  }

  update () {
    // This is where we listen for input!
  }
}

export default GamePrep
