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
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
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

  language: 'en',

  submittedPreparation: {}

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

var _loadImageComplete = __webpack_require__(16);

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
var loadGUIOverlay = function loadGUIOverlay(gm, serverInfo, style1, style2) {
		// display the room code
		var text = gm.add.text(gm.width - 20, 20, serverInfo.roomCode, style1);
		text.anchor.setTo(1.0, 0);

		//display text above it to make clear that this is a room code
		var text2 = gm.add.text(gm.width - 20, 20 + 12, serverInfo.translate('room').toUpperCase(), style2);
		text2.anchor.setTo(1.0, 1.0);
};

exports.default = loadGUIOverlay;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var gameTimer = exports.gameTimer = function gameTimer(ths, serverInfo) {
  if (serverInfo.paused) {
    return;
  }

  if (ths.timer > 0) {
    ths.timer -= ths.game.time.elapsed / 1000;
    ths.timerText.text = Math.ceil(ths.timer);
  } else {
    ths.timerText.text = "Time's up!";
  }
};

var controllerTimer = exports.controllerTimer = function controllerTimer(ths, serverInfo) {
  // If we're paused, or the timer has already run out, stop counting down (and sending timer signals)
  if (serverInfo.paused || ths.timer <= 0) {
    return;
  }

  // Perform countdown, if we're VIP
  if (serverInfo.vip) {
    ths.timer -= ths.game.time.elapsed / 1000;

    if (ths.timer <= 0) {
      serverInfo.socket.emit('timer-complete', {});
    }
  }
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (eventID, curTab, interfaceType) {
    var num = eventID.charAt(5); // get number from id

    console.log("Loading tab " + num);

    // disable old selected tab
    document.getElementById("label" + curTab.num).classList.remove('tabSelected');

    // enable new selected tab
    document.getElementById(eventID).classList.add('tabSelected');

    // save the canvas
    var cv = document.getElementById("canvas-container");
    cv.style.display = 'none';
    document.body.appendChild(cv);

    // then empty the interface area
    document.getElementById("shipInterface").innerHTML = '';

    // create the interface container
    var container = document.createElement("div");
    container.classList.add("roleInterface");
    container.id = "tab" + num;

    document.getElementById("shipInterface").appendChild(container);

    // now start loading the interface, for this ...
    //  ... the role is needed (obviously) in the form of its number
    //  ... the container is needed (because everything is going to be appended as a child there)

    // interfaceType "0" = preparation interface
    // interfaceType "1" = play interface
    if (interfaceType == 0) {
        (0, _loadPrepInterface2.default)(_serverInfo.serverInfo.myRoles[num], container);
    } else {
        (0, _loadPlayInterface2.default)(_serverInfo.serverInfo.myRoles[num], container);
    }

    // update current tab number
    curTab.num = num;
};

var _roleDictionary = __webpack_require__(9);

var _serverInfo = __webpack_require__(0);

var _loadPrepInterface = __webpack_require__(23);

var _loadPrepInterface2 = _interopRequireDefault(_loadPrepInterface);

var _loadPlayInterface = __webpack_require__(24);

var _loadPlayInterface2 = _interopRequireDefault(_loadPlayInterface);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

// I'm cheating here
// I pass curTab as a function with a property 'num', so it is passed by REFERENCE
// This way I can access the old tab, disable it, and then update to the new tab, without having to send the object back
// Bad practice, works well though :p

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var SHIP_COLORS = exports.SHIP_COLORS = ['#FFAAAA', '#AAFFAA', '#AAAAFF', '#FFAAFF', '#FFFFAA', '#AAFFFF'];

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Menu = __webpack_require__(15);

var _Menu2 = _interopRequireDefault(_Menu);

var _GameLobby = __webpack_require__(17);

var _GameLobby2 = _interopRequireDefault(_GameLobby);

var _GamePrep = __webpack_require__(18);

var _GamePrep2 = _interopRequireDefault(_GamePrep);

var _GamePlay = __webpack_require__(19);

var _GamePlay2 = _interopRequireDefault(_GamePlay);

var _GameOver = __webpack_require__(20);

var _GameOver2 = _interopRequireDefault(_GameOver);

var _ControllerLobby = __webpack_require__(21);

var _ControllerLobby2 = _interopRequireDefault(_ControllerLobby);

var _ControllerPrep = __webpack_require__(22);

var _ControllerPrep2 = _interopRequireDefault(_ControllerPrep);

var _ControllerPlay = __webpack_require__(25);

var _ControllerPlay2 = _interopRequireDefault(_ControllerPlay);

var _ControllerOver = __webpack_require__(26);

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
/* 15 */
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
      this.game.stage.backgroundColor = "#000000";

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
/* 16 */
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
/* 17 */
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
/* 18 */
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

var _loadGUIOverlay = __webpack_require__(10);

var _loadGUIOverlay2 = _interopRequireDefault(_loadGUIOverlay);

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
      var _this2 = this;

      var gm = this.game;
      var socket = _serverInfo.serverInfo.socket;

      gm.add.text(gm.width * 0.5 - 250, 20, 'Please look at your devices and perform the preparation for each role.', _styles.mainStyle.mainText(500, '#000000'));

      gm.add.text(gm.width * 0.5 - 250, 100, 'IMPORTANT: Submit your drawing/title/settings before switching to a different role, or you will lose your progress.', _styles.mainStyle.mainText(500, '#333333'));

      // display a loading bar
      this.loadingSprite = gm.add.sprite(gm.width * 0.5, 400, 'nonexistent_index');
      this.loadingSprite.anchor.setTo(0, 0.5);
      this.loadingSprite.height = 50;
      this.loadingSprite.width = 500;

      // update loading bar during the state (when progress signals are received from the server)
      // @parameter data => percentage of preparation that has finished
      socket.on('preparation-progress', function (data) {
        _this2.loadingSprite.width = 500 * data;
      });

      // load GUI overlay (displays room code and such)
      (0, _loadGUIOverlay2.default)(gm, _serverInfo.serverInfo, _styles.mainStyle.mainText(), _styles.mainStyle.subText());

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
/* 19 */
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

var _timers = __webpack_require__(11);

var _loadGUIOverlay = __webpack_require__(10);

var _loadGUIOverlay2 = _interopRequireDefault(_loadGUIOverlay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GamePlay = function (_Phaser$State) {
    _inherits(GamePlay, _Phaser$State);

    function GamePlay() {
        _classCallCheck(this, GamePlay);

        return _possibleConstructorReturn(this, (GamePlay.__proto__ || Object.getPrototypeOf(GamePlay)).call(this));
    }

    _createClass(GamePlay, [{
        key: 'preload',
        value: function preload() {}
    }, {
        key: 'create',
        value: function create() {
            var gm = this.game;
            var socket = _serverInfo.serverInfo.socket;

            // THIS IS WHERE ALL THE MAGIC HAPPENS

            // Display the game map (hidden or not)
            // TO DO
            // We're just showing the seed, at the moment
            gm.add.text(gm.width * 0.5, 400, 'Game seed:' + _serverInfo.serverInfo.mapSeed, _styles.mainStyle.subText());

            // Display the messages from the radio

            // Display all the players in the game and the color of their ship (and name/flag?)

            // load timer
            this.timerText = gm.add.text(gm.width * 0.5, 60, "", _styles.mainStyle.timerText());
            this.timer = _serverInfo.serverInfo.timer;

            // load GUI overlay (displays room code and such)
            (0, _loadGUIOverlay2.default)(gm, _serverInfo.serverInfo, _styles.mainStyle.mainText(), _styles.mainStyle.subText());

            (0, _watchRoomModule2.default)(socket, _serverInfo.serverInfo);

            console.log("Game Play state");
        }
    }, {
        key: 'update',
        value: function update() {
            // Update timer
            (0, _timers.gameTimer)(this, _serverInfo.serverInfo);
        }
    }]);

    return GamePlay;
}(Phaser.State);

exports.default = GamePlay;

/***/ }),
/* 20 */
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

      // IMPORTANT: the canvas gets a reference to the game
      // (we need this reference to create bitmaps and scale the canvas = game properly)
      canvas.myGame = gm;

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
      gm.bmd = gm.add.bitmapData(gm.width, gm.height);
      gm.bmd.ctx.strokeStyle = _colors.playerColors[_serverInfo.serverInfo.rank]; // THIS is the actual drawing color      
      gm.bmd.ctx.lineWidth = 10;
      gm.bmd.ctx.lineCap = 'round';
      gm.bmd.isDragging = false;
      gm.bmd.lastPoint = null;

      gm.canvasSprite = gm.add.sprite(0, 0, gm.bmd);

      // display button to submit drawing
      var btn2 = document.createElement("button");
      btn2.innerHTML = _serverInfo.serverInfo.translate("submit-drawing");
      btn2.addEventListener('click', function (event) {
        var dataURI = gm.bmd.canvas.toDataURL();

        // send the drawing to the server (including the information that it's a profile pic)
        socket.emit('submit-profile-pic', { dataURI: dataURI, type: "profile" });

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
      var gm = this.game;
      if (gm.input.activePointer.isUp) {
        gm.bmd.isDragging = false;
        gm.bmd.lastPoint = null;
      }

      if (gm.input.activePointer.isDown) {
        gm.bmd.isDragging = true;
        gm.bmd.ctx.beginPath();
        var newPoint = new Phaser.Point(gm.input.x, gm.input.y);

        if (gm.bmd.lastPoint) {
          gm.bmd.ctx.moveTo(gm.bmd.lastPoint.x, gm.bmd.lastPoint.y);
          gm.bmd.ctx.lineTo(newPoint.x, newPoint.y);
        }

        gm.bmd.lastPoint = newPoint;
        gm.bmd.ctx.stroke();

        gm.bmd.dirty = true;
      }
    }
  }]);

  return ControllerLobby;
}(Phaser.State);

exports.default = ControllerLobby;

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

var _roleDictionary = __webpack_require__(9);

var _loadTab = __webpack_require__(12);

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
          (0, _loadTab2.default)(this.id, curTab, 0);
        });

        shipRoles.appendChild(newTab);
      }

      // finally, add the whole thing to the page
      div.appendChild(shipRoles);

      // add the area for the role interface
      var shipInterface = document.createElement("div");
      shipInterface.id = 'shipInterface';
      div.appendChild(shipInterface);

      // automatically load the first role 
      // (by calling LOAD_TAB with value "label0"; the other 0 determines its the preparation interface, not the play interface)
      (0, _loadTab2.default)("label0", curTab, 0);

      (0, _mainSocketsController2.default)(socket, gm, _serverInfo.serverInfo);

      console.log("Controller Preparation state");
    }
  }, {
    key: 'update',
    value: function update() {
      // This is where we listen for input (such as drawing)!

      /***
       * DRAW STUFF
       ***/
      var gm = this.game;
      if (gm.input.activePointer.isUp) {
        gm.bmd.isDragging = false;
        gm.bmd.lastPoint = null;
      }

      if (gm.input.activePointer.isDown) {
        gm.bmd.isDragging = true;
        gm.bmd.ctx.beginPath();
        var newPoint = new Phaser.Point(gm.input.x, gm.input.y);

        if (gm.bmd.lastPoint) {
          gm.bmd.ctx.moveTo(gm.bmd.lastPoint.x, gm.bmd.lastPoint.y);
          gm.bmd.ctx.lineTo(newPoint.x, newPoint.y);
        }

        gm.bmd.lastPoint = newPoint;
        gm.bmd.ctx.stroke();

        gm.bmd.dirty = true;

        gm.bmd.hasBeenEdited = true;
      }
    }
  }]);

  return ControllerPrep;
}(Phaser.State);

exports.default = ControllerPrep;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = loadPrepInterface;

var _serverInfo = __webpack_require__(0);

var _shipColors = __webpack_require__(13);

/*
    This function loads the preparation interface for each role

    @parameter num => the number of the role to be loaded
    @parameter cont => the container into which to load the interface

*/
function loadPrepInterface(num, cont) {
    var socket = _serverInfo.serverInfo.socket;

    // Every role has an instructional paragraph at the top; thus we can declare it here
    // The default value is "Thank You!", for when someone already submitted this role
    var p0 = document.createElement("p");
    p0.innerHTML = 'Thank you!';
    cont.appendChild(p0);

    // if we already submitted this role, don't load everything again!
    if (_serverInfo.serverInfo.submittedPreparation[num] == true) {
        return;
    }

    // Otherwise, load the whole shabang!
    // This switch statement loads the required buttons, inputs, drawing area, etc.
    //   => The submit button is underneath this statement, because it's almost identical for each role
    //   => The canvas resizing code is also underneath this, because it needs the height of the button
    var input0 = document.createElement("input");
    input0.style.marginBottom = '5px';

    var canvas = document.getElementById("canvas-container");
    var canvasProportion = 1; // ratio of height to width => value of 2 means that height = width*2

    var requiredInfo = {}; // this variable stores the info that is to be submitted (and their type + id/name)

    switch (num) {
        // **Captain**: give title and draw ship
        case 0:
            // Instructions
            p0.innerHTML = 'Title your ship and draw it (side-view)';

            // Title input bar
            input0.type = "text";
            input0.id = "shipTitle";
            input0.placeholder = "The Black Pearl";
            cont.appendChild(input0);

            // Canvas (drawing area for SHIP)
            canvas.style.display = 'block';
            cont.appendChild(canvas);

            canvasProportion = 1;

            requiredInfo = { 'shipTitle': 'text', 'shipDrawing': 'drawing' };

            break;

        // **First mate**: write motto and draw flag
        case 1:
            // Instructions
            p0.innerHTML = 'Write a motto and draw your flag';

            // Motto input
            input0.type = "text";
            input0.id = "shipMotto";
            input0.placeholder = "Veni, vidi, vici!";
            cont.appendChild(input0);

            // Canvas (drawing area for FLAG)
            canvas.style.display = 'block';
            cont.appendChild(canvas);

            canvasProportion = 0.5; // (flags are wide rectangles, not squares, thus height = width*0.5)

            requiredInfo = { 'shipMotto': 'text', 'shipFlag': 'drawing' };

            break;

        // Cartographer: title seamonster and draw seamonster
        case 2:
            // Instructions
            p0.innerHTML = 'Draw a seamonster and name it';

            // Seamonster name input
            input0.type = "text";
            input0.id = "shipMonster";
            input0.placeholder = "The Kraken!";
            cont.appendChild(input0);

            // Canvas (drawing area for MONSTER)
            canvas.style.display = 'block';
            cont.appendChild(canvas);

            canvasProportion = 1;

            requiredInfo = { 'shipMonster': 'text', 'shipMonsterDrawing': 'drawing' };

            break;

        // Sailor: (slider) choose between crew and resources
        case 3:
            // Instructions
            p0.innerHTML = 'Do you want to start with lots of crew, or lots of wood?';

            // Slider input (left = more crew, right = more wood)
            input0.type = "range";
            input0.id = 'res1';
            input0.min = 0;
            input0.max = 4;
            input0.value = 2;
            cont.appendChild(input0);

            // clues about what the slider means at a certain point
            var span0 = document.createElement("span");
            span0.innerHTML = 'CREW';
            span0.style.float = 'left';
            cont.appendChild(span0);

            var span1 = document.createElement("span");
            span1.innerHTML = 'WOOD';
            span1.style.float = 'right';
            cont.appendChild(span1);

            requiredInfo = { 'res1': 'res2' };

            break;

        // Weapon Specialist: (slider) choose between gun powder and resources
        case 4:
            // Instructions
            p0.innerHTML = 'Do you want to start with lots of gun powder, or lots of wood?';

            // Slider input (left = more guns, right = more wood)
            input0.type = "range";
            input0.id = 'res3';
            input0.min = 0;
            input0.max = 4;
            input0.value = 2;
            cont.appendChild(input0);

            // clues about what the slider means at a certain point
            var span0 = document.createElement("span");
            span0.innerHTML = 'GUNS';
            span0.style.float = 'left';
            cont.appendChild(span0);

            var span1 = document.createElement("span");
            span1.innerHTML = 'WOOD';
            span1.style.float = 'right';
            cont.appendChild(span1);

            requiredInfo = { 'res3': 'res2' };

            break;
    }

    /*
         Submit button (for all roles)
         => What it submits, depends on the role
      */
    var btn1 = document.createElement("button");
    btn1.innerHTML = 'Submit information';
    btn1.addEventListener('click', function (event) {
        // Check if all required information has been filled in
        // Text input (slider input has default values)
        if (input0.type == "text" && input0.value.length < 1) {
            return;
            // Drawing input
        } else if (canvas.style.display == 'block' && !canvas.myGame.bmd.hasBeenEdited) {
            return;
        }

        // Remove submit button
        btn1.remove();

        var signalContent = {};

        for (var key in requiredInfo) {
            var t = requiredInfo[key]; // get the type
            // it's either a piece of text
            if (t == 'text') {
                signalContent[key] = input0.value;
                // a drawing
            } else if (t == 'drawing') {
                signalContent[key] = canvas.myGame.bmd.canvas.toDataURL(); // this seems convoluted ... can't I get the dataURI from canvas immediately?
                // or a slider, in which case the dictionary holds another id-name (a slider chooses between two things, mostly resources on the ship)
            } else if (t.substring(0, 3) == 'res') {
                signalContent[key] = 0 + parseInt(input0.value);
                signalContent[requiredInfo[key]] = 4 - input0.value;
            }
        }

        console.log(signalContent);

        // send the drawing and info to the server
        // the server doesn't need to know the role or ship => it can figure it out itself
        socket.emit('submit-preparation', signalContent);

        // Disable canvas (and save it!)
        canvas.style.display = 'none';
        document.body.appendChild(canvas);

        // Remember that we already submitted this one
        _serverInfo.serverInfo.submittedPreparation[num] = true;

        // Reload the current tab/role - only this time, we're already done, so it just loads a "submitted" message
        // Empty the thing first (otherwise, it just keeps adding stuff to it)
        cont.innerHTML = '';
        loadPrepInterface(num, cont);
    });
    cont.appendChild(btn1);

    /*
         Canvas preparation code
         => The canvas needs to be the right size
         => The bitmapData for drawing needs to be prepared
         => (... but only if the canvas is actually displayed, of course)
      */
    if (canvas.style.display == 'block') {
        // make canvas the correct size
        // SIZE = total screen size - height taken by elements above - height taken by the button
        // keep some padding on both sides (10 is average height padding/margin, 20 is the padding on the sides)
        var paddingY = 10;
        var paddingX = 20;
        var maxHeight = screen.height - (input0.getBoundingClientRect().top + input0.getBoundingClientRect().height) - (btn1.getBoundingClientRect().height + 5 * 2) - paddingY * 2 - 2;
        var maxWidth = document.getElementById('shipInterface').clientWidth - paddingX * 2; // screen.width is misleading, because the main controller sets a max width

        // scale to the biggest size that fits (the canvas is a SQUARE)
        var finalSize = Math.min(maxWidth, maxHeight / canvasProportion);
        // scale the game immediately (both stage and canvas simultaneously)
        canvas.myGame.scale.setGameSize(finalSize, finalSize * canvasProportion);

        // remove previous drawing (if any)
        if (canvas.myGame.canvasSprite != undefined) {
            canvas.myGame.canvasSprite.destroy();
        }

        // Create bitmap for canvas 
        // Use the ship color for drawing
        var bmd = canvas.myGame.add.bitmapData(canvas.myGame.width, canvas.myGame.height);
        bmd.ctx.strokeStyle = _shipColors.SHIP_COLORS[_serverInfo.serverInfo.myShip];
        bmd.ctx.lineWidth = 10;
        bmd.ctx.lineCap = 'round';
        bmd.isDragging = false;
        bmd.lastPoint = null;

        //  => add it to the game, so we can manipulate it in update() (this also automatically replaces the old one)
        canvas.myGame.bmd = bmd;

        //  => create a sprite, so we can actually see the bitmap
        canvas.myGame.canvasSprite = canvas.myGame.add.sprite(0, 0, bmd);
    }
};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = loadPlayInterface;

var _serverInfo = __webpack_require__(0);

var _shipColors = __webpack_require__(13);

/*
    This function loads the preparation interface for each role

    @parameter num => the number of the role to be loaded
    @parameter cont => the container into which to load the interface

*/
function loadPlayInterface(num, cont) {
    var socket = _serverInfo.serverInfo.socket;

    // This switch statement loads the required buttons, inputs, sliders, etc. for a given role
    // It takes its settings from "serverInfo", which sould have the information (from a pre-signal)

    switch (num) {
        // **Captain**: 
        //  => display list of tasks (changes all the time; given by server)
        //  => display ship resources (only the 4 basic ones: gold, crew, wood, guns)
        case 0:
            // TO DO: Make buttons actually work

            // Loop through all tasks
            var tasks = _serverInfo.serverInfo.taskList;
            for (var i = 0; i < tasks.length; i++) {
                var taskType = tasks[i][0];
                var param = tasks[i][1];

                switch (taskType) {
                    // Battle => enemies are nearby
                    // No parameter necessary
                    case 0:
                        var span0 = document.createElement("span");
                        span0.classList.add("captain-task");
                        span0.innerHTML = "<p>One or more enemies are nearby. Attack?</p>";

                        // TO DO: Make button actually send the fire signal
                        var btn0 = document.createElement("button");
                        btn0.innerHTML = 'FIRE!';
                        span0.appendChild(btn0);

                        cont.appendChild(span0);

                        break;

                    // Discovery => an island has been discovered, and you may give it a name
                    // @parameter index of the island
                    case 1:
                        var span1 = document.createElement("span");
                        span1.classList.add("captain-task");
                        span1.innerHTML = "<p>You have discovered a mysterious island! What will you name it?</p>";

                        var inp1 = document.createElement("input");
                        inp1.type = "text";
                        span1.appendChild(inp1);

                        // TO DO: Make button actually submit the name
                        var btn1 = document.createElement("button");
                        btn1.innerHTML = 'Submit name';
                        span1.appendChild(btn1);

                        cont.appendChild(span1);

                        break;

                    // Dock => you are adjacent to a dock and may trade
                    // @parameter the index of the dock (so you know what you can trade)
                    case 2:
                        var span2 = document.createElement("span");
                        span2.classList.add("captain-task");
                        span2.innerHTML = "<p>You are docked at a harbor. Want to trade?</p>";

                        // TO DO: Actually display the proposed trade
                        span2.innerHTML += '<p><em>This feature doesn\'t work at the moment. BE PATIENT.</em></p>';

                        // TO DO: Make button actually perform the trade
                        var btn2 = document.createElement("button");
                        btn2.innerHTML = 'Perform trade';
                        span2.appendChild(btn2);

                        cont.appendChild(span2);

                        break;
                }
            }

            // Display resources underneath
            var resHeading = document.createElement("h1");
            resHeading.innerHTML = 'Resources';
            cont.appendChild(resHeading);

            var resDiv = document.createElement("div");
            resDiv.id = 'shipResources';

            // TO DO: Write (and receive) signal that updates these resource stats
            for (var _i = 0; _i < 4; _i++) {
                var curResVal = _serverInfo.serverInfo.resources[_i];

                resDiv.innerHTML += '<span class="shipResourceGroup"><img src="assets/resourceIcon' + _i + '.png"><span id="shipResource' + _i + '">' + curResVal + '</span></span>';
            }

            cont.appendChild(resDiv);

            break;

        // **First mate**: 
        //  => display current orientation (in background)
        //  => compass (rotatable; sends info when released)
        //  => current compass level + upgrade button
        case 1:
            // TO DO

            // Current orientation in background
            // TO DO: Convert server orientation to degrees?
            var bgOrient = document.createElement("img");
            bgOrient.src = "assets/shipGhostTopCompass.png";
            bgOrient.style.maxWidth = '100%';
            bgOrient.style.position = 'absolute';
            bgOrient.style.opacity = 0.5;
            bgOrient.style.transform = 'rotate(' + _serverInfo.serverInfo.orientation + 'deg)';

            cont.appendChild(bgOrient);

            // Compass on top of that
            var bgCompass = document.createElement("img");
            bgCompass.src = "assets/backgroundCompass.png";
            bgOrient.style.maxWidth = '100%';
            bgOrient.style.position = 'absolute';

            cont.appendChild(bgCompass);

            // Now add the compass POINTER
            // TO DO (question): on which element do we put the onclick/ontouch events? The pointer, or the background image (which has a larger and more consistent area)

            break;

        // Cartographer: 
        //  => display part of the map on canvas (centered on ship)
        //  => arrows to move around
        //  => current map level + upgrade button
        case 2:
            // TO DO

            break;

        // Sailor: 
        //  => display ship side-view (in background)
        //  => vertical slider for choosing sail strength/height
        //  => horizontal slider for choosing paddle strength
        //  => current sail level + upgrade button
        case 3:
            // TO DO

            break;

        // Weapon Specialist:
        //  => display ship (top-view; shows where each cannon is)
        //  => display all cannons (bought or not, level + upgrade button, current load)
        case 4:
            // TO DO

            break;
    }
};

/***/ }),
/* 25 */
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

var _loadTab = __webpack_require__(12);

var _loadTab2 = _interopRequireDefault(_loadTab);

var _timers = __webpack_require__(11);

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
            shipInfo.innerHTML = '<img src="' + _serverInfo.serverInfo.shipFlag + '" />' + _serverInfo.serverInfo.shipTitle;
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
                    (0, _loadTab2.default)(this.id, curTab, 1);
                });

                shipRoles.appendChild(newTab);
            }

            // finally, add the whole thing to the page
            div.appendChild(shipRoles);

            // add the area for the role interface
            var shipInterface = document.createElement("div");
            shipInterface.id = 'shipInterface';
            div.appendChild(shipInterface);

            // automatically load the first role 
            // (by calling LOAD_TAB with value 0; third paramter loads play interface instead of prep interface)
            (0, _loadTab2.default)("label0", curTab, 1);

            this.timer = _serverInfo.serverInfo.timer;
            (0, _mainSocketsController2.default)(socket, gm, _serverInfo.serverInfo);

            console.log("Controller Play state");
        }
    }, {
        key: 'update',
        value: function update() {
            // Update timer
            (0, _timers.controllerTimer)(this, _serverInfo.serverInfo);
        }
    }]);

    return ControllerWaiting;
}(Phaser.State);

exports.default = ControllerWaiting;

/***/ }),
/* 26 */
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