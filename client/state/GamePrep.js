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

    // display the game map (just to test it out)

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
