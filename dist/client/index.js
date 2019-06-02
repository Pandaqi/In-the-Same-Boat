/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// replace this with 'http://localhost:8000' to test locally
// use 'https://trampolinedraak.herokuapp.com' for production
var serverInfo = {
  SERVER_IP: 'http://localhost:8000', /*'https://trampolinedraak.herokuapp.com',*/
  socket: null,
  server: null,
  roomCode: '',
  vip: false,
  playerCount: -1,

  timer: 0,

  language: 'en'

  // language/translator object
  // serverInfo gets the language used in-game from the server, and also provides the translate function
  // not the cleanest approach ...
};var LANG = {};

// english
LANG['en'] = {
  'room': 'room',

  'game-waiting-1': 'Players can now join the game!',
  'game-suggestions-1': "Look at your screen. Fill in the suggestions and submit!",
  'game-drawing-1': "Draw the suggestion shown on your screen!",
  'game-guessing-1': "What do you think this drawing represents?",
  'game-guessing-pick-1': "Hmm, which one is the correct title?",
  'game-guessing-results-1': "Let's see how you did!",
  'game-over-1': "Final scores",

  'game-paused': "Game paused",
  'player': 'Player',
  'score': 'Score',
  'succesful-rejoin': "Succesfully rejoined the room!",
  'player-already-done': "You already did your job for this game phase, so you can relax.",
  'submit-guess': 'Submit guess',
  'guess-placeholder': "your guess ...",

  'vip-message-waiting': "You are VIP. Start the game when you're ready.",
  'start-game': "Start game",
  'submit-drawing': "Submit drawing",
  'submit': 'Submit',
  'controller-waiting-1': "Draw yourself a profile pic!",
  'controller-waiting-2': 'Waiting for game to start ...',

  'controller-suggestions-1': "Please give me a noun, verb, adjective and adverbial clause (in that order)",
  'controller-suggestions-noun': "noun (e.g. elephant, tables, etc.)",
  'controller-suggestions-verb': "verb with -ing (e.g. swimming)",
  'controller-suggestions-adjective': "adjective (e.g. beautiful)",
  'controller-suggestions-adverb': "adverb (e.g. carefully, to the beach, while sleeping, etc.)",
  'controller-suggestions-2': 'Thanks for your suggestions!',

  'controller-drawing-1': "Draw this",
  'controller-drawing-2': "That drawing is ... let's say, something special.",

  'controller-guessing-1': "This is your drawing. I hope you're happy with yourself.",
  'controller-guessing-2': 'What do you think this drawing means?',
  'guess-already-exists': "Oh no! Your guess already exists (or you guessed the correct title immediately)! Try something else.",
  'controller-guessing-3': "Wow ... you're so creative!",

  'controller-guessing-pick-1': "Still your drawing. Sit back and relax.",
  'controller-guessing-pick-2': "Which of these do you think is the correct title?",
  'controller-guessing-pick-3': "Really? You think it's that?!",

  'go-game-over': "Go to game over",
  'load-next-drawing': "Load next drawing!",
  'loading-next-screen': 'Loading next screen ...',

  "controller-guessing-results-1": "That was it for this round! At the game over screen, you can play another round or stop the game.",
  "controller-guessing-results-2": "Tap the button below whenever you want to start the next drawing",
  "controller-guessing-results-3": "That was it for this round! Please wait for the VIP to start the next round.",

  'controller-over-1': "Are you happy with your score? If not, TOO BAD.",
  'controller-over-2': "You can either start the next round (same room, same players, you keep your score), or end the game.",
  'start-next-round': "Start next round!",
  'destroy-game': "Destroy the game!",
  'continue-game': 'Continue game',

  'player-disconnect-1': "Oh no! Player(s) disconnected!",
  'player-disconnect-2': "You can wait until the player(s) rejoin. (To do so, they must rejoin the same room with the exact same name.) You can also continue without them, or stop the game completely."

  // dutch
};LANG['nl'] = {
  'room': 'kamercode',

  'game-waiting-1': 'Spelers kunnen zich nu aanmelden!',
  'game-suggestions-1': "Kijk op je scherm. Vul de suggesties in en klik op versturen!",
  'game-drawing-1': "Teken de suggestie die nu op je scherm verschijnt!",
  'game-guessing-1': "Wat denk jij dat de onderstaande tekening moet voorstellen?",
  'game-guessing-pick-1': "Hmm, welke van onderstaande titels is de juiste volgens jou?",
  'game-guessing-results-1': "Laten we eens kijken hoe iedereen het gedaan heeft ...",
  'game-over-1': 'Eindstand',

  'game-paused': 'Spel gepauzeerd',
  'player': 'Speler',
  'score': 'Score',
  'succesful-rejoin': "Rejoinen met de kamer was succesvol!",
  'player-already-done': "Je hebt je actie al gedaan voor deze spelfase, dus relax en wacht op de rest.",
  'submit-guess': 'Verstuur gok',
  'guess-placeholder': "jouw gok ..",

  'vip-message-waiting': "Jij bent de VIP (spelleider). Start het spel wanneer alle spelers gereed zijn.",
  'start-game': "Start het spel",
  'submit-drawing': "Verstuur tekening",
  'submit': 'Verstuur',
  'controller-waiting-1': "Teken een leuke profielfoto voor jezelf!",
  'controller-waiting-2': 'Aan het wachten todat de VIP het spel begint ...',

  'controller-suggestions-1': "Vul hieronder een zelfstandig naamwoord, werkwoord, bijvoeglijk naamwoord en bijzin in (op die volgorde)",
  'controller-suggestions-noun': "znw (olifant, tafels, etc.)",
  'controller-suggestions-verb': "ww op -de (zwemmende, springende, etc.)",
  'controller-suggestions-adjective': "bnw (mooie, domme, snelle, etc.)",
  'controller-suggestions-adverb': "bijzin (voorzichtig, naar het strand, etc.)",
  'controller-suggestions-2': 'Dank voor je suggesties!',

  'controller-drawing-1': 'Probeer dit te tekenen',
  'controller-drawing-2': "Die tekening is ... laten we zeggen, artistiek.",

  'controller-guessing-1': "Deze tekening heb jij gemaakt. Ik hoop dat je er blij mee bent.",
  'controller-guessing-2': 'Wat denk je dat deze tekening voorstelt?',
  'guess-already-exists': "Oh nee! Jouw gok is al door iemand anders gegokt, óf je hebt de juiste titel in één keer geraden. Probeer iets nieuws.",
  'controller-guessing-3': "Wow ... je bent zoooo creatief!",

  'controller-guessing-pick-1': "Dit is nog steeds jouw tekening. Leun achterover en relax.",
  'controller-guessing-pick-2': "Welke van deze titels is volgens jou de juiste?",
  'controller-guessing-pick-3': "... serieus? Je denkt dat dat de echte titel is?!",

  'go-game-over': "Ga naar game over",
  'load-next-drawing': "Laad de volgende tekening!",
  'loading-next-screen': 'Volgende scherm is aan het laden ...',

  "controller-guessing-results-1": "Dit is het eind van de ronde! Op het game over scherm kun jij kiezen om nog een ronde te spelen, of te stoppen.",
  "controller-guessing-results-2": "Klik op de knop hieronder wanneer je de volgende tekening wilt laden.",
  "controller-guessing-results-3": "Dit is het eind van deze ronde! Wacht aub totdat de VIP de volgende ronde begint.",

  'controller-over-1': "Ben je blij met je score? Zo ja, doe een dansje. Zo niet, JAMMER DAN.",
  'controller-over-2': "Je kunt de volgende ronde beginnen (zelfde kamer, zelfde spelers, score blijft behouden), óf het spel geheel eindigen",
  'start-next-round': "Start de volgende ronde!",
  'destroy-game': "Vernietig dit spel!",
  'continue-game': 'Ga door met het spel',

  'player-disconnect-1': "Oh nee! Een of meerdere speler(s) zijn hun verbinding verloren!",
  'player-disconnect-2': "Je kunt wachten tot alle spelers weer opnieuw verbonden zijn. (Om dat te doen, moeten ze exact dezelfde kamer met exact dezelfde gebruikersnaam joinen.) Je kunt ook kiezen om zonder hen verder te spelen, of het spel compleet te beëindigen."
};

serverInfo.translate = function (key) {
  var curlang = this.language;

  // if language doesn't exist, use english as default
  if (LANG[curlang] == undefined || LANG[curlang][key] == undefined) {
    curlang = 'en';
  }

  if (LANG[curlang][key] == undefined) {
    return ' <- string cannot be translated ->';
  } else {
    return LANG[curlang][key];
  }
};

exports.serverInfo = serverInfo;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var playerColors = exports.playerColors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _loadPlayerVisuals = __webpack_require__(3);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _colors = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadMainSockets = function loadMainSockets(socket, gm, serverInfo) {
  /***
  * MAIN SOCKETS
  * Some sockets are persistent across states
  * They are defined ONCE here, in the waiting area, and used throughout the game
  */

  // if a player is done -> show it by loading the player name + profile onscreen
  // do so in a circle (it works the best for any screen size AND any player count)
  socket.on('player-done', function (data) {
    console.log("Player done (" + data.name + ")");

    // offset the angle just a little bit, to make sure stuff doesn't clash
    var angle = (data.rank / serverInfo.playerCount + 0.25 * (1 / serverInfo.playerCount)) * 2 * Math.PI;
    var maxXHeight = gm.height * 0.5 / 1.3;
    var maxXWidth = gm.width * 0.5;
    var finalImageWidth = Math.min(maxXHeight, maxXWidth) * 0.66; // to make sure everything's visible and not too spaced out

    (0, _loadPlayerVisuals2.default)(gm, gm.width * 0.5 + Math.cos(angle) * finalImageWidth, gm.height * 0.5 + Math.sin(angle) * finalImageWidth * 1.3, _colors.playerColors[data.rank], data);
  });

  // go to next state
  // the server gives us (within data) the name of this next state
  socket.on('next-state', function (data) {
    // set the timer
    serverInfo.timer = data.timer;

    // start the next state
    gm.state.start('Game' + data.nextState);
  });

  // presignals always have the following format ['variable name', value]
  // they always set a variable on the server info (before a state change)
  socket.on('pre-signal', function (data) {
    for (var key in data) {
      serverInfo[key] = data[key];
    }
  });

  // force disconnect (because game has been stopped/removed)
  socket.on('force-disconnect', function (data) {
    socket.disconnect(true);
    window.location.reload(false);
  });

  /***
   * END MAIN SOCKETS
   */

  /***
   * PAUSING (main socket + pause message text object)
   */

  // This signal pauses/resumes the game
  socket.on('pause-resume-game', function (data) {
    if (data) {
      serverInfo.paused = true;

      var style = { font: "bold 32px Arial", fill: "#FF0000" };
      var text = gm.add.text(20, 20, serverInfo.translate('game-paused').toUpperCase(), style);
      text.anchor.setTo(0, 0);

      gm.pauseObject = text;
    } else {
      serverInfo.paused = false;

      if (gm.pauseObject != null) {
        gm.pauseObject.destroy();
      }
    }
  });
};

exports.default = loadMainSockets;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dynamicLoadImage = __webpack_require__(4);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _styles = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadPlayerVisuals = function loadPlayerVisuals(gm, x, y, color, data) {
  var newItem = gm.add.text(x, y, data.name, _styles.mainStyle.mainText(gm.width * 0.8, color));
  newItem.anchor.setTo(0, 0.5);

  if (data.profile != null) {
    var dataURI = data.profile;
    var imageName = 'profileImage' + data.name; // creates unique name by appending the username

    (0, _dynamicLoadImage2.default)(gm, { x: x - 100, y: y }, { width: 60, height: 78 }, imageName, dataURI);
  }
};

exports.default = loadPlayerVisuals;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _loadImageComplete = __webpack_require__(12);

var _loadImageComplete2 = _interopRequireDefault(_loadImageComplete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dynamicLoadImage = function dynamicLoadImage(gm, pos, dims, name, dataURI) {
  var doesKeyExist = gm.cache.checkKey(Phaser.Cache.IMAGE, name);
  if (!doesKeyExist) {
    // load the image; display once loaded
    var loader = new Phaser.Loader(gm);
    loader.image(name, dataURI + '');
    loader.onLoadComplete.addOnce(_loadImageComplete2.default, undefined, 0, gm, pos, dims, name);
    loader.start();
  } else {
    // if image was already in cache, just add the sprite (but don't load it again)
    (0, _loadImageComplete2.default)(gm, pos, dims, name);
  }
};

exports.default = dynamicLoadImage;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var mainStyle = exports.mainStyle = {
	mainText: function mainText() {
		var wordWrapWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
		var fill = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#333";

		return { font: "bold 26px Arial", fill: fill, wordWrap: true, wordWrapWidth: wordWrapWidth };
	},

	subText: function subText() {
		var wordWrapWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
		var fill = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#666";

		return { font: "bold 12px Arial", fill: fill, wordWrap: true, wordWrapWidth: wordWrapWidth };
	},

	timerText: function timerText() {
		return { font: "bold 26px Arial", fill: "#FF0000" };
	}
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var loadMainSockets = function loadMainSockets(socket, gm, serverInfo) {
  /***
   * MAIN SOCKETS
   * Some sockets are persistent across states
   * They are defined ONCE here, in the waiting area, and uses throughout the game
   */

  socket.on('next-state', function (data) {
    // set the timer
    serverInfo.timer = data.timer;

    // save the canvas (otherwise it is also removed when the GUI is removed)
    var cv = document.getElementById("canvas-container");
    cv.style.display = 'none';
    document.body.appendChild(cv);

    // clear the GUI
    document.getElementById("main-controller").innerHTML = '';

    // start the next state
    gm.state.start('Controller' + data.nextState);
  });

  // presignals are always a single OBJECT
  // every key in the object is added to the serverInfo, along with its value
  // (this always happens before a state change, thus the name presignal)
  socket.on('pre-signal', function (data) {
    for (var key in data) {
      serverInfo[key] = data[key];
    }
  });

  // force disconnect (because game has been stopped/removed)
  socket.on('force-disconnect', function (data) {
    socket.disconnect(true);
    window.location.reload(false);
  });

  socket.on('pause-resume-game', function (data) {
    if (!serverInfo.vip) {
      return;
    }

    if (data) {
      // if we're already paused, don't add another set of buttons and options for the vip
      // so, first check if this is our first pause
      if (!serverInfo.paused) {
        var div = document.getElementById("main-controller");

        var span = document.createElement("span");
        div.insertBefore(span, div.firstChild);

        // 1. add text to explain the situation
        var p1 = document.createElement("p");
        p1.innerHTML = serverInfo.translate("player-disconnect-1");
        span.appendChild(p1);

        var p2 = document.createElement("p");
        p2.innerHTML = serverInfo.translate("player-disconnect-2");
        span.appendChild(p2);

        // 2. add buttons for continuing without player, or stopping game altogether
        var btn1 = document.createElement("button");
        btn1.innerHTML = serverInfo.translate('continue-game');
        btn1.addEventListener('click', function (event) {
          socket.emit('continue-without-disconnects', {});

          // remove the pause GUI
          gm.pauseObject.innerHTML = '';
          gm.pauseObject.remove();

          // unpause the game
          serverInfo.paused = false;
        });
        span.appendChild(btn1);

        var btn2 = document.createElement("button");
        btn2.innerHTML = serverInfo.translate('destroy-game');
        btn2.addEventListener('click', function (event) {
          socket.emit('destroy-game', {});
        });
        span.appendChild(btn2);

        // 3. Add a horizontal rule to separate GUIs and add more space
        var hr = document.createElement("hr");
        span.appendChild(hr);

        // 4. and save all these somewhere so they can be removed (on button click, or when the game resumes)
        gm.pauseObject = span;

        serverInfo.paused = true;
      }
    } else {
      // remove the GUI that displays when the game is paused
      gm.pauseObject.innerHTML = '';
      gm.pauseObject.remove();

      serverInfo.paused = false;
    }
  });

  /***
   * END MAIN SOCKETS
   */
};

exports.default = loadMainSockets;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var loadWatchRoom = function loadWatchRoom(socket, serverInfo) {
  if (serverInfo.gameLoading) {
    socket.emit('finished-loading', {});

    serverInfo.gameLoading = false;
  }
};

exports.default = loadWatchRoom;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var loadRejoinRoom = function loadRejoinRoom(socket, serverInfo, div) {
	// if we have rejoined the room ...
	if (serverInfo.rejoin) {
		var p1 = document.createElement("p");
		p1.innerHTML = serverInfo.translate("succesful-rejoin");
		div.appendChild(p1);

		serverInfo.rejoin = false;

		// if we were already done for this phase
		if (serverInfo.playerDone) {
			var p2 = document.createElement("p");
			p2.innerHTML = serverInfo.translate('player-already-done');
			div.appendChild(p2);

			return true;
		} else {
			return false;
		}
	}
	return false;
};

exports.default = loadRejoinRoom;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var ROLE_DICTIONARY = exports.ROLE_DICTIONARY = ['Captain', 'First Mate', 'Cartographer', 'Sailor', 'Weapon Specialist'];

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Menu = __webpack_require__(11);

var _Menu2 = _interopRequireDefault(_Menu);

var _GameLobby = __webpack_require__(13);

var _GameLobby2 = _interopRequireDefault(_GameLobby);

var _GamePrep = __webpack_require__(14);

var _GamePrep2 = _interopRequireDefault(_GamePrep);

var _GamePlay = __webpack_require__(15);

var _GamePlay2 = _interopRequireDefault(_GamePlay);

var _GameOver = __webpack_require__(16);

var _GameOver2 = _interopRequireDefault(_GameOver);

var _ControllerLobby = __webpack_require__(17);

var _ControllerLobby2 = _interopRequireDefault(_ControllerLobby);

var _ControllerPrep = __webpack_require__(18);

var _ControllerPrep2 = _interopRequireDefault(_ControllerPrep);

var _ControllerPlay = __webpack_require__(21);

var _ControllerPlay2 = _interopRequireDefault(_ControllerPlay);

var _ControllerOver = __webpack_require__(22);

var _ControllerOver2 = _interopRequireDefault(_ControllerOver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // menu is the waiting menu, where players either create or join a room

// game merely *displays* the game on the monitor


// controller means the handheld device a player uses


var App = function (_Phaser$Game) {
    _inherits(App, _Phaser$Game);

    function App() {
        _classCallCheck(this, App);

        // menu state
        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, '100%', '100%', Phaser.AUTO, 'canvas-container'));

        _this.state.add('Menu', _Menu2.default);

        // game monitor states
        _this.state.add('GameLobby', _GameLobby2.default);
        _this.state.add('GamePrep', _GamePrep2.default);
        _this.state.add('GamePlay', _GamePlay2.default);
        _this.state.add('GameOver', _GameOver2.default);

        // game controller states
        _this.state.add('ControllerLobby', _ControllerLobby2.default);
        _this.state.add('ControllerPrep', _ControllerPrep2.default);
        _this.state.add('ControllerPlay', _ControllerPlay2.default);
        _this.state.add('ControllerOver', _ControllerOver2.default);

        // start the game! (at the menu)
        _this.state.start('Menu');
        return _this;
    }

    return App;
}(Phaser.Game);

var SimpleGame = new App();

// augmenting standard JavaScript functions to make removal of overlay easier
// (we don't need the overlay at any point after the menu)
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

exports.default = SimpleGame;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _mainSocketsGame = __webpack_require__(2);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _mainSocketsController = __webpack_require__(6);

var _mainSocketsController2 = _interopRequireDefault(_mainSocketsController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Menu = function (_Phaser$State) {
  _inherits(Menu, _Phaser$State);

  function Menu() {
    _classCallCheck(this, Menu);

    return _possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).call(this));
    // construct stuff here, if needed
  }

  _createClass(Menu, [{
    key: 'preload',
    value: function preload() {
      // load stuff here
      //game.load.baseURL = 'https://trampolinedraak.herokuapp.com/';
      this.game.load.crossOrigin = 'Anonymous';
      this.game.stage.backgroundColor = "#AA0000";

      // We set this to true so our game won't pause if we focus
      // something else other than the browser
      this.game.stage.disableVisibilityChange = true;
    }
  }, {
    key: 'create',
    value: function create() {
      // do nothing, because we're waiting on players to make a choice
      console.log("Menu state");

      var gm = this.game;

      //gm.scale.scaleMode = Phaser.ScaleManager.RESIZE;
      //gm.scale.parentIsWindow = true;

      // function for creating a room (from start GUI overlay)
      document.getElementById('createRoomBtn').onclick = function () {
        // disable the button
        this.disabled = true;

        // Connects the player to the server
        _serverInfo.serverInfo.socket = io(_serverInfo.serverInfo.SERVER_IP);
        var socket = _serverInfo.serverInfo.socket;

        // Creates game room on server
        socket.on('connect', function () {
          document.getElementById("err-message").innerHTML = 'Creating room ...';
          socket.emit('new-room', {});
        });

        // Once the room has been succesfully created
        // save the room code, load the next screen
        socket.on('room-created', function (data) {
          _serverInfo.serverInfo.roomCode = data.roomCode;

          // remove the overlay
          document.getElementById("main").style.display = 'none';

          // Starts the "game" state
          gm.state.start('GameLobby');
        });
      };

      // function for joining a room (from start GUI overlay)
      document.getElementById('joinRoomBtn').onclick = function () {
        // disable the button
        var btn = this;
        btn.disabled = true;

        // fetches the inputs (which will be handed to the server on first connection)
        // to join the correct room
        var inputs = document.getElementsByClassName("joinInput");
        var roomCode = inputs[0].value.toUpperCase();
        var userName = inputs[1].value.toUpperCase();
        console.log(roomCode + " || " + userName);

        // Connects the player to the server
        _serverInfo.serverInfo.socket = io(_serverInfo.serverInfo.SERVER_IP);
        var socket = _serverInfo.serverInfo.socket;

        socket.on('connect', function () {
          document.getElementById("err-message").innerHTML = 'Joining ...';

          socket.emit('join-room', {
            roomCode: roomCode,
            userName: userName
          });
        });

        // if joining was successful, go to the correct state
        // if not succesful, give the player another try
        socket.on('join-response', function (data) {
          if (data.success) {
            // remove overlay
            document.getElementById("main").style.display = 'none';

            // load necessary info
            _serverInfo.serverInfo.vip = data.vip;
            _serverInfo.serverInfo.roomCode = roomCode;
            _serverInfo.serverInfo.rank = data.rank;

            // Starts the "controller" state
            gm.state.start('ControllerLobby');
          } else {
            document.getElementById("err-message").innerHTML = data.err;
            btn.disabled = false;
            socket.disconnect(true);
          }
        });
      };

      // Watching a room simply means showing the game state
      // An audience can watch on a separate screen, or you can use this to reconnect a MONITOR if it lost internet connection
      document.getElementById('watchRoomBtn').onclick = function () {
        // disable the button
        var btn = this;
        if (btn.disabled) {
          return;
        }
        btn.disabled = true;

        // fetches the inputs (which will be handed to the server on first connection)
        // to join the correct room
        var roomCode = document.getElementsByClassName("joinInput")[2].value.toUpperCase();

        // Connects the player to the server
        _serverInfo.serverInfo.socket = io(_serverInfo.serverInfo.SERVER_IP);
        var socket = _serverInfo.serverInfo.socket;

        socket.on('connect', function () {
          document.getElementById("err-message").innerHTML = 'Loading room ...';

          socket.emit('watch-room', {
            roomCode: roomCode
          });
        });

        // if joining was successful, go to the correct state
        // if not succesful, give the player another try (disconnect from socket for cleanliness, and saving bandwidth)
        socket.on('watch-response', function (data) {
          if (data.success) {
            // remove overlay
            document.getElementById("main").style.display = 'none';

            // load the main sockets
            (0, _mainSocketsGame2.default)(socket, gm, _serverInfo.serverInfo);

            // set the timer
            _serverInfo.serverInfo.timer = data.timer;

            // load the info (set the given variable on the serverInfo object)
            var preSignal = data.preSignal;
            if (preSignal != null) {
              _serverInfo.serverInfo[preSignal[0]] = preSignal[1];
            }

            _serverInfo.serverInfo.paused = data.paused;
            _serverInfo.serverInfo.gameLoading = true;

            // go to the correct state
            gm.state.start('Game' + data.gameState);
          } else {
            document.getElementById("err-message").innerHTML = data.err;

            btn.disabled = false;
            socket.disconnect(true);
          }
        });
      };
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!
    }
  }]);

  return Menu;
}(Phaser.State);

exports.default = Menu;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var loadImageComplete = function loadImageComplete(gm, pos, dims, name) {
  var newSprite = gm.add.sprite(pos.x, pos.y, name);
  newSprite.width = dims.width;
  newSprite.height = dims.height;
  newSprite.anchor.setTo(0.5, 0.5);
};

exports.default = loadImageComplete;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(4);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(3);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(2);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(7);

var _watchRoomModule2 = _interopRequireDefault(_watchRoomModule);

var _styles = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GameLobby = function (_Phaser$State) {
  _inherits(GameLobby, _Phaser$State);

  function GameLobby() {
    _classCallCheck(this, GameLobby);

    return _possibleConstructorReturn(this, (GameLobby.__proto__ || Object.getPrototypeOf(GameLobby)).call(this));
  }

  _createClass(GameLobby, [{
    key: 'preload',
    value: function preload() {
      // Set scaling (as game monitors can also be any size)
      // Scale game to fit the entire window (and rescale when window is resized)
      var gm = this.game;

      gm.scale.scaleMode = Phaser.ScaleManager.RESIZE;
      window.addEventListener('resize', function () {
        gm.scale.refresh();
      });
      gm.scale.refresh();
    }
  }, {
    key: 'create',
    value: function create() {
      var gm = this.game;

      // display room code
      var text = gm.add.text(gm.width * 0.5, 20, _serverInfo.serverInfo.translate('room').toUpperCase() + ": " + _serverInfo.serverInfo.roomCode, _styles.mainStyle.mainText(gm.width * 0.8));
      text.anchor.setTo(0.5, 0);

      // explain that we're waiting for people to join
      var text2 = gm.add.text(gm.width * 0.5, 60, _serverInfo.serverInfo.translate('game-waiting-1'), _styles.mainStyle.subText(gm.width * 0.8));
      text2.anchor.setTo(0.5, 0);

      var socket = _serverInfo.serverInfo.socket;

      socket.on('new-player', function (data) {
        var x = gm.width * 0.5;
        var y = 120 + data.rank * 60;
        var newItem = gm.add.text(x, y, data.name, _styles.mainStyle.mainText(gm.width, _colors.playerColors[data.rank]));
        newItem.anchor.setTo(0, 0.5);
      });

      socket.on('player-updated-profile', function (data) {
        if (data.profile != null) {
          var dataURI = data.profile;
          var imageName = 'profileImage' + data.name; // creates unique name by appending the username

          var x = gm.width * 0.5;
          var y = 120 + data.rank * 60;

          (0, _dynamicLoadImage2.default)(gm, { x: x - 100, y: y }, { width: 60, height: 78 }, imageName, dataURI);
        }

        // create a bubble at random location for each player
        //let randPos = [gm.width*Math.random(), (gm.height-300)*Math.random()];
        //var graphics = gm.add.graphics(0, 0);
        //graphics.beginFill(0xFF0000, 1);
        //graphics.drawCircle(randPos[0], randPos[1], 100);
      });

      (0, _mainSocketsGame2.default)(socket, gm, _serverInfo.serverInfo);
      (0, _watchRoomModule2.default)(socket, _serverInfo.serverInfo);

      console.log("Game lobby state");
    }

    // The shutdown function is called when we switch from one state to another
    // In it, I can clean up this state (e.g. by removing eventListeners) before we go to another

  }, {
    key: 'shutdown',
    value: function shutdown() {
      var socket = _serverInfo.serverInfo.socket;

      socket.off('new-player');
      socket.off('player-updated-profile');
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!
    }
  }]);

  return GameLobby;
}(Phaser.State);

exports.default = GameLobby;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(4);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(3);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(2);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(7);

var _watchRoomModule2 = _interopRequireDefault(_watchRoomModule);

var _styles = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GamePrep = function (_Phaser$State) {
  _inherits(GamePrep, _Phaser$State);

  function GamePrep() {
    _classCallCheck(this, GamePrep);

    return _possibleConstructorReturn(this, (GamePrep.__proto__ || Object.getPrototypeOf(GamePrep)).call(this));
  }

  _createClass(GamePrep, [{
    key: 'preload',
    value: function preload() {}
  }, {
    key: 'create',
    value: function create() {
      var gm = this.game;
      var socket = _serverInfo.serverInfo.socket;

      gm.add.text(gm.width * 0.5 - 250, 20, 'Please look at your devices. For each role, you will have to do some preparation, and submit it to the server! IMPORTANT: Submit your drawing/title/settings before switching to a different role, or you will lose your progress.', _styles.mainStyle.mainText(500, '#FF0000'));

      // display the game map (just to test it out)
      // TO DO
      // We're just showing the seed, at the moment
      gm.add.text(gm.width * 0.5, 400, 'Game seed:' + _serverInfo.serverInfo.mapSeed, _styles.mainStyle.subText());

      (0, _mainSocketsGame2.default)(socket, gm, _serverInfo.serverInfo);
      (0, _watchRoomModule2.default)(socket, _serverInfo.serverInfo);

      console.log("Game Preparation state");
    }

    // The shutdown function is called when we switch from one state to another

  }, {
    key: 'shutdown',
    value: function shutdown() {}
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!
    }
  }]);

  return GamePrep;
}(Phaser.State);

exports.default = GamePrep;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(4);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(3);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(2);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(7);

var _watchRoomModule2 = _interopRequireDefault(_watchRoomModule);

var _styles = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GameWaiting = function (_Phaser$State) {
  _inherits(GameWaiting, _Phaser$State);

  function GameWaiting() {
    _classCallCheck(this, GameWaiting);

    return _possibleConstructorReturn(this, (GameWaiting.__proto__ || Object.getPrototypeOf(GameWaiting)).call(this));
  }

  _createClass(GameWaiting, [{
    key: 'preload',
    value: function preload() {
      // Set scaling (as game monitors can also be any size)
      // Scale game to fit the entire window (and rescale when window is resized)
      var gm = this.game;

      gm.scale.scaleMode = Phaser.ScaleManager.RESIZE;
      window.addEventListener('resize', function () {
        gm.scale.refresh();
      });
      gm.scale.refresh();
    }
  }, {
    key: 'create',
    value: function create() {
      var gm = this.game;

      // display room code
      var text = gm.add.text(gm.width * 0.5, 20, _serverInfo.serverInfo.translate('room').toUpperCase() + ": " + _serverInfo.serverInfo.roomCode, _styles.mainStyle.mainText(gm.width * 0.8));
      text.anchor.setTo(0.5, 0);

      // explain that we're waiting for people to join
      var text2 = gm.add.text(gm.width * 0.5, 60, _serverInfo.serverInfo.translate('game-waiting-1'), _styles.mainStyle.subText(gm.width * 0.8));
      text2.anchor.setTo(0.5, 0);

      var socket = _serverInfo.serverInfo.socket;

      socket.on('new-player', function (data) {
        var x = gm.width * 0.5;
        var y = 120 + data.rank * 60;
        var newItem = gm.add.text(x, y, data.name, _styles.mainStyle.mainText(gm.width, _colors.playerColors[data.rank]));
        newItem.anchor.setTo(0, 0.5);
      });

      socket.on('player-updated-profile', function (data) {
        if (data.profile != null) {
          var dataURI = data.profile;
          var imageName = 'profileImage' + data.name; // creates unique name by appending the username

          var x = gm.width * 0.5;
          var y = 120 + data.rank * 60;

          (0, _dynamicLoadImage2.default)(gm, { x: x - 100, y: y }, { width: 60, height: 78 }, imageName, dataURI);
        }

        // create a bubble at random location for each player
        //let randPos = [gm.width*Math.random(), (gm.height-300)*Math.random()];
        //var graphics = gm.add.graphics(0, 0);
        //graphics.beginFill(0xFF0000, 1);
        //graphics.drawCircle(randPos[0], randPos[1], 100);
      });

      (0, _mainSocketsGame2.default)(socket, gm, _serverInfo.serverInfo);
      (0, _watchRoomModule2.default)(socket, _serverInfo.serverInfo);

      console.log("Game waiting state");
    }

    // The shutdown function is called when we switch from one state to another
    // In it, I can clean up this state (e.g. by removing eventListeners) before we go to another

  }, {
    key: 'shutdown',
    value: function shutdown() {
      var socket = _serverInfo.serverInfo.socket;

      socket.off('new-player');
      socket.off('player-updated-profile');
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!
    }
  }]);

  return GameWaiting;
}(Phaser.State);

exports.default = GameWaiting;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(4);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(3);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(2);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(7);

var _watchRoomModule2 = _interopRequireDefault(_watchRoomModule);

var _styles = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GameWaiting = function (_Phaser$State) {
  _inherits(GameWaiting, _Phaser$State);

  function GameWaiting() {
    _classCallCheck(this, GameWaiting);

    return _possibleConstructorReturn(this, (GameWaiting.__proto__ || Object.getPrototypeOf(GameWaiting)).call(this));
  }

  _createClass(GameWaiting, [{
    key: 'preload',
    value: function preload() {
      // Set scaling (as game monitors can also be any size)
      // Scale game to fit the entire window (and rescale when window is resized)
      var gm = this.game;

      gm.scale.scaleMode = Phaser.ScaleManager.RESIZE;
      window.addEventListener('resize', function () {
        gm.scale.refresh();
      });
      gm.scale.refresh();
    }
  }, {
    key: 'create',
    value: function create() {
      var gm = this.game;

      // display room code
      var text = gm.add.text(gm.width * 0.5, 20, _serverInfo.serverInfo.translate('room').toUpperCase() + ": " + _serverInfo.serverInfo.roomCode, _styles.mainStyle.mainText(gm.width * 0.8));
      text.anchor.setTo(0.5, 0);

      // explain that we're waiting for people to join
      var text2 = gm.add.text(gm.width * 0.5, 60, _serverInfo.serverInfo.translate('game-waiting-1'), _styles.mainStyle.subText(gm.width * 0.8));
      text2.anchor.setTo(0.5, 0);

      var socket = _serverInfo.serverInfo.socket;

      socket.on('new-player', function (data) {
        var x = gm.width * 0.5;
        var y = 120 + data.rank * 60;
        var newItem = gm.add.text(x, y, data.name, _styles.mainStyle.mainText(gm.width, _colors.playerColors[data.rank]));
        newItem.anchor.setTo(0, 0.5);
      });

      socket.on('player-updated-profile', function (data) {
        if (data.profile != null) {
          var dataURI = data.profile;
          var imageName = 'profileImage' + data.name; // creates unique name by appending the username

          var x = gm.width * 0.5;
          var y = 120 + data.rank * 60;

          (0, _dynamicLoadImage2.default)(gm, { x: x - 100, y: y }, { width: 60, height: 78 }, imageName, dataURI);
        }

        // create a bubble at random location for each player
        //let randPos = [gm.width*Math.random(), (gm.height-300)*Math.random()];
        //var graphics = gm.add.graphics(0, 0);
        //graphics.beginFill(0xFF0000, 1);
        //graphics.drawCircle(randPos[0], randPos[1], 100);
      });

      (0, _mainSocketsGame2.default)(socket, gm, _serverInfo.serverInfo);
      (0, _watchRoomModule2.default)(socket, _serverInfo.serverInfo);

      console.log("Game waiting state");
    }

    // The shutdown function is called when we switch from one state to another
    // In it, I can clean up this state (e.g. by removing eventListeners) before we go to another

  }, {
    key: 'shutdown',
    value: function shutdown() {
      var socket = _serverInfo.serverInfo.socket;

      socket.off('new-player');
      socket.off('player-updated-profile');
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!
    }
  }]);

  return GameWaiting;
}(Phaser.State);

exports.default = GameWaiting;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _colors = __webpack_require__(1);

var _mainSocketsController = __webpack_require__(6);

var _mainSocketsController2 = _interopRequireDefault(_mainSocketsController);

var _rejoinRoomModule = __webpack_require__(8);

var _rejoinRoomModule2 = _interopRequireDefault(_rejoinRoomModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControllerLobby = function (_Phaser$State) {
  _inherits(ControllerLobby, _Phaser$State);

  function ControllerLobby() {
    _classCallCheck(this, ControllerLobby);

    return _possibleConstructorReturn(this, (ControllerLobby.__proto__ || Object.getPrototypeOf(ControllerLobby)).call(this));
    // construct stuff here, if needed
  }

  _createClass(ControllerLobby, [{
    key: 'preload',
    value: function preload() {
      // load stuff here, if needed
    }
  }, {
    key: 'create',
    value: function create() {
      var gm = this.game;
      var socket = _serverInfo.serverInfo.socket;

      var div = document.getElementById("main-controller");

      // display VIP message
      // and start button
      if (_serverInfo.serverInfo.vip) {
        var p2 = document.createElement("p");
        p2.innerHTML = _serverInfo.serverInfo.translate("vip-message-waiting");
        div.appendChild(p2);

        var btn1 = document.createElement("button");
        btn1.innerHTML = _serverInfo.serverInfo.translate("start-game");
        btn1.addEventListener('click', function (event) {
          if (btn1.disabled) {
            return;
          }

          btn1.disabled = true;

          // send message to server that we want to start
          socket.emit('start-game', {});

          // we don't need to go to the next state; that happens automatically when the server responds with "okay! we start!"
        });
        div.appendChild(btn1);
      }

      // ask user to draw their own profile pic
      var p3 = document.createElement("p");
      p3.innerHTML = _serverInfo.serverInfo.translate('controller-waiting-1');
      div.appendChild(p3);

      // move canvas inside GUI
      var canvas = document.getElementById("canvas-container");
      div.appendChild(canvas);

      // make canvas the correct size
      // check what's the maximum width or height we can use
      var maxWidth = document.getElementById('main-controller').clientWidth;
      // calculate height of the viewport, subtract the space lost because of text above the canvas, subtract space lost from button (height+padding+margin)
      var maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - canvas.getBoundingClientRect().top - (16 + 8 * 2 + 4 * 2);
      // determine the greatest width we can use (either the original width, or the width that will lead to maximum allowed height)
      var finalWidth = Math.min(maxWidth, maxHeight / 1.3);
      // scale the game immediately (both stage and canvas simultaneously)
      gm.scale.setGameSize(finalWidth, finalWidth * 1.3);

      // add a bitmap for drawing
      this.bmd = gm.add.bitmapData(gm.width, gm.height);
      this.bmd.ctx.strokeStyle = _colors.playerColors[_serverInfo.serverInfo.rank]; // THIS is the actual drawing color      
      this.bmd.ctx.lineWidth = 10;
      this.bmd.ctx.lineCap = 'round';
      this.bmd.ctx.fillStyle = '#ff0000';
      this.sprite = gm.add.sprite(0, 0, this.bmd);
      this.bmd.isDragging = false;
      this.bmd.lastPoint = null;
      //this.bmd.smoothed = false;
      var bmdReference = this.bmd;

      // display button to submit drawing
      var btn2 = document.createElement("button");
      btn2.innerHTML = _serverInfo.serverInfo.translate("submit-drawing");
      btn2.addEventListener('click', function (event) {
        var dataURI = bmdReference.canvas.toDataURL();

        // send the drawing to the server (including the information that it's a profile pic)
        socket.emit('submit-drawing', { dataURI: dataURI, type: "profile" });

        // Remove submit button
        btn2.remove();

        // Disable canvas
        canvas.style.display = 'none';

        if (!_serverInfo.serverInfo.vip) {
          p3.innerHTML = _serverInfo.serverInfo.translate('controller-waiting-2');
        } else {
          p3.innerHTML = '';
        }
      });
      div.appendChild(btn2);

      (0, _mainSocketsController2.default)(socket, gm, _serverInfo.serverInfo);

      console.log("Controller Lobby state");
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!

      /***
       * DRAW STUFF
       ***/
      if (this.game.input.activePointer.isUp) {
        this.bmd.isDragging = false;
        this.bmd.lastPoint = null;
      }

      if (this.game.input.activePointer.isDown) {
        this.bmd.isDragging = true;
        this.bmd.ctx.beginPath();
        var newPoint = new Phaser.Point(this.game.input.x, this.game.input.y);

        if (this.bmd.lastPoint) {
          this.bmd.ctx.moveTo(this.bmd.lastPoint.x, this.bmd.lastPoint.y);
          this.bmd.ctx.lineTo(newPoint.x, newPoint.y);
        }

        this.bmd.lastPoint = newPoint;
        this.bmd.ctx.stroke();

        this.bmd.dirty = true;
      }
    }
  }]);

  return ControllerLobby;
}(Phaser.State);

exports.default = ControllerLobby;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _colors = __webpack_require__(1);

var _mainSocketsController = __webpack_require__(6);

var _mainSocketsController2 = _interopRequireDefault(_mainSocketsController);

var _rejoinRoomModule = __webpack_require__(8);

var _rejoinRoomModule2 = _interopRequireDefault(_rejoinRoomModule);

var _roleDictionary = __webpack_require__(9);

var _loadTab = __webpack_require__(19);

var _loadTab2 = _interopRequireDefault(_loadTab);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControllerPrep = function (_Phaser$State) {
    _inherits(ControllerPrep, _Phaser$State);

    function ControllerPrep() {
        _classCallCheck(this, ControllerPrep);

        return _possibleConstructorReturn(this, (ControllerPrep.__proto__ || Object.getPrototypeOf(ControllerPrep)).call(this));
        // construct stuff here, if needed
    }

    _createClass(ControllerPrep, [{
        key: 'preload',
        value: function preload() {
            // load stuff here, if needed
        }
    }, {
        key: 'create',
        value: function create() {
            var gm = this.game;
            var socket = _serverInfo.serverInfo.socket;
            var curTab = { num: 0 };

            var div = document.getElementById("main-controller");

            // Add the health bar at the top
            var healthBar = document.createElement("div");
            healthBar.id = "healthBar";
            healthBar.classList.add('shipColor' + _serverInfo.serverInfo.myShip); // set bar to the right color
            div.appendChild(healthBar);

            // Add the ship info (name + flag)
            var shipInfo = document.createElement("div");
            shipInfo.id = 'shipInfo';
            shipInfo.innerHTML = '<img src="assets/pirate_flag.jpg" /> == Untitled Ship == ';
            shipInfo.classList.add('shipColor' + _serverInfo.serverInfo.myShip); // set font to the right color
            div.appendChild(shipInfo);

            // Add the tabs for switching roles
            // first create the container
            var shipRoles = document.createElement("div");
            shipRoles.id = 'shipRoles';

            // then add the roles
            var roles = _serverInfo.serverInfo.myRoles;
            for (var i = 0; i < roles.length; i++) {
                var roleNum = roles[i];

                // create a new tab object (with correct/unique label and z-index)
                var newTab = document.createElement("span");
                newTab.classList.add("shipRoleGroup");
                newTab.id = 'label' + i;
                newTab.style.zIndex = 5 - i;

                // add the ICON and the ROLE NAME within the tab
                newTab.innerHTML = '<img src="assets/pirate_flag.jpg"/><span class="shipRoleTitle">' + _roleDictionary.ROLE_DICTIONARY[roleNum] + '</span>';

                // when you click this tab, unload the previous tab, and load the new one!
                // REMEMBER: "this" is the object associated with the event listener, "ev.target" is the thing that was actually clicked
                newTab.addEventListener('click', function (ev) {
                    ev.preventDefault();
                    (0, _loadTab2.default)(this.id, curTab);
                });

                shipRoles.appendChild(newTab);
            }

            // finally, add the whole thing to the page
            div.appendChild(shipRoles);

            // add the area for the role interface
            var shipInterface = document.createElement("div");
            shipInterface.id = 'shipInterface';
            div.appendChild(shipInterface);

            // automatically load the first role (by calling LOAD_TAB with value 0)
            (0, _loadTab2.default)("label0", curTab);

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

            (0, _mainSocketsController2.default)(socket, gm, _serverInfo.serverInfo);

            console.log("Controller Preparation state");
        }
    }, {
        key: 'update',
        value: function update() {
            // This is where we listen for input (such as drawing)!
        }
    }]);

    return ControllerPrep;
}(Phaser.State);

exports.default = ControllerPrep;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function (eventID, curTab) {
   var num = eventID.charAt(5); // get number from id

   console.log("Loading tab " + num);

   // disable old selected tab
   document.getElementById("label" + curTab.num).classList.remove('tabSelected');

   // enable new selected tab
   document.getElementById(eventID).classList.add('tabSelected');

   // empty the interface area
   document.getElementById("shipInterface").innerHTML = '';

   // create the interface container
   var container = document.createElement("div");
   container.classList.add("roleInterface");
   container.id = "tab" + num;

   document.getElementById("shipInterface").appendChild(container);

   console.log(_serverInfo.serverInfo.myRoles[num]);
   console.log(container);

   // now start loading the interface, for this ...
   //  ... the role is needed (obviously) in the form of its number
   //  ... the container is needed (because everything is going to be appended as a child there)
   (0, _loadPrepInterface2.default)(_serverInfo.serverInfo.myRoles[num], container);

   // update current tab number
   curTab.num = num;
};

var _roleDictionary = __webpack_require__(9);

var _serverInfo = __webpack_require__(0);

var _loadPrepInterface = __webpack_require__(20);

var _loadPrepInterface2 = _interopRequireDefault(_loadPrepInterface);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

// I'm cheating here
// I pass curTab as a function with a property 'num', so it is passed by REFERENCE
// This way I can access the old tab, disable it, and then update to the new tab, without having to send the object back
// Bad practice, works well though :p

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (num, cont) {
    switch (num) {
        // Captain: give title and draw ship
        case 0:
            var p1 = document.createElement("p");
            p1.innerHTML = 'Please title your ship and draw it (from the side)';
            cont.appendChild(p1);

            // Title input bar
            var input = document.createElement("input");
            input.type = "text";
            input.id = "shipTitle";
            cont.appendChild(input);

            // Canvas (drawing area)
            var canvas = document.getElementById("canvas-container");
            canvas.style.display = 'block';
            cont.appendChild(canvas);

            // Title+Canvas submit button
            var btn1 = document.createElement("button");
            btn1.innerHTML = 'Submit title + drawing';
            btn1.addEventListener('click', function (event) {
                // Remove submit button
                btn1.remove();

                // Get the drawing into a form we can send over the internet
                var dataURI = bmdReference.canvas.toDataURL();

                // send the drawing to the server (including the information that it's a profile pic)
                socket.emit('submit-preparation', { role: 0, title: input.value, dataURI: dataURI });

                // Disable canvas
                canvas.style.display = 'none';

                // Remove input
                input.remove();

                // Replace text at the top
                p1.innerHTML = 'Thank you!';
            });
            cont.appendChild(btn1);

            // make canvas the correct size
            // SIZE = total screen size - height taken by elements above - height taken by the button
            // keep some padding (I use 10 here)
            var padding = 10;
            var maxHeight = screen.height - (input.getBoundingClientRect().top + input.getBoundingClientRect().height) - btn1.getBoundingClientRect().height - padding;
            var maxWidth = screen.width - padding;

            // scale to the biggest size that fits (the canvas is a SQUARE)
            var finalSize = Math.min(maxWidth, maxHeight);
            // scale the game immediately (both stage and canvas simultaneously)
            gm.scale.setGameSize(finalSize, finalSize);

            break;

        // First mate: write motto and draw flag
        case 1:

            break;

        // Cartographer: title seamonster and draw seamonster
        case 2:

            break;

        // Sailor: (slider) choose between crew and resources
        case 3:

            break;

        // Weapon Specialist: (slider) choose between gun powder and resources
        case 4:

            break;
    }
};

; /*
      This function loads the preparation interface for each role
  
      @num => the number of the role to be loaded
      @cont => the container into which to load the interface
  
  */

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _colors = __webpack_require__(1);

var _mainSocketsController = __webpack_require__(6);

var _mainSocketsController2 = _interopRequireDefault(_mainSocketsController);

var _rejoinRoomModule = __webpack_require__(8);

var _rejoinRoomModule2 = _interopRequireDefault(_rejoinRoomModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControllerWaiting = function (_Phaser$State) {
  _inherits(ControllerWaiting, _Phaser$State);

  function ControllerWaiting() {
    _classCallCheck(this, ControllerWaiting);

    return _possibleConstructorReturn(this, (ControllerWaiting.__proto__ || Object.getPrototypeOf(ControllerWaiting)).call(this));
    // construct stuff here, if needed
  }

  _createClass(ControllerWaiting, [{
    key: 'preload',
    value: function preload() {
      // load stuff here, if needed
    }
  }, {
    key: 'create',
    value: function create() {
      var gm = this.game;
      var socket = _serverInfo.serverInfo.socket;

      var div = document.getElementById("main-controller");

      // Create some text to explain rejoining was succesfull. 
      // If the player was already done for this round, the function returns true, and we stop loading the interface
      // TO DO: At the moment, rejoining in the waiting room is actually forbidden. (Also, it doesn't load the main sockets now.) Fix this sometime.
      if ((0, _rejoinRoomModule2.default)(socket, _serverInfo.serverInfo, div)) {
        return;
      }

      // display VIP message
      // and start button
      if (_serverInfo.serverInfo.vip) {
        var p2 = document.createElement("p");
        p2.innerHTML = _serverInfo.serverInfo.translate("vip-message-waiting");
        div.appendChild(p2);

        var btn1 = document.createElement("button");
        btn1.innerHTML = _serverInfo.serverInfo.translate("start-game");
        btn1.addEventListener('click', function (event) {
          if (btn1.disabled) {
            return;
          }

          btn1.disabled = true;

          // send message to server that we want to start
          socket.emit('start-game', {});

          // we don't need to go to the next state; that happens automatically when the server responds with "okay! we start!"
        });
        div.appendChild(btn1);
      }

      // ask user to draw their own profile pic
      var p3 = document.createElement("p");
      p3.innerHTML = _serverInfo.serverInfo.translate('controller-waiting-1');
      div.appendChild(p3);

      // move canvas inside GUI
      var canvas = document.getElementById("canvas-container");
      div.appendChild(canvas);

      // make canvas the correct size
      // check what's the maximum width or height we can use
      var maxWidth = document.getElementById('main-controller').clientWidth;
      // calculate height of the viewport, subtract the space lost because of text above the canvas, subtract space lost from button (height+padding+margin)
      var maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - canvas.getBoundingClientRect().top - (16 + 8 * 2 + 4 * 2);
      // determine the greatest width we can use (either the original width, or the width that will lead to maximum allowed height)
      var finalWidth = Math.min(maxWidth, maxHeight / 1.3);
      // scale the game immediately (both stage and canvas simultaneously)
      gm.scale.setGameSize(finalWidth, finalWidth * 1.3);

      // add a bitmap for drawing
      this.bmd = gm.add.bitmapData(gm.width, gm.height);
      this.bmd.ctx.strokeStyle = _colors.playerColors[_serverInfo.serverInfo.rank]; // THIS is the actual drawing color      
      this.bmd.ctx.lineWidth = 10;
      this.bmd.ctx.lineCap = 'round';
      this.bmd.ctx.fillStyle = '#ff0000';
      this.sprite = gm.add.sprite(0, 0, this.bmd);
      this.bmd.isDragging = false;
      this.bmd.lastPoint = null;
      //this.bmd.smoothed = false;
      var bmdReference = this.bmd;

      // display button to submit drawing
      var btn2 = document.createElement("button");
      btn2.innerHTML = _serverInfo.serverInfo.translate("submit-drawing");
      btn2.addEventListener('click', function (event) {
        var dataURI = bmdReference.canvas.toDataURL();

        // send the drawing to the server (including the information that it's a profile pic)
        socket.emit('submit-drawing', { dataURI: dataURI, type: "profile" });

        // Remove submit button
        btn2.remove();

        // Disable canvas
        canvas.style.display = 'none';

        if (!_serverInfo.serverInfo.vip) {
          p3.innerHTML = _serverInfo.serverInfo.translate('controller-waiting-2');
        } else {
          p3.innerHTML = '';
        }
      });
      div.appendChild(btn2);

      (0, _mainSocketsController2.default)(socket, gm, _serverInfo.serverInfo);

      console.log("Controller Waiting state");
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!

      /***
       * DRAW STUFF
       ***/
      if (this.game.input.activePointer.isUp) {
        this.bmd.isDragging = false;
        this.bmd.lastPoint = null;
      }

      if (this.game.input.activePointer.isDown) {
        this.bmd.isDragging = true;
        this.bmd.ctx.beginPath();
        var newPoint = new Phaser.Point(this.game.input.x, this.game.input.y);

        if (this.bmd.lastPoint) {
          this.bmd.ctx.moveTo(this.bmd.lastPoint.x, this.bmd.lastPoint.y);
          this.bmd.ctx.lineTo(newPoint.x, newPoint.y);
        }

        this.bmd.lastPoint = newPoint;
        this.bmd.ctx.stroke();

        this.bmd.dirty = true;
      }
    }
  }]);

  return ControllerWaiting;
}(Phaser.State);

exports.default = ControllerWaiting;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _colors = __webpack_require__(1);

var _mainSocketsController = __webpack_require__(6);

var _mainSocketsController2 = _interopRequireDefault(_mainSocketsController);

var _rejoinRoomModule = __webpack_require__(8);

var _rejoinRoomModule2 = _interopRequireDefault(_rejoinRoomModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControllerWaiting = function (_Phaser$State) {
  _inherits(ControllerWaiting, _Phaser$State);

  function ControllerWaiting() {
    _classCallCheck(this, ControllerWaiting);

    return _possibleConstructorReturn(this, (ControllerWaiting.__proto__ || Object.getPrototypeOf(ControllerWaiting)).call(this));
    // construct stuff here, if needed
  }

  _createClass(ControllerWaiting, [{
    key: 'preload',
    value: function preload() {
      // load stuff here, if needed
    }
  }, {
    key: 'create',
    value: function create() {
      var gm = this.game;
      var socket = _serverInfo.serverInfo.socket;

      var div = document.getElementById("main-controller");

      // Create some text to explain rejoining was succesfull. 
      // If the player was already done for this round, the function returns true, and we stop loading the interface
      // TO DO: At the moment, rejoining in the waiting room is actually forbidden. (Also, it doesn't load the main sockets now.) Fix this sometime.
      if ((0, _rejoinRoomModule2.default)(socket, _serverInfo.serverInfo, div)) {
        return;
      }

      // display VIP message
      // and start button
      if (_serverInfo.serverInfo.vip) {
        var p2 = document.createElement("p");
        p2.innerHTML = _serverInfo.serverInfo.translate("vip-message-waiting");
        div.appendChild(p2);

        var btn1 = document.createElement("button");
        btn1.innerHTML = _serverInfo.serverInfo.translate("start-game");
        btn1.addEventListener('click', function (event) {
          if (btn1.disabled) {
            return;
          }

          btn1.disabled = true;

          // send message to server that we want to start
          socket.emit('start-game', {});

          // we don't need to go to the next state; that happens automatically when the server responds with "okay! we start!"
        });
        div.appendChild(btn1);
      }

      // ask user to draw their own profile pic
      var p3 = document.createElement("p");
      p3.innerHTML = _serverInfo.serverInfo.translate('controller-waiting-1');
      div.appendChild(p3);

      // move canvas inside GUI
      var canvas = document.getElementById("canvas-container");
      div.appendChild(canvas);

      // make canvas the correct size
      // check what's the maximum width or height we can use
      var maxWidth = document.getElementById('main-controller').clientWidth;
      // calculate height of the viewport, subtract the space lost because of text above the canvas, subtract space lost from button (height+padding+margin)
      var maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - canvas.getBoundingClientRect().top - (16 + 8 * 2 + 4 * 2);
      // determine the greatest width we can use (either the original width, or the width that will lead to maximum allowed height)
      var finalWidth = Math.min(maxWidth, maxHeight / 1.3);
      // scale the game immediately (both stage and canvas simultaneously)
      gm.scale.setGameSize(finalWidth, finalWidth * 1.3);

      // add a bitmap for drawing
      this.bmd = gm.add.bitmapData(gm.width, gm.height);
      this.bmd.ctx.strokeStyle = _colors.playerColors[_serverInfo.serverInfo.rank]; // THIS is the actual drawing color      
      this.bmd.ctx.lineWidth = 10;
      this.bmd.ctx.lineCap = 'round';
      this.bmd.ctx.fillStyle = '#ff0000';
      this.sprite = gm.add.sprite(0, 0, this.bmd);
      this.bmd.isDragging = false;
      this.bmd.lastPoint = null;
      //this.bmd.smoothed = false;
      var bmdReference = this.bmd;

      // display button to submit drawing
      var btn2 = document.createElement("button");
      btn2.innerHTML = _serverInfo.serverInfo.translate("submit-drawing");
      btn2.addEventListener('click', function (event) {
        var dataURI = bmdReference.canvas.toDataURL();

        // send the drawing to the server (including the information that it's a profile pic)
        socket.emit('submit-drawing', { dataURI: dataURI, type: "profile" });

        // Remove submit button
        btn2.remove();

        // Disable canvas
        canvas.style.display = 'none';

        if (!_serverInfo.serverInfo.vip) {
          p3.innerHTML = _serverInfo.serverInfo.translate('controller-waiting-2');
        } else {
          p3.innerHTML = '';
        }
      });
      div.appendChild(btn2);

      (0, _mainSocketsController2.default)(socket, gm, _serverInfo.serverInfo);

      console.log("Controller Waiting state");
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input!

      /***
       * DRAW STUFF
       ***/
      if (this.game.input.activePointer.isUp) {
        this.bmd.isDragging = false;
        this.bmd.lastPoint = null;
      }

      if (this.game.input.activePointer.isDown) {
        this.bmd.isDragging = true;
        this.bmd.ctx.beginPath();
        var newPoint = new Phaser.Point(this.game.input.x, this.game.input.y);

        if (this.bmd.lastPoint) {
          this.bmd.ctx.moveTo(this.bmd.lastPoint.x, this.bmd.lastPoint.y);
          this.bmd.ctx.lineTo(newPoint.x, newPoint.y);
        }

        this.bmd.lastPoint = newPoint;
        this.bmd.ctx.stroke();

        this.bmd.dirty = true;
      }
    }
  }]);

  return ControllerWaiting;
}(Phaser.State);

exports.default = ControllerWaiting;

/***/ })
/******/ ]);