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
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
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

  submittedPreparation: {},
  submittedUpgrade: {},
  errorMessages: []

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

var _loadImageComplete = __webpack_require__(17);

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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _loadPlayerVisuals = __webpack_require__(4);

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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dynamicLoadImage = __webpack_require__(2);

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
var ROLE_DICTIONARY = exports.ROLE_DICTIONARY = ['Captain', 'First Mate', 'Cartographer', 'Sailor', 'Weapon Specialist'];

/***/ }),
/* 8 */
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
/* 9 */
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

    // in fact, empty the canvas completely 
    cv.myGame.world.removeAll();

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

var _roleDictionary = __webpack_require__(7);

var _serverInfo = __webpack_require__(0);

var _loadPrepInterface = __webpack_require__(24);

var _loadPrepInterface2 = _interopRequireDefault(_loadPrepInterface);

var _loadPlayInterface = __webpack_require__(25);

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
exports.default = loadErrorMessage;

var _serverInfo = __webpack_require__(0);

var _roleDictionary = __webpack_require__(7);

function loadErrorMessage(msg, i) {
    var msgType = msg[i][0];
    var msgRole = _roleDictionary.ROLE_DICTIONARY[msg[i][1]];

    var finalMsg = '';
    switch (msgType) {
        case 0:
            finalMsg = 'Upgrade by <em>' + msgRole + '</em> failed!';
            break;

        case 1:
            finalMsg = 'Crew allocation by <em>' + msgRole + '</em> failed!';
            break;

        case 2:
            finalMsg = 'Buying a cannon failed!';
            break;
    }

    var errorMsg = document.createElement("span");
    errorMsg.classList.add("captain-error");
    errorMsg.setAttribute('data-errorid', i);
    errorMsg.innerHTML = "<p>" + finalMsg + "</p>";

    errorMsg.addEventListener('click', function () {
        _serverInfo.serverInfo.errorMessages[this.getAttribute('data-errorid')] = null;

        this.remove();
    });

    return errorMsg;
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Menu = __webpack_require__(16);

var _Menu2 = _interopRequireDefault(_Menu);

var _GameLobby = __webpack_require__(18);

var _GameLobby2 = _interopRequireDefault(_GameLobby);

var _GamePrep = __webpack_require__(19);

var _GamePrep2 = _interopRequireDefault(_GamePrep);

var _GamePlay = __webpack_require__(20);

var _GamePlay2 = _interopRequireDefault(_GamePlay);

var _GameOver = __webpack_require__(21);

var _GameOver2 = _interopRequireDefault(_GameOver);

var _ControllerLobby = __webpack_require__(22);

var _ControllerLobby2 = _interopRequireDefault(_ControllerLobby);

var _ControllerPrep = __webpack_require__(23);

var _ControllerPrep2 = _interopRequireDefault(_ControllerPrep);

var _ControllerPlay = __webpack_require__(27);

var _ControllerPlay2 = _interopRequireDefault(_ControllerPlay);

var _ControllerOver = __webpack_require__(28);

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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _mainSocketsGame = __webpack_require__(3);

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
/* 17 */
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(2);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(4);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(3);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(8);

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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(2);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(4);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(3);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(8);

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
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(2);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(4);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(3);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(8);

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
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serverInfo = __webpack_require__(0);

var _dynamicLoadImage = __webpack_require__(2);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

var _colors = __webpack_require__(1);

var _loadPlayerVisuals = __webpack_require__(4);

var _loadPlayerVisuals2 = _interopRequireDefault(_loadPlayerVisuals);

var _mainSocketsGame = __webpack_require__(3);

var _mainSocketsGame2 = _interopRequireDefault(_mainSocketsGame);

var _watchRoomModule = __webpack_require__(8);

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

var _rejoinRoomModule = __webpack_require__(9);

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
/* 23 */
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

var _rejoinRoomModule = __webpack_require__(9);

var _rejoinRoomModule2 = _interopRequireDefault(_rejoinRoomModule);

var _roleDictionary = __webpack_require__(7);

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
/* 24 */
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
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = loadPlayInterface;

var _serverInfo = __webpack_require__(0);

var _shipColors = __webpack_require__(13);

var _upgradeDictionary = __webpack_require__(26);

var _roleDictionary = __webpack_require__(7);

var _loadErrorMessage = __webpack_require__(14);

var _loadErrorMessage2 = _interopRequireDefault(_loadErrorMessage);

var _dynamicLoadImage = __webpack_require__(2);

var _dynamicLoadImage2 = _interopRequireDefault(_dynamicLoadImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
    The functions below are HELPER FUNCTIONS for specific roles (that require interactivity beyond basic DOM stuff)
    (At the bottom of this file, the main "loadPlayInterface" function can be found)

    The compass needs to be moved (and snapped) to certain angles

    The cartographer needs to move the map around

*/
function compassMove(ev) {
    ev.preventDefault();

    // rotate compass to match angle between mouse and center of compass

    // find center of compass
    var image1 = document.getElementById('firstmate-compassPointer');
    var rect1 = image1.getBoundingClientRect();
    var cx = rect1.left + rect1.width * 0.5;
    var cy = rect1.top + rect1.height * 0.5;

    // find mouse position
    var px = ev.pageX;
    var py = ev.pageY;

    // calculate difference vector, determine angle from that
    var vec = [px - cx, py - cy];
    var angle = Math.atan2(vec[1], vec[0]) * 180 / Math.PI;
    if (angle < 0) {
        angle += 360;
    }

    // Lock angle to compass level 
    // Determine the maximum rotation per turn (based on compass level)
    var deltaAngle = 180;
    switch (_serverInfo.serverInfo.roleStats[1].lvl) {
        case 0:
            deltaAngle = 45;
            break;
        case 1:
            deltaAngle = 90;
            break;
        case 2:
            deltaAngle = 90;
            break;
        case 3:
            deltaAngle = 135;
            break;
        case 4:
            deltaAngle = 135;
            break;
    }

    // get distance from current angle to current ship orientation
    // if this distance is above delta, you're too far
    var angleDiff;
    if (_serverInfo.serverInfo.oldOrientation == undefined) {
        angleDiff = (angle - _serverInfo.serverInfo.orientation + 180) % 360 - 180;
    } else {
        angleDiff = (angle - _serverInfo.serverInfo.oldOrientation + 180) % 360 - 180;
    }

    if (angleDiff < -180) {
        angleDiff += 360;
    }

    if (Math.abs(angleDiff) > deltaAngle) {
        return;
    } else {
        // Snap angle to fixed directions (8 dir, around center)
        angle = Math.round(angle / 45) * 45;

        // Update compass pointer
        document.getElementById('firstmate-compassPointer').style.transform = 'rotate(' + angle + 'deg)';
        document.getElementById('firstmate-compassPointer').setAttribute('data-angle', angle);
    }
}

function startCanvasDrag(ev) {
    // prevent actually dragging the image (which is default behaviour for most browsers in this situation)
    ev.preventDefault();

    // save the first point (on the canvas)
    document.getElementById('canvas-container').oldMovePoint = { x: ev.pageX, y: ev.pageY };

    document.addEventListener('mousemove', mapMove);
}

function stopCanvasDrag(ev) {
    document.removeEventListener('mousemove', mapMove);
}

function mapMove(ev) {
    var cv = document.getElementById('canvas-container');

    // get movement delta
    var dx = ev.pageX - cv.oldMovePoint.x;
    var dy = ev.pageY - cv.oldMovePoint.y;

    // move camera according to delta
    cv.myGame.camera.x += dx;
    cv.myGame.camera.y += dy;

    // update oldMovePoint
    cv.oldMovePoint = { x: ev.pageX, y: ev.pageY };
}

/*

    @parameter role => the role that wants an upgrade (every role only has one upgrade)
    @parameter level => the level we're upgrading TOWARDS
    @parameter serverInfo => global variable, in case we need it (for certain (cumulative) upgrades)
*/
function loadUpgradeButton(role, level) {
    var targetLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var costs = _upgradeDictionary.UPGRADE_DICT[role][level];
    var curString = '';

    // an upgrade to level 0 is the same as buying ...
    if (level == 0) {
        curString += '<span class="upgradeButtonLabel">Buy</span>';
    } else {
        curString += '<span class="upgradeButtonLabel">Upgrade (lv ' + level + ')</span>';
    }

    // if we're buying, we need to consider cumulative costs
    // because, the thing we buy will IMMEDIATELY be of the same level as this role's other instruments
    if (level == 0) {
        costs = {};

        // For each level ...
        for (var i = 0; i <= targetLevel; i++) {
            var c = _upgradeDictionary.UPGRADE_DICT[role][i];

            // Go through the different resource costs at this level ...
            for (var key in c) {
                // If this resource isn't in our costs yet, add it (with this value)
                if (costs[key] == undefined) {
                    costs[key] = c[key];
                    // If this resource is already in the costs object, just add this value to it
                } else {
                    costs[key] += c[key];
                }
            }
        }
    }

    // display costs inside upgrade button
    for (var _key in costs) {
        curString += '<span class="upgradeResourcesNeeded"><img src="assets/resourceIcon' + _key + '.png" /><span>x' + costs[_key] + '</span></span>';
    }

    return curString;
}

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
            // Display error messages
            // The loop is DESCENDING (rather than ASCENDING), because newer error messages should be displayed first
            var msg = _serverInfo.serverInfo.errorMessages;
            for (var i = msg.length - 1; i >= 0; i--) {
                if (msg[i] == null) {
                    continue;
                }

                cont.appendChild((0, _loadErrorMessage2.default)(msg, i));
            }

            // Loop through all tasks
            var tasks = _serverInfo.serverInfo.taskList;

            var _loop = function _loop(_i) {
                if (tasks[_i] == null) {
                    return 'continue';
                }

                var taskType = tasks[_i][0];
                var param = tasks[_i][1];

                switch (taskType) {
                    // Battle => enemies are nearby
                    // No parameter necessary
                    case 0:
                        var span0 = document.createElement("span");
                        span0.classList.add("captain-task");
                        span0.innerHTML = "<p>One or more enemies are nearby. Attack?</p>";

                        var btn0 = document.createElement("button");
                        btn0.setAttribute('data-taskid', _i);
                        btn0.innerHTML = 'FIRE!';
                        span0.appendChild(btn0);

                        btn0.addEventListener('click', function () {
                            // send signal to server
                            socket.emit('fire');

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            _serverInfo.serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span0.remove();
                        });

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

                        var btn1 = document.createElement("button");
                        btn1.setAttribute('data-taskid', _i);
                        btn1.innerHTML = 'Submit name';
                        span1.appendChild(btn1);

                        btn1.addEventListener('click', function () {
                            // send signal to server
                            socket.emit('name-island', { name: inp1.value, island: param });

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            _serverInfo.serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span1.remove();
                        });

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

                        var btn2 = document.createElement("button");
                        btn2.setAttribute('data-taskid', _i);
                        btn2.innerHTML = 'Perform trade';
                        span2.appendChild(btn2);

                        btn2.addEventListener('click', function () {
                            // send signal to server
                            socket.emit('dock-trade');

                            // TO DO 
                            // just update the resources immediately here, then we don't need to send/receive another signal

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            _serverInfo.serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span2.remove();
                        });

                        cont.appendChild(span2);

                        break;
                }
            };

            for (var _i = 0; _i < tasks.length; _i++) {
                var _ret = _loop(_i);

                if (_ret === 'continue') continue;
            }

            // Display resources underneath
            var resHeading = document.createElement("h1");
            resHeading.innerHTML = 'Resources';
            cont.appendChild(resHeading);

            var resDiv = document.createElement("div");
            resDiv.id = 'shipResources';

            for (var _i2 = 0; _i2 < 4; _i2++) {
                var curResVal = _serverInfo.serverInfo.resources[_i2];

                resDiv.innerHTML += '<span class="shipResourceGroup"><img src="assets/resourceIcon' + _i2 + '.png"><span id="shipResource' + _i2 + '">' + curResVal + '</span></span>';
            }

            cont.appendChild(resDiv);

            break;

        // **First mate**: 
        //  => display current orientation (in background)
        //  => compass (rotatable; sends info when released)
        //  => current compass level + upgrade button
        case 1:
            // Current orientation in background
            var bgOrient = document.createElement("img");
            bgOrient.src = "assets/shipGhostTopCompass.png";
            bgOrient.style.maxWidth = '100%';
            bgOrient.style.position = 'absolute';
            bgOrient.style.opacity = 0.5;

            if (_serverInfo.serverInfo.oldOrientation == undefined) {
                bgOrient.style.transform = 'rotate(' + _serverInfo.serverInfo.orientation * 45 + 'deg)';
            } else {
                bgOrient.style.transform = 'rotate(' + _serverInfo.serverInfo.oldOrientation * 45 + 'deg)';
            }

            cont.appendChild(bgOrient);

            // Compass on top of that
            var bgCompass = document.createElement("img");
            bgCompass.src = "assets/compassBackground.png";
            bgCompass.style.maxWidth = '100%';
            bgCompass.style.position = 'absolute';

            cont.appendChild(bgCompass);

            // Now add the compass POINTER
            var compassPointer = document.createElement("img");
            compassPointer.src = "assets/compassPointer.png";
            compassPointer.id = 'firstmate-compassPointer';
            compassPointer.style.overflow = 'hidden';
            compassPointer.style.maxWidth = '100%';
            //compassPointer.style.position = 'absolute';
            compassPointer.style.transform = 'rotate(' + _serverInfo.serverInfo.orientation * 45 + 'deg)';

            cont.appendChild(compassPointer);

            // when the mouse is down, start listening to mouse movements
            compassPointer.addEventListener('mousedown', function (ev) {
                this.addEventListener('mousemove', compassMove);

                // already register a mouse move
                compassMove(ev);
            }, false);

            // when the mouse is released, stop moving the compass, send a signal with update (only if it actually changed), update my own info (for tab switching)
            compassPointer.addEventListener('mouseup', function (ev) {
                this.removeEventListener('mousemove', compassMove);

                // Send signal to the server (with the new orientation)
                var newOrient = Math.round(compassPointer.getAttribute('data-angle') / 45);
                socket.emit('compass-up', newOrient);

                // Update serverInfo
                // Save the current orientation of the ship on the map (so we know what a compass change means)
                // (this is a trick to save the old orientation once, just before we change it, but not after that)
                if (_serverInfo.serverInfo.oldOrientation == undefined || _serverInfo.serverInfo.oldOrientation == _serverInfo.serverInfo.orientation) {
                    _serverInfo.serverInfo.oldOrientation = _serverInfo.serverInfo.orientation;
                }

                // Update our own orientation (to remember it when switching tabs)
                _serverInfo.serverInfo.orientation = newOrient;
            }, false);

            break;

        // Cartographer: 
        //  => display part of the map on canvas (centered on ship)
        //  => arrows to move around
        //  => current map level + upgrade button
        case 2:
            // TO DO

            // Get the canvas back
            var canvas = document.getElementById("canvas-container");
            canvas.style.display = 'block';
            cont.appendChild(canvas);

            // Resize canvas (simplified version of the prepInterface; we'll see if it works)
            // The canvas should be square, and width should be the limiting factor (never height)
            var paddingX = 20;
            var maxWidth = document.getElementById('shipInterface').clientWidth - paddingX * 2;
            canvas.myGame.scale.setGameSize(maxWidth, maxWidth);

            // LOAD THE MAP (or at least, the part that we can see)
            // Seed the noise generator
            noise.seed(_serverInfo.serverInfo.mapSeed);

            // Create graphics object
            var graphics = canvas.myGame.add.graphics(0, 0);

            var mapSize = 3;
            // Determine map size based on instrument level
            switch (_serverInfo.serverInfo.roleStats[2].lvl) {
                case 0:
                    mapSize = 3;
                    break;

                case 1:
                    mapSize = 5;
                    break;

                case 2:
                    mapSize = 5;
                    break;

                case 3:
                    mapSize = 7;
                    break;

                case 4:
                    mapSize = 7;
                    break;

                case 5:
                    mapSize = 9;
                    break;
            }

            // TO DO
            // this is the total size of the map (displayed on monitor)
            // it should be consistent across all devices
            var globalMapWidth = 60;
            var globalMapHeight = 30;

            var globalTileSize = 24.17; // TO DO this is the tile size used for the map on all devices, to keep it consistent
            var localTileSize = 120; // this is the tile size used for displaying the map on this device only (usually to make the squares bigger/more zoomed in)

            // Loop through our visible tiles
            // Make sure we center this around our ship!
            // Get the right noise value, color it correctly, display square of that color
            for (var y = 0; y < mapSize; y++) {
                for (var x = 0; x < mapSize; x++) {
                    var xTile = _serverInfo.serverInfo.x - Math.floor(0.5 * mapSize) + x;
                    if (xTile < 0) {
                        xTile += globalMapWidth;
                    }
                    if (xTile >= globalMapWidth) {
                        xTile -= globalMapWidth;
                    }

                    var yTile = _serverInfo.serverInfo.y - Math.floor(0.5 * mapSize) + y;
                    if (yTile < 0) {
                        yTile += globalMapHeight;
                    }
                    if (yTile >= globalMapHeight) {
                        yTile -= globalMapHeight;
                    }

                    var nx = xTile * globalTileSize;
                    var ny = yTile * globalTileSize;

                    var curVal = noise.perlin2(nx / 150, ny / 150);

                    // DEEP OCEAN
                    if (curVal < -0.3) {
                        graphics.beginFill(0x1036CC);
                        // SHALLOW OCEAN
                    } else if (curVal < 0.2) {
                        graphics.beginFill(0x4169FF);
                        // BEACH
                    } else if (curVal < 0.25) {
                        graphics.beginFill(0xEED6AF);
                        // ISLAND
                    } else {
                        graphics.beginFill(0x228B22);
                    }

                    graphics.drawRect(x * localTileSize, y * localTileSize, localTileSize, localTileSize);
                }
            }

            // Set world bounds to the map size
            canvas.myGame.world.setBounds(0, 0, mapSize * localTileSize, mapSize * localTileSize);

            // Load our ship drawing/image
            (0, _dynamicLoadImage2.default)(canvas.myGame, { x: 0, y: 0 }, { width: localTileSize, height: localTileSize }, 'myShip', _serverInfo.serverInfo.shipDrawing);

            // Make it possible to slide across the map (by moving mouse/finger over it)
            canvas.addEventListener('mousedown', startCanvasDrag, false);
            canvas.addEventListener('mouseup', stopCanvasDrag, false);

            // Add circular vignet over the image, so it looks like we're watching through binoculars/a telescope
            // This is a png image, with absolute positioning over the canvas, BECAUSE PHASER WOULDN'T LET ME DO IT IN A NORMAL WAY AAAAAAH I HATE MAAAASKS
            var vignetImg = document.createElement("img");
            vignetImg.src = 'assets/cartographerVignet.png';
            vignetImg.style.maxWidth = '100%';
            vignetImg.style.position = 'absolute';
            vignetImg.style.top = 0;
            vignetImg.style.pointerEvents = 'none';

            cont.appendChild(vignetImg);

            break;

        // Sailor: 
        //  => display ship side-view (in background)
        //  => vertical slider for choosing sail strength/height
        //  => horizontal slider for choosing paddle strength
        //  => current sail level + upgrade button
        case 3:
            // TO DO
            // When server receives the signal, check if there's enough CREW for this operation
            // (Release crew from the previous setting, then subtract for the new one.)
            // If there is, the setting is applied, and the updated crew information is sent to the captain
            // If there isn't ... error message?

            // Display ship bg (side-view, sails alongside slider)
            var bgShipSide = document.createElement("img");
            bgShipSide.src = "assets/shipGhostSide.png";
            bgShipSide.style.maxWidth = '100%';
            bgShipSide.style.position = 'absolute';
            bgShipSide.style.opacity = 0.5;
            bgShipSide.style.zIndex = -1;

            cont.appendChild(bgShipSide);

            // Determine max slider value (based on instrument level)
            var insLvl = [0, 0];
            switch (_serverInfo.serverInfo.roleStats[3].lvl) {
                case 0:
                    insLvl = [1, 1];
                    break;

                case 1:
                    insLvl = [2, 1];
                    break;

                case 2:
                    insLvl = [2, 2];
                    break;

                case 3:
                    insLvl = [3, 2];
                    break;

                case 4:
                    insLvl = [3, 3];
                    break;

                case 5:
                    insLvl = [4, 3];
                    break;
            }

            // Vertical slider for sails
            // Display numbers next to slider
            var rangeHint = document.createElement("span");
            rangeHint.style.position = 'absolute';
            for (var _i3 = 4; _i3 >= 0; _i3--) {
                var tempDiv = document.createElement("div");
                tempDiv.style.marginBottom = '15px';
                tempDiv.innerHTML = _i3;
                rangeHint.appendChild(tempDiv);
            }
            cont.appendChild(rangeHint);

            // Create the actual slider
            var vSlider = document.createElement("input");
            vSlider.type = 'range';
            vSlider.min = 0;
            vSlider.max = 4;
            vSlider.value = _serverInfo.serverInfo.roleStats[3].sailLvl;

            vSlider.style.transform = 'rotate(-90deg)';
            vSlider.style.marginTop = '70px';
            vSlider.style.width = 'auto';

            // If the slider was changed ...
            // NOTE: "on input" happens immediately after the change, "on change" only when element loses focus (and you can't be sure of that)
            vSlider.addEventListener('input', function () {
                var v = parseInt(this.value);

                // if we go beyond our maximum input, snap back immediately
                if (v > insLvl[0]) {
                    v = insLvl[0];
                    this.value = v;
                }

                // if it's the same as our current value, don't do anything
                if (_serverInfo.serverInfo.roleStats[3].sailLvl == v) {
                    return;
                }

                // ... send the new signal (a sail update)
                socket.emit('sail-up', v);

                // update personal stats
                _serverInfo.serverInfo.roleStats[3].sailLvl = v;
            });

            cont.appendChild(vSlider);

            // Horizontal slider for paddles
            // Display the actual slider
            var hSlider = document.createElement("input");
            hSlider.type = 'range';
            hSlider.min = 0;
            hSlider.max = 4;
            hSlider.value = _serverInfo.serverInfo.roleStats[3].peddleLvl;

            hSlider.style.width = '100%';
            hSlider.style.marginTop = '140px';
            hSlider.style.marginBottom = '10px';

            cont.appendChild(hSlider);

            // Display numbers underneath slider
            var rangeHint2 = document.createElement("span");
            rangeHint2.style.display = 'flex';
            rangeHint2.style.justifyContent = 'space-between';
            for (var _i4 = 0; _i4 < 5; _i4++) {
                var _tempDiv = document.createElement("div");
                _tempDiv.innerHTML = _i4;
                rangeHint2.appendChild(_tempDiv);
            }
            cont.appendChild(rangeHint2);

            // If the slider has changed ...
            hSlider.addEventListener('input', function () {
                var v = parseInt(this.value);

                // if we go beyond our maximum input, snap back immediately
                if (v > insLvl[1]) {
                    v = insLvl[1];
                    this.value = v;
                }

                // if it's the same as our current value, don't do anything
                if (_serverInfo.serverInfo.roleStats[3].peddleLvl == v) {
                    return;
                }

                // ... send the new signal (a peddle update)
                socket.emit('peddle-up', v);

                // update personal stats
                _serverInfo.serverInfo.roleStats[3].peddleLvl = v;
            });

            break;

        // Weapon Specialist:
        //  => display ship (top-view; shows where each cannon is)
        //  => display all cannons (bought or not, current load, loading button)
        case 4:
            // TO DO

            // Display ship (top-view, cannons numbered)
            var shipImg = document.createElement("img");
            shipImg.src = "assets/shipGhostTopCannons.png";
            shipImg.style.maxWidth = '100%';

            cont.appendChild(shipImg);

            // Display cannons
            var c = _serverInfo.serverInfo.shipCannons;

            var _loop2 = function _loop2(_i5) {
                // Create new div
                var cannonDiv = document.createElement("div");
                cannonDiv.classList.add("captain-crewMember");

                // Show cannon number
                var span = document.createElement("span");
                span.classList.add("weaponeer-cannonNumber");
                span.innerHTML = _i5 + 1;
                cannonDiv.appendChild(span);

                // If the current load is negative, this cannon hasn't been bought yet
                var curLoad = c[_i5];
                if (curLoad < 0) {
                    // Show "buy" button
                    var buyBtn = document.createElement("button");
                    buyBtn.classList.add('upgradeButton');

                    // Because we're buying, the function calculates the cumulative costs for going to the target level immediately (3rd parameter)
                    buyBtn.innerHTML = loadUpgradeButton(4, 0, _serverInfo.serverInfo.roleStats[4].lvl);
                    buyBtn.style.marginLeft = '40px';

                    cannonDiv.appendChild(buyBtn);

                    // When the button is clicked ...
                    buyBtn.addEventListener('click', function () {
                        // send signal
                        socket.emit('buy-cannon', _i5);

                        // set load to 0 (if its positive, the cannon has been bought)
                        _serverInfo.serverInfo.shipCannons[_i5] = 0;

                        // remove this button
                        this.remove();

                        // don't allow it to load (this turn)
                        _serverInfo.serverInfo.roleStats[4].cannonsLoaded[_i5] = true;
                    });
                } else {
                    // Show the current load ...
                    // ... 1) First load a background
                    var divLoad = document.createElement("div");
                    divLoad.classList.add("weaponeer-cannonLoadBg");
                    cannonDiv.appendChild(divLoad);

                    // ... 2) Then load the amount of guns/bullets/cannon balls on top
                    var spanLoad = document.createElement("span");
                    spanLoad.classList.add("weaponeer-cannonLoad");
                    spanLoad.style.width = curLoad * 10 + 'px';
                    divLoad.appendChild(spanLoad);

                    // If the cannon hasn't been loaded yet, this turn, display the button
                    if (!_serverInfo.serverInfo.roleStats[4].cannonsLoaded[_i5]) {
                        // Show "Load cannon" button
                        var loadBtn = document.createElement("button");
                        loadBtn.innerHTML = 'Load';
                        loadBtn.style.margin = '5px';
                        cannonDiv.appendChild(loadBtn);

                        // When the button is clicked ...
                        loadBtn.addEventListener("click", function () {
                            // send signal
                            socket.emit('load-up', _i5);

                            // update our own load
                            _serverInfo.serverInfo.shipCannons[_i5]++;

                            // remove this button
                            this.remove();

                            // don't allow it to load again (this turn)
                            _serverInfo.serverInfo.roleStats[4].cannonsLoaded[_i5] = true;
                        });
                    }
                }

                cont.appendChild(cannonDiv);
            };

            for (var _i5 = 0; _i5 < c.length; _i5++) {
                _loop2(_i5);
            }

            break;
    }

    // if no upgrade has been submitted yet, display the upgrade button
    // also, the captain (role 0) is the ONLY role without an upgrade button
    if (!_serverInfo.serverInfo.submittedUpgrade[num] && num != 0) {
        var upgradeBtn = document.createElement("button");
        upgradeBtn.classList.add("upgradeButton");

        // load the required resources for the NEXT level of this role 
        upgradeBtn.innerHTML = loadUpgradeButton(num, _serverInfo.serverInfo.roleStats[num].lvl + 1);

        // on click, send upgrade signal, remove this button, remember we've already upgraded
        upgradeBtn.addEventListener('click', function () {
            socket.emit('upgrade', num);

            this.remove();
            _serverInfo.serverInfo.submittedUpgrade[num] = true;
        });

        cont.appendChild(upgradeBtn);
    }
};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
// The upgrade dictionary contains the cost for each upgrade
// The structure is as follows:
//  - Top level = array, index represents role
//     - 2nd level = array, index represents level (you're upgrading TO)
//        - 3rd level = object, key is the resource, value is how many of them are needed

var UPGRADE_DICT = exports.UPGRADE_DICT = [[], // captain (has no upgrades)
[{}, { 2: 4 }, { 2: 6 }, { 0: 2, 2: 8 }, { 0: 5, 2: 10 }, { 0: 10, 2: 10 }], // first mate
[{}, { 2: 2 }, { 0: 2, 2: 5 }, { 0: 4, 2: 8 }, { 0: 6, 1: 1, 2: 10 }, { 0: 10, 1: 2, 2: 10 }], // cartographer
[{}, { 2: 4 }, { 1: 1, 2: 6 }, { 1: 2, 2: 8 }, { 0: 2, 1: 2, 2: 10 }, { 0: 5, 1: 3, 2: 10 }], // sailor
[{ 0: 5, 1: 1, 2: 10 }, { 2: 4 }, { 1: 1, 2: 7 }, { 0: 5, 2: 10 }, { 0: 5, 1: 1, 2: 10 }, { 0: 10, 1: 2, 2: 10 }] // weapon specialist
];

/***/ }),
/* 27 */
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

var _rejoinRoomModule = __webpack_require__(9);

var _rejoinRoomModule2 = _interopRequireDefault(_rejoinRoomModule);

var _roleDictionary = __webpack_require__(7);

var _loadTab = __webpack_require__(12);

var _loadTab2 = _interopRequireDefault(_loadTab);

var _timers = __webpack_require__(11);

var _loadErrorMessage = __webpack_require__(14);

var _loadErrorMessage2 = _interopRequireDefault(_loadErrorMessage);

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

      /**** DO SOME EXTRA INITIALIZATION *****/
      // loop through all the roles
      var roles = _serverInfo.serverInfo.myRoles;
      _serverInfo.serverInfo.roleStats = [{ lvl: 0 }, { lvl: 0 }, { lvl: 0 }, { lvl: 0 }, { lvl: 0 }];
      for (var i = 0; i < roles.length; i++) {
        var roleNum = roles[i];
        switch (roleNum) {
          // Captain needs to listen to resource changes
          case 0:
            // res-up => resource update
            socket.on('res-up', function (data) {
              // save the received resources
              _serverInfo.serverInfo.resources = data;

              // if the captain tab is currently displaying, update it
              if (curTab.num == 0) {
                for (var _i = 0; _i < data.length; _i++) {
                  document.getElementById('shipResource' + _i).innerHTML = data[_i];
                }
              }
            });

            // error-msg => error message (because another crew member screwed up)
            socket.on('error-msg', function (msg) {
              _serverInfo.serverInfo.errorMessages.push(msg);

              // if the captain tab is currently displaying, update it with the new error
              if (curTab.num == 0) {
                document.getElementById('tab0').appendChild((0, _loadErrorMessage2.default)(msg, _serverInfo.serverInfo.errorMessages.length - 1));
              }
            });

            break;

          // First mate
          // Set compass level to 0
          case 1:
            _serverInfo.serverInfo.roleStats[1].lvl = 0;

            break;

          // Cartographer
          // Set map/telescope level to 0
          case 2:
            _serverInfo.serverInfo.roleStats[2].lvl = 0;

            break;

          // Sailor
          // Set instrument level to 0
          case 3:
            _serverInfo.serverInfo.roleStats[3].lvl = 0;
            _serverInfo.serverInfo.roleStats[3].sailLvl = 0;
            _serverInfo.serverInfo.roleStats[3].peddleLvl = 0;

            break;

          // Weapon Specialist
          // Set cannon level to 0
          case 4:
            _serverInfo.serverInfo.roleStats[4].lvl = 0;

            // Also, create variable that checks if cannon has already been loaded
            _serverInfo.serverInfo.roleStats[4].cannonsLoaded = {};

            break;
        }
      }

      /**** DISPLAY INTERFACE *****/

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
      //let roles = serverInfo.myRoles;
      for (var _i2 = 0; _i2 < roles.length; _i2++) {
        var _roleNum = roles[_i2];

        // create a new tab object (with correct/unique label and z-index)
        var newTab = document.createElement("span");
        newTab.classList.add("shipRoleGroup");
        newTab.id = 'label' + _i2;
        newTab.style.zIndex = 5 - _i2;

        // add the ICON and the ROLE NAME within the tab
        newTab.innerHTML = '<img src="assets/pirate_flag.jpg"/><span class="shipRoleTitle">' + _roleDictionary.ROLE_DICTIONARY[_roleNum] + '</span>';

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
/* 28 */
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

var _rejoinRoomModule = __webpack_require__(9);

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