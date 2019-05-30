import Menu from './state/Menu' // menu is the waiting menu, where players either create or join a room

// game merely *displays* the game on the monitor
import GameLobby from './state/GameLobby' 
import GamePrep from './state/GamePrep'
import GamePlay from './state/GamePlay' 
import GameOver from './state/GameOver'

// controller means the handheld device a player uses
import ControllerLobby from './state/ControllerLobby'
import ControllerPrep from './state/ControllerPrep'
import ControllerPlay from './state/ControllerPlay'
import ControllerOver from './state/ControllerOver'


class App extends Phaser.Game {
  constructor () {
    super('100%', '100%', Phaser.AUTO, 'canvas-container')
    
    // menu state
    this.state.add('Menu', Menu)
 
    // game monitor states
    this.state.add('GameLobby', GameLobby)
    this.state.add('GamePrep', GamePrep)
    this.state.add('GamePlay', GamePlay)
    this.state.add('GameOver', GameOver)

    // game controller states
    this.state.add('ControllerLobby', ControllerLobby)
    this.state.add('ControllerPrep', ControllerPrep)
    this.state.add('ControllerPlay', ControllerPlay)
    this.state.add('ControllerOver', ControllerOver)

    // start the game! (at the menu)
    this.state.start('Menu')
  }
}

const SimpleGame = new App()

// augmenting standard JavaScript functions to make removal of overlay easier
// (we don't need the overlay at any point after the menu)
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

export default SimpleGame
