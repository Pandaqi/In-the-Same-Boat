// replace this with 'http://localhost:8000' to test locally
// use 'https://trampolinedraak.herokuapp.com' for production
const serverInfo = {
  SERVER_IP: 'http://localhost:8000', /*'https://trampolinedraak.herokuapp.com',*/
  socket: null,
  server: null,
  roomCode: '',
  vip: false,
  playerCount: -1,

  timer: 0,

  language: 'en',

  // These variables are for the player interface only
  // They keep track of what you've already done/seen/activated
  submittedPreparation: {},
  submittedUpgrade: {},
  errorMessages: [],

  // Backup ship drawing, in case preparation is skipped
  shipDrawings: ["data:image/png;base64,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"],
}

// language/translator object
// serverInfo gets the language used in-game from the server, and also provides the translate function
// not the cleanest approach ...
let LANG = {}

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
  'player-disconnect-2': "You can wait until the player(s) rejoin. (To do so, they must rejoin the same room with the exact same name.) You can also continue without them, or stop the game completely.",
}

// dutch
LANG['nl'] = {
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
  'player-disconnect-2': "Je kunt wachten tot alle spelers weer opnieuw verbonden zijn. (Om dat te doen, moeten ze exact dezelfde kamer met exact dezelfde gebruikersnaam joinen.) Je kunt ook kiezen om zonder hen verder te spelen, of het spel compleet te beëindigen.",
}

serverInfo.translate = function(key) {
  let curlang = this.language

  // if language doesn't exist, use english as default
  if(LANG[curlang] == undefined || LANG[curlang][key] == undefined) {
    curlang = 'en'
  }

  if(LANG[curlang][key] == undefined) {
    return ' <- string cannot be translated ->'
  } else {
    return LANG[curlang][key]
  }
}

export { serverInfo }
