**TO DO**

***[Simplify]{.underline}***! Minder rollen, minder goederen, minder elementen in de \"simpele\" versie.

**Minder goederen:** geld, buskruit en hout lijken me het enige wat je nodig hebt in de "simpele versie"

> In de versie daarna krijg je ook ijzer en ??
>
> In de versie daarna krijg je specialistische stoffen: stof en kruiden.
>
> In de meest complexe versie gaat *eten* pas een rol spelen.

**Minder (complexe) rollen:** Ik denk dat we de Engineer (en evt. Merchant) het beste kunnen splitsen: één rol doet alleen wapens, één alleen schild, één alleen de zeilen, etc.

> **ELKE ROL DOET PRECIES ÉÉN DING**
>
> Maakt de interface een stuk simpeler en overzichtelijker.
>
> Maakt héél veel verschillende rollen mogelijk.
>
> De *merchant* lijkt me dan ook beter in de complexere versie en té moeilijk in de simpele versie.

**JA:** ik denk dat resources het beste in realtime kunnen worden geclaimd. Als jij iets wilt gebruiken, maar de *server* weet dat het niet kan (want iemand anders was je net voor), krijg je gewoon een *error* teruggestuurd en gebeurt niks.

**The compass of the First Mate:**

-   Create the arrow thingy

-   (Create compass and all as background)

-   If the user touches/clicks somewhere within the compass, the arrow immediately snaps to the *angle between the center and the point of touch*.

-   As long as the touch/click is still happening, the arrow keeps following

-   Once it is released, it stops following, *and the signal is sent*.

-   (Only update the value underneath once it is released, to show it needs to be released?)

**\
**

**Structure**

**[Game states]{.underline}**

This game only has a few different "states" (as opposed to my drawing game)

**[Monitor/Controller]{.underline}**: main screen (create/join/watch)

-   **Lobby**

-   **Preparation**

-   **Game**

-   **Game over**

The "game" state is by far the most complex, both on the computer and player side.

**[1. Lobby]{.underline}**

This is where players join. They pick a name and draw an avatar.

Once everybody is in, the VIP (first player to join) can start the game.

**[2. Preparation]{.underline}**

The server determines *how many boats* there will be and *which player is in which boat*.

The server also creates the *map*: sea and islands, treasure, special places, where sea monsters start, etc.

Every player gets a different screen, based on their role(s).

Once everyone has submitted the required info, the game automatically begins!

**[3. Game]{.underline}**

**[3.1 Game Loop]{.underline}**

The VIP player has a timer. Every time the timer runs out, it signals the server. The current turn ends, the next one begins.

This continues until the game ends; no exceptions.

**[3.2 Start of the turn]{.underline}**

At the start of a new turn, the server sends signals to both monitors and players.

**[Monitor:]{.underline}** updated map information.

-   New position of ships/monsters

-   New values for markets/docks/etc.

-   Claimed lands, treasures, etc.

-   *Messages* about what happened.

Remember, the monitor is mostly to keep everyone up to date on what happened. "X and Y attacked each other", "someone found an island", "someone discovered a treasure", etc.

**[Player:]{.underline}** every player gets three things:

-   **Your roles interface**. Every player has one or multiple roles on the ship; each role needs its own set of buttons/sliders/graphics/text.

-   **Status of your ship**: resources, health, other players aboard, position (?), etc.

-   **Results of last turn:** whether something was successful or not, whether you were attacked, etc.

**[3.3 During the turn]{.underline}**

Everyone can use the interface on their phone to do their actions.

**QUESTION:** Can they change their minds? Are button presses sent to the server *immediately*, or only once the turn ends?

You're free to talk, discuss with enemies or your own crewmates, look at the computer, etc.

**[3.4 End of turn]{.underline}**

The turn automatically ends once the timer runs out (on the VIP).

When the turn ends, the server checks whether the game is done or not.

**[3.5 End of game]{.underline}**

Simple games have only one condition: *collect all treasures on your ship*.

This will most likely be 3 or 5 treasures.

More complex games get more conditions:

-   Destroy all the other ships.

-   Take control of all the docks.

-   Keep possession of \<magic treasure something> for X turns.

If the game is not over, the next turn starts.

If it *is* over, we jump to the "game over" state.

**[4. Game over]{.underline}**

Both players and monitors get a (different) signal.

**[Monitor:]{.underline}** display winner, complete map, other (meaningful) results, funny details. (Make a sound/animation to show that the game is over and somebody won.)

**[Player:]{.underline}** see your own score, last ship status, funny details. VIP can restart/destroy game.

**Map Creation**

First idea: the map is a *square grid*. The game functions like a board game, and this is the easiest way to get people to understand.

TUTORIAL: <https://www.redblobgames.com/maps/terrain-from-noise/>

We use *perlin noise* (with random seed) to get an elevation map.

We add a few noise filters at different *frequencies*.

We raise it to quite a high power, so that we get islands. (Individual height differences don't matter anymore? Perhaps for coloring)

Everything below a certain threshold becomes water.

This is the map.

Now we need to "discover" and save the islands.

-   Loop through the grid

-   If we encounter an island square *not yet attached to an island*, we start a search.

-   We **recursively** check every square left/right/top/bottom, until we've found everything.

-   We save this set of squares as a single island.

-   We continue searching.

Once all the islands have been classified, we can place **docks** on the edges of the island. (A single dock per island??)

On random *island tiles* (without anything yet), we can drop treasure, resources, and other stuff.

Creating archipelagos: <https://medium.com/@yvanscher/playing-with-perlin-noise-generating-realistic-archipelagos-b59f004d8401>

Top-down infinite terrain generation:

<https://yorkcs.com/2019/02/25/top-down-infinite-terrain-generation-with-phaser-3/>

**WHAT NOISE FUNCTION TO USE?**

Simplex noise: <https://github.com/jwagner/simplex-noise.js?files=1>

Perlin noise:

<https://www.npmjs.com/package/perlin-noise>

My kind of guy (funny blog from game developer): <https://leatherbee.org/>

More about noise functions:

<https://computergraphics.stackexchange.com/questions/5846/how-to-modify-perlin-not-simplex-noise-to-create-continental-like-terrain-gene>

<https://stackoverflow.com/questions/6439350/simplex-noise-vs-perlin-noise>

**Role list**

Which roles are in the game, depends on the variant you're playing.

-   **Beginner:** Captain, First Mate, Merchant, Engineer

-   **Simple adds the** Sailor, (Oceanic) Specialist, Explorer, Communicator

-   **Advanced adds the** ??

-   **Expert adds the** ??

This also determines how many roles each player gets (on average, depends on team size of course).

-   **Beginner:** 1

-   **Simple:** 2

-   **Advanced:** 3

-   **Expert:** 4

There's also an option to randomize roles. (Certain ships may have roles that others simply *don't have*.)

**[Interface stuff]{.underline}**

At the top of the screen, you can see the name + color + icon of your boat.

Below that, you can see all the ship's resources.

Below that, there's a *tabbed* group containing all your roles.

> Use as many *affordances* as possible in the interface, to make it very intuitive and feel like you're commandeering a ship.

**[Captain]{.underline}**

**Preparation:** draw the ship and write a title.

**Interface:** a list of crew and tasks (dynamic)

**Task:** the captain has the final say. He determines whether to attack an enemy, whether to get off the boat and explore an island, whether to throw someone overboard, etc.

**Tip:** the captain should take control of the ship and enable good communication. He has the most information and is best equipped to make plans.

**[First Mate]{.underline}**

**Preparation:** draw a *flag* and write a *motto*.

**Interface:** a compass (circle slider)

**Task:** the first mate steers the ship. The ship will move in the direction the compass is pointing (at the start of the next turn).

**Tip:** it's your task to know, at all times, *where you are* and *where you need to go*. You should be in direct contact with the ??

**[Engineer]{.underline}**

**Preparation:** choose a few starting upgrades (like the merchant)??

**Interface:** the different components of the ship. Their health is shown underneath: if it is damaged, there's a button to repair.

Whether they are activated/loaded or not: a button to switch.

A button to upgrade the component to the next level.

**Tip:** The Engineer needs to make sure the right components are *full health* and *activated* at the right time. If you want to attack, but your cannons aren't available, you're screwed.

Additionally, he needs to upgrade his equipment regularly, to keep up with other ships. Make sure your captain sets aside some resources for you!

**IDEA:** The ship automatically breaks down over time (so you can't just stand still or wait around; also, it's realistic)

**IDEA:** The engineer has to put X amount of crewmen on a component to keep it active.

To repair it, you need a person AND the right amount of resources.

**QUESTION:** Can everybody allocate crewmen themselves, just like other resources? Or is that controlled by some sort of "crew officer"?

> And where has the role gone that decides the height/strength of the sails?

**PROBLEM:** To prevent conflicts in resources, they should be spent immediately? (If the engineer repairs something, and the merchant wants to trade 10 seconds later, it should have gone down and prevent the merchant from trading.

> The other solution is ALLOCATING resources. One player decides who gets what portion of the resources, once they have it, they can spend it.
>
> It seems more fun (and co-operative), though, to do it in realtime.

**[Merchant]{.underline}**

**Preparation:** distribute starting resources (everyone starts with X; you choose how to distribute them over the goods)

**Interface:** ??

**IDEA:** The merchant can "bid". Multiple players can bid on the same thing. At the end of the turn, the highest bid gets the resource, the rest gets nothing.

**IDEA:** The merchant can trade with other ships *in range*. (Their range is larger than the typical gun range?)

**IDEA:** The merchant is off boat most of the time? He can choose to depart, has his own boat, and can therefore find other boats to trade with?

**IDEA:** The merchant has inside information on where docks or resources are. (And he is the only one who can trade there?)

> Are the goods/prices in docks public information (monitor)? Seems like a good idea.
>
> This information "updates" every 5 turns or so, giving players time to reach the dock and make the deal.

**PROBLEM:** The merchant does not have much to do.

Should he be the one allocating resources? (Multiple people need crew -- who will get it? Multiple people need gun powder -- who will get it?)

**IDEA** (for radar): you only get a vague direction for where something/someone is? Like "to your left/right" or "below you"

> NO, that is a separate role: **The Psychic.** They get vague "visions", which they can use, especially if they logically combine multiple visions.

**IDEA:** "Verrekijkerpersoon"

This role can see the playing field through a circle (telescope).

This can be 2D, like watching the map from above.

It would be AWESOME, however, if this was 3D. Like actually sitting in the \<mast> and looking at the world around you.

> Perspective!
>
> Ships close by are bigger (and clearer) than ships far away.
>
> You can see islands, and their docks/landmarks.

If you upgrade the telescope, you can see more (some landmarks/ships/monsters would just be invisible at first), you can see further, you can see clearer, you can see through a bigger circle, etc.

**\
**

**BIG QUESTION:** How does the cartographer/first mate/radar thing work?

Can you see everything within a certain radius of yourself?

Can you pick a random spot on the map to "reveal" it? (But it will also be revealed on the big monitor for everyone else?)

Can you "tag" ships to follow them around?

Is the map divided into sectors, and can you check if a ship is within a certain sector?

Is the first mate *the only one* who knows where the ship actually is at all times?

> **Perhaps it's more fun if you *can't* choose where to start**.
>
> That way, you have to figure it out as you go along, which makes it even more of an exploration mechanic.

I just don't think it's very useful/fun if the first mate is just checking if something is nearby all game, or "randomly discovering" areas on the map.

**QUESTION:** What happens when a boat reaches an island? Can they go off the ship to explore the island?

> MAYBE you can send one player off the ship? He/she can grab whatever stuff there is and then come back.
>
> Or does the ship automatically "convert" to something that moves over land, so that none of the controls change?
>
> I actually like that "explorer" idea, because it ties into the "man overboard" idea. Once you're off the ship, you simply can't execute your roles anymore. You can only walk/swim around and pick stuff up.
>
> Your roles become "locked". Nobody can steal them from you, and they will be given back when you return.
>
> (If someone else wants to join the boat, they get someone else's role.)

**QUESTION:** How does combat work? Ranged? Do you need to be in the same space?

> The simplest thing is to have **weapons** and **shields**.
>
> Weapons do X damage.
>
> Shields reduce the damage by Y.
>
> Whatever is left hits the ship.

**QUESTION:** What about the seamonsters? I think they just have X attack and Y defense, and attack like any other ship.

> There does need to be something special about them. A way to evade them or use them on your opponents.

**IDEA:** In more complex variants, there's a **cook** and each ship (and player on his own?) needs to ensure enough food is available. (There's also **fishermen**?)

**IDEA**: At the end of the game, a TIMELINE is displayed with all events.

> For this to work, the server needs to save some of the biggest moments. (Fights are labeled "The Battle of blabla", ships going down, islands being discovered, treasures being found, sea monsters eating someone, etc.)

Role ideas: Cartographer, Seamonster Specialist, Cook, Cleaner, Entertainer, ??

**Communicator:** you can communicate in silence (on your phone) with other ships. This way, you can form alliances, exchange information, work together without anyone knowing it.

Seafaring Ranks: <https://en.wikipedia.org/wiki/Seafarer%27s_professions_and_ranks>

**In The Same Boat**

Alternatieve titels: "in hetzelfde schuitje"

Een Jackbox-achtig spel.

In dit spel besturen de spelers een aantal boten (afhankelijk van hoeveel spelers er zijn). Er is alleen één probleem: spelers moeten in groepjes een en dezelfde boot besturen!

Zo kan speler A alleen het stuur van de gele boot hebben, terwijl speler B de kanonnen van dat schip bestuurt, en speler C als enige de radar kan zien.

Elke boot heeft een gezamenlijke missie: **de schat vinden en in veiligheid brengen.** Terwijl ze dit doen moeten ze de speelkaart ontdekken, vechten met schepen van de tegenstanders, en nog veel meer.

Als een schip dit voor elkaar krijgt, eindigt het spel en hebben zij gewonnen.

Maar, iedere speler heeft ook nog een (of meerdere) persoonlijke missie(s)! Voor het volbrengen van zo'n missie krijgen ze extra punten, waardoor een speler alsnog in z'n eentje kan winnen.

**[\
]{.underline}**

**[Opzet]{.underline}**

Eerst moet iemand op een computer "create room" aanklikken.

Vervolgens kunnen alle spelers (met de gegeven roomcode) op "join room" klikken.

Iedereen die gejoind is krijgt een scherm te zien waarop ze kunnen tekenen. Hier tekenen ze hun *avatar*.

Als iedereen klaar is met tekenen, wordt op de server een random map gegenereerd enzo (perlin noise?), en worden de rollen toebedeeld

**Aantal schepen/spelers:**

-   2 spelers: 2 schepen (1 + 1)

-   3 spelers: 3 schepen (1 + 1 + 1)

-   4 spelers: 2 schepen (2 + 2)

-   5 spelers: 3 schepen (2 + 2 + 1)

-   6 spelers: 3 schepen (2 + 2 + 2)

-   7 spelers: 3 schepen (3 + 2 + 2)

-   8 spelers: 4 schepen (2 + 2 + 2 + 2)

-   9 spelers: 4 schepen (3 + 2 + 2 + 2)

-   10 spelers: 4 schepen (3 + 3 + 2 + 2)

BELANGRIJK: Bij nader inzien, misschien is minder schepen leuker, want dan moet je met een grotere groep samenwerken. **Of, het aantal schepen is random, dus je weet niet precies wat je krijgt?**

Elk schip krijgt een *kapitein*. De kapitein mag nog een leuke tekening maken van zijn schip. (Op het computerscherm worden de tekeningen van de avatars + schip gebruikt om de positie van schepen aan te geven.)

OPTIONEEL: Ook krijgt elk schip een *stuurman*. De stuurman mag de beginpositie van het schip bepalen. (Als diegene niks kiest wordt de beginpositie random gekozen.)

OPTIONEEL: Men krijgt een *handelaar*. Deze bepaalt met hoeveel men begint van elke grondstof. (Zo kan men kiezen voor een spetterend begin door heel veel kogels te kiezen, maar dat gaat dan ten koste van andere dingen.)

Als alle kapiteins hebben aangegeven dat ze klaar zijn, begint het spel.

**[Het spelverloop]{.underline}**

Het spel verloopt in rondes. Een ronde duurt 60 (of 90?) seconden. Gedurende zo'n ronde mag iedereen van alles overleggen en doen, zolang hun actie maar vóór het einde van de ronde verstuurd is.

Als de ronde eindigt, gaat de server alle informatie verwerken, en stuurt een geüpdatet versie van het spel terug. (Schepen zullen zijn verplaatst, eventueel is er een gevecht geweest, etc.)

De monitors worden ververst, en iedereen krijgt weer de nieuwe stand van zaken te zien op z'n smartphone.

**Belangrijk:** teams mogen *niet* naast elkaar gaan zitten (en/of meelezen op elkaars telefoon). De geheime missies zouden dit al moeten bereiken, maar ik zeg het er voor de zekerheid bij.

**[Hoe win je het spel?]{.underline}**

Er zijn 3 manieren om te winnen:

1.  Alle andere schepen vernietigen.

2.  Alle X (5?) de schatten verzamelen.

3.  ??

Wacht, als ik met een puntenaantal werk, is het geen kwestie van het spel "winnen", maar "de meeste punten hebben als het spel eindigt".

Is dit leuk? Wanneer eindigt het spel dan?

**AHA** ik zie in mijn introductie dat de missie was "de schat vinden en veilig stellen"

Dat kan op zich wel werken. Om dat te doen, moet je in leven blijven. Als iemand anders je verslaat, neemt diegene de schat namelijk van je over. Dus je moet je schip upgraden, ontdekken om grondstoffen te vinden, etc.

**[Welke rollen zijn er te verdelen?]{.underline}**

Iedereen krijgt een "tab-interface" op zijn smartphone. (Oftewel, bovenaan staan enkele tabs waarmee iemand van rol kan wisselen.) Afhankelijk van hoeveel spelers een schip besturen, kan iemand namelijk meerdere rollen hebben. (Want alle rollen zijn belangrijk en moeten in het spel zitten.)

Dit zijn alle mogelijke rollen:

-   **Kapitein:** heeft het laatste woord; bepaalt of men op een eiland aanmeert, of een grot verkent, of een ander schip aanvalt (of alleen maar handelt). Kan (geheime) berichten sturen naar iedereen (of alleen zijn team?!)

-   **Stuurman:** bepaalt welke richting de boot op gaat

-   **Cartograaf:** de cartograaf kan als enige de kaart (/"radar") lezen en nieuwe delen van de wereld ontdekken/verkennen

-   **Handelaar:** heeft een groot deel van de grondstoffen in zijn bezit, en bepaalt wanneer (en hoeveel) er gehandeld wordt

-   **Monteur:** repareert delen van het schip en kan dingen upgraden (naar een level 2 kanon, of level 2 zeil, etc.)

-   **Matroos:** knapt al het vuile werk op; de matroos moet verschillende onderdelen van het schip klaarzetten voor gebruik (door er matrozen aan te wijden)

**[Welke grondstoffen zijn er?]{.underline}**

Elk schip draagt een aantal grondstoffen met zich mee.

Deze grondstoffen kun je verkrijgen door ze te vinden op de kaart, door te handelen (eventueel met andere spelers), of door andere spelers te plunderen/bestelen.

De grondstoffen zijn:

-   **Goud:** geld waarmee je heel veel kunt kopen

-   **Hout:** voor reparatie/upgraden

-   **IJzer:** voor reparatie/upgraden

-   **Stof:** voor reparatie/upgraden

-   **Buskruit:** voor de wapens van het schip

-   **Kruiden:** om te verhandelen in ruil voor andere grondstoffen

-   **Matrozen:** de "mankracht" van je schip

**[Wat is er te zien op de controllers?]{.underline}**

Iedereen ziet bij welk schip hij hoort, zijn medeschipgenoten, en hoeveel het schip aan grondstoffen heeft (Dat betekent niet meteen dat iemand die grondstoffen ook kan controleren/besturen/bezitten.)

Daarnaast heb je dus de tab-interface waarop alleen de rollen staan die JIJ specifiek kan besturen.

Als jij je actie gedaan hebt, verdwijnen alle knopjes enzo ... totdat de volgende ronde komt en alles ververst.

**[Wat is er te zien op de monitors?]{.underline}**

Het liefst hou ik zoveel mogelijk geheim (en wordt die informatie alleen bekend bij schepen die er goed naar zoeken).

MAAR, het is veel leuker voor zo'n partyspel als er wel veel interactie is.

Ten eerste: het scherm vertelt wanneer bepaalde dingen zijn gebeurd, maar dan wel anoniem. ("Een schip heeft een eiland gevonden" of "Een schip heeft gevuurd")

> Een soort "pirate radio" of "ocean radio". Deze zegt ook soms dingen als: "een eiland op B3 bevat veel goud!" of "op C4 of D9 ligt een schat!"

Ten tweede: er zijn "gedeelde plekken". Bijvoorbeeld: eilanden waar een bepaalde hoeveelheid grondstoffen te vinden is. Door dit openbaar te maken wordt het een soort aantrekkingspunt waar veel mensen tegelijk naartoe kunnen gaan.

Ten derde: op de monitor is wel veel informatie te zien, maar daar heb je op zichzelf niks aan. Bijvoorbeeld: je kunt zien waar iemand *geweest* is (als een soort voetspoor). Gedurende het spel wordt wél steeds meer van de kaart en alles bekend.

Eventueel zie je wel *dat* ergens iets is, maar je ziet niet wiens schip het is, of dat het eigenlijk iets anders is, etc. ("Valse signalen?" Computertegenstanders? Zeemonsters!?)

**[Hoe werken gevechten?]{.underline}**

Elk schip heeft een bepaalde hoeveelheid "health". Je kunt een schip neerknallen tot het geen health meer heeft.

De kapitein die jullie verslagen heeft krijgt twee opties:

-   De verslagen scheepslieden kunnen lid worden van zijn schip. Zij krijgen dan allemaal een rol toebedeeld.

-   De verslagen scheepslieden mogen opnieuw beginnen. (Ze beginnen opnieuw op een random plek, met alle grondstoffen enzo gereset.)

Als een schip health verliest, kunnen er ook links en rechts dingen uitvallen. Die moeten dan gerepareerd worden voordat je ze weer kan gebruiken.

*Wanneer kun je met een schip vechten?* Als ze binnen X radius van jouw schip komen. (Waarbij X waarschijnlijk de radius van je kanonnen wordt.)

*Kun je ook vredelievend zijn?* Ja, je kunt een ander schip gewoon negeren. De handelaar kan er ook voor kiezen om te *handelen* met het andere schip.

*Kun je ook anderen plunderen?* Jup. Als een schip wordt aangevallen, kan de kapitein kiezen om te capituleren (in plaats van tegenaanvallen). Ze behouden hun schip, maar hun aanvallers mogen een hoop dingen stelen.

**[Hoe werken de geheime missies?]{.underline}**

Iedere speler heeft een eigen puntenaantal. Dit puntenaantal gaat omhoog als jouw schip iets goeds doet.

Maar, dit puntenaantal kun je zelf nóg verder omhoog brengen door je geheime missie te behalen. (Als jouw schip wint, én jij hebt de meeste punten, win jij in je eentje het hele spel.)

Voorbeelden van geheime missies (makkelijkere missies leveren natuurlijk minder punten op):

-   Vind \<een of ander zeldzaam voorwerp>

-   Zorg dat de schatkist (of een andere grondstof?) helemaal leeg raakt

-   Krijg \<speler> overboord gegooid.

-   Ontdek als eerste \<een of ander eiland>

-   Lever X kruiden (of een andere grondstof?) af bij \<een of andere plek of handelaar>)

-   Bereik de linker/rechter/boven/onder-uithoek van de kaart.

-   Handel X keer met een ander schip

JAAA: Als mensen een eiland ontdekken (of iets anders ... een grot? Een wereldwonder?) mogen ze het zelf een naam geven. Deze wordt dan op de monitor getoond; maar andere spelers weten niet precies wat de naam voorstelt.

JAAAA: Aan het begin mag iedereen ook een zeemonster tekenen EN ondertitelen. Die komen dan ook in het spel (waarbij de computer ze natuurlijk bestuurt en hun aanval/verdediging enzo bepaalt).

> Misschien is het handiger als men dit tekent *terwijl* de kapiteins hun boot tekenen.

JAAA: De kapitein (of een meerderheids-stemming tussen scheepslieden) mag kiezen om iemand overboord te gooien. Die persoon kan dan alleen nog maar rondzwemmen totdat een ander schip diegene oppikt.)

> Misschien is dit ook wat gebeurt als je schip wordt vernietigd? Je zwemt vanaf nu door het water en moet op zoek naar een ander schip?
