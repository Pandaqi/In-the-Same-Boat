import { serverInfo } from './sockets/serverInfo'
import dynamicLoadImage from './drawing/dynamicLoadImage'
import { playerColors } from './utils/colors'
import loadPlayerVisuals from './drawing/loadPlayerVisuals'
import loadMainSockets from './sockets/mainSocketsGame'
import loadWatchRoom from './sockets/watchRoomModule'
import { mainStyle } from './utils/styles'


class GamePrep extends Phaser.State {
  constructor () {
    super()
  }

  preload () {

  }

  create () {
    let gm = this.game
    let socket = serverInfo.socket

    gm.add.text(gm.width * 0.5 - 250, 20, 'Please look at your devices. For each role, you will have to do some preparation, and submit it to the server! IMPORTANT: Submit your drawing/title/settings before switching to a different role, or you will lose your progress.', mainStyle.mainText(500, '#FF0000'));

    // display the game map (just to test it out)
    // TO DO
    // We're just showing the seed, at the moment
    gm.add.text(gm.width * 0.5, 400, 'Game seed:' + serverInfo.mapSeed, mainStyle.subText());

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
