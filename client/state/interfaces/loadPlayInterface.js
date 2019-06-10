import { serverInfo } from '../sockets/serverInfo'
import { SHIP_COLORS } from '../utils/shipColors'

/*
    The functions below are HELPER FUNCTIONS for specific roles (that require interactivity beyond basic DOM stuff)
    (At the bottom of this file, the main "loadPlayInterface" function can be found)

    The compass needs to be moved (and snapped) to certain angles

    The cartographer needs to move the map around

*/
function compassMove(ev) {
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

    // Snap angle to fixed directions (8 dir, around center)
    angle = Math.round(angle / 45) * 45;

    document.getElementById('firstmate-compassPointer').style.transform = 'rotate(' + angle + 'deg)';
    document.getElementById('firstmate-compassPointer').setAttribute('data-angle', angle);
}

function mapMove(ev) {
    let cv = document.getElementById('canvas-container')

    // get movement delta
    var dx = ev.pageX - cv.oldMovePoint.x;
    var dy = ev.pageY - cv.oldMovePoint.y

    // move camera according to delta
    cv.myGame.camera.x += dx;
    cv.myGame.camera.y += dy;

    // update oldMovePoint
    cv.oldMovePoint = { x: ev.pageX, y: ev.pageY };
}

/*
    This function loads the preparation interface for each role

    @parameter num => the number of the role to be loaded
    @parameter cont => the container into which to load the interface

*/
export default function loadPlayInterface(num, cont) { 
    let socket = serverInfo.socket

    // This switch statement loads the required buttons, inputs, sliders, etc. for a given role
    // It takes its settings from "serverInfo", which sould have the information (from a pre-signal)

	switch(num) {
        // **Captain**: 
        //  => display list of tasks (changes all the time; given by server)
        //  => display ship resources (only the 4 basic ones: gold, crew, wood, guns)
        case 0:
            // TO DO: Make buttons actually work
            // TO DO: When you've performed a task, remove it from the interface and pop it off the task list

            // Loop through all tasks
            let tasks = serverInfo.taskList;
            for(let i = 0; i < tasks.length; i++) {
                let taskType = tasks[i][0];
                let param = tasks[i][1];

                switch(taskType) {
                    // Battle => enemies are nearby
                    // No parameter necessary
                    case 0:
                        let span0 = document.createElement("span")
                        span0.classList.add("captain-task")
                        span0.innerHTML = "<p>One or more enemies are nearby. Attack?</p>"

                        // TO DO: Make button actually send the fire signal
                        let btn0 = document.createElement("button")
                        btn0.innerHTML = 'FIRE!'
                        span0.appendChild(btn0);
                        
                        cont.appendChild(span0);

                        break;

                    // Discovery => an island has been discovered, and you may give it a name
                    // @parameter index of the island
                    case 1:
                        let span1 = document.createElement("span")
                        span1.classList.add("captain-task")
                        span1.innerHTML = "<p>You have discovered a mysterious island! What will you name it?</p>"

                        let inp1 = document.createElement("input")
                        inp1.type = "text"
                        span1.appendChild(inp1)

                        // TO DO: Make button actually submit the name
                        let btn1 = document.createElement("button")
                        btn1.innerHTML = 'Submit name'
                        span1.appendChild(btn1)

                        cont.appendChild(span1)

                        break;

                    // Dock => you are adjacent to a dock and may trade
                    // @parameter the index of the dock (so you know what you can trade)
                    case 2:
                        let span2 = document.createElement("span")
                        span2.classList.add("captain-task")
                        span2.innerHTML = "<p>You are docked at a harbor. Want to trade?</p>"

                        // TO DO: Actually display the proposed trade
                        span2.innerHTML += '<p><em>This feature doesn\'t work at the moment. BE PATIENT.</em></p>'

                        // TO DO: Make button actually perform the trade
                        let btn2 = document.createElement("button")
                        btn2.innerHTML = 'Perform trade'
                        span2.appendChild(btn2)

                        cont.appendChild(span2)

                        break;
                }
            }

            // Display resources underneath
            let resHeading = document.createElement("h1");
            resHeading.innerHTML = 'Resources'
            cont.appendChild(resHeading)

            let resDiv = document.createElement("div");
            resDiv.id = 'shipResources'

            // TO DO: Write (and receive) signal that updates these resource stats
            for(let i = 0; i < 4; i++) {
                let curResVal = serverInfo.resources[i];

                resDiv.innerHTML += '<span class="shipResourceGroup"><img src="assets/resourceIcon' + i + '.png"><span id="shipResource' + i + '">' + curResVal + '</span></span>';
            }

            cont.appendChild(resDiv)

            break;

        // **First mate**: 
        //  => display current orientation (in background)
        //  => compass (rotatable; sends info when released)
        //  => current compass level + upgrade button
        case 1:
            // TO DO

            // Current orientation in background
            let bgOrient = document.createElement("img");
            bgOrient.src = "assets/shipGhostTopCompass.png";
            bgOrient.style.maxWidth = '100%'
            bgOrient.style.position = 'absolute';
            bgOrient.style.opacity = 0.5;

            if(serverInfo.oldOrientation == undefined) {
                bgOrient.style.transform = 'rotate(' + serverInfo.orientation * 45 + 'deg)';
            } else {
                bgOrient.style.transform = 'rotate(' + serverInfo.oldOrientation * 45 + 'deg)';
            }
            

            cont.appendChild(bgOrient);

            // Compass on top of that
            let bgCompass = document.createElement("img");
            bgCompass.src = "assets/compassBackground.png";
            bgCompass.style.maxWidth = '100%'
            bgCompass.style.position = 'absolute';

            cont.appendChild(bgCompass);

            // Now add the compass POINTER
            // TO DO (question): on which element do we put the onclick/ontouch events? The pointer, or the background image (which has a larger and more consistent area)
            // TO DO: Set pointer to current rotation (by default), constrain it based on compass level
            //        => The ghost of the ship should be set to the "old rotation" (at start of turn), the pointer to the current one
            let compassPointer = document.createElement("img");
            compassPointer.src = "assets/compassPointer.png";
            compassPointer.id = 'firstmate-compassPointer';
            compassPointer.style.overflow = 'hidden';
            compassPointer.style.maxWidth = '100%'
            //compassPointer.style.position = 'absolute';
            compassPointer.style.transform = 'rotate(' + serverInfo.orientation * 45 + 'deg)';

            cont.appendChild(compassPointer);

            // when the mouse is down, start listening to mouse movements
            compassPointer.addEventListener('mousedown', function (ev) {
                document.addEventListener('mousemove', compassMove);

                // already register a mouse move
                compassMove(ev);
            }, false);

            // when the mouse is released, stop moving the compass, send a signal with update (only if it actually changed), update my own info (for tab switching)
            compassPointer.addEventListener('mouseup', function (ev) {
                document.removeEventListener('mousemove', compassMove);

                // TO DO: send signal

                // Update serverInfo
                // Save the current orientation of the ship on the map (so we know what a compass change means)
                // (this is a trick to save the old orientation once, just before we change it, but not after that)
                if((serverInfo.oldOrientation == undefined) || (serverInfo.oldOrientation == serverInfo.orientation)) {
                    serverInfo.oldOrientation = serverInfo.orientation
                }

                // Update our own orientation (to remember it when switching tabs)
                serverInfo.orientation = Math.round(compassPointer.getAttribute('data-angle') / 45);
            }, false);

            // Finally, add the upgrade button
            // TO DO: Send signal that actually upgrades the thing
            // TO DO: The button overlaps the compass, because that is set to position: absolute. Can I just remove that style property?
            let compassUpgradeBtn = document.createElement("button");
            compassUpgradeBtn.classList.add("upgradeButton");
            compassUpgradeBtn.innerHTML = 'Upgrade';

            cont.appendChild(compassUpgradeBtn);

            break;

        // Cartographer: 
        //  => display part of the map on canvas (centered on ship)
        //  => arrows to move around
        //  => current map level + upgrade button
        case 2:
            // TO DO

            // Get the canvas back
            let canvas = document.getElementById("canvas-container")
            canvas.style.display = 'block';
            cont.appendChild(canvas);

            // Resize canvas (simplified version of the prepInterface; we'll see if it works)
            // THe canvas should be square, and width should be the limiting factor (never height)
            let paddingX = 20;
            let maxWidth = document.getElementById('shipInterface').clientWidth - paddingX*2;
            canvas.myGame.scale.setGameSize(maxWidth, maxWidth)

            // LOAD THE MAP (or at least, the part that we can see)
            // Seed the noise generator
            noise.seed(serverInfo.mapSeed);

            // Create graphics object
            var graphics = canvas.myGame.add.graphics(0, 0);

            // TO DO: Update these parameters to restrict to the part we can see, and center around our ship
            // TO DO: Make map seamless: numbers that are too low (negative) or too high (beyond map size) should be clipped to the other side
            let mapWidth = 20;
            let mapHeight = 20;
            let globalTileSize = 40; // this is the tile size used for the map on all devices, to keep it consistent
            let localTileSize = 40; // this is the tile size used for displaying the map on this device only (usually to make the squares bigger/more zoomed in)

            // Loop through our visible tiles
            // Get the right noise value, color it correctly, display square of that color
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    let nx = x*globalTileSize;
                    let ny = y*globalTileSize;

                    let curVal = noise.perlin2(nx / 150, ny / 150);

                    // DEEP OCEAN
                    if(curVal < -0.3) {
                        graphics.beginFill(0x1036CC);
                    // SHALLOW OCEAN
                    } else if(curVal < 0.2) {
                        graphics.beginFill(0x4169FF);
                    // BEACH
                    } else if(curVal < 0.25) {
                        graphics.beginFill(0xEED6AF);
                    // ISLAND
                    } else {
                        graphics.beginFill(0x228B22);
                    }

                    graphics.drawRect(x*localTileSize, y*localTileSize, localTileSize, localTileSize);
                }
            }

            // Set world bounds to the map size
            canvas.myGame.world.setBounds(0, 0, mapWidth*localTileSize, mapHeight*localTileSize);

            // TO DO: Remove these events when switching to a different role? Otherwise we might get event leak between different roles with a canvas and it will screw us up.
            // Make it possible to slide across the map (by moving mouse/finger over it)
            canvas.addEventListener('mousedown', function (ev) {
                // save the first point
                canvas.oldMovePoint = { x: ev.pageX, y: ev.pageY};

                document.addEventListener('mousemove', mapMove);
            }, false);

            canvas.addEventListener('mouseup', function (ev) {
                document.removeEventListener('mousemove', mapMove);
            }, false);

            // Add circular vignet over the image, so it looks like we're watching through binoculars/a telescope
            // This is a png image, with absolute positioning over the canvas, BECAUSE PHASER WOULDN'T LET ME DO IT IN A NORMAL WAY AAAAAAH I HATE MAAAASKS
            let vignetImg = document.createElement("img");
            vignetImg.src = 'assets/cartographerVignet.png';
            vignetImg.style.maxWidth = '100%'
            vignetImg.style.position = 'absolute';
            vignetImg.style.top = 0;
            vignetImg.style.pointerEvents = 'none';

            cont.appendChild(vignetImg);

            // Finally, add the upgrade button
            // TO DO: Send signal that actually upgrades the thing
            let mapUpgradeBtn = document.createElement("button");
            mapUpgradeBtn.classList.add("upgradeButton");
            mapUpgradeBtn.innerHTML = 'Upgrade';

            cont.appendChild(mapUpgradeBtn);

            break;

        // Sailor: 
        //  => display ship side-view (in background)
        //  => vertical slider for choosing sail strength/height
        //  => horizontal slider for choosing paddle strength
        //  => current sail level + upgrade button
        case 3:
            // TO DO

            // Display ship bg (side-view, sails alongside slider)
            let bgShipSide = document.createElement("img");
            bgShipSide.src = "assets/shipGhostSide.png";
            bgShipSide.style.maxWidth = '100%'
            bgShipSide.style.position = 'absolute';
            bgShipSide.style.opacity = 0.5;
            bgShipSide.style.zIndex = -1;

            cont.appendChild(bgShipSide);

            // Vertical slider for sails
            // TO DO: Send signal (and update my own info) onchange
            let vSlider = document.createElement("input");
            vSlider.type = 'range'
            vSlider.min = 0
            vSlider.max = 4

            vSlider.style.transform = 'rotate(-90deg)';
            vSlider.style.marginTop = '70px';
            vSlider.style.width = 'auto';

            cont.appendChild(vSlider);

            // Horizontal slider for paddles
            // TO DO: Send signal (and update my own info) onchange
            let hSlider = document.createElement("input")
            hSlider.type = 'range'
            hSlider.min = 0
            hSlider.max = 4
            
            hSlider.style.width = '100%';
            hSlider.style.marginTop = '140px';
            hSlider.style.marginBottom = '10px';

            cont.appendChild(hSlider);

            // Finally, add the upgrade button
            // TO DO: Send signal that actually upgrades the thing
            let upgradeBtn = document.createElement("button");
            upgradeBtn.classList.add("upgradeButton");
            upgradeBtn.innerHTML = 'Upgrade';

            cont.appendChild(upgradeBtn);

            break;

        // Weapon Specialist:
        //  => display ship (top-view; shows where each cannon is)
        //  => display all cannons (bought or not, level + upgrade button, current load)
        case 4:
            // TO DO

            // Display ship (top-view, cannons numbered)
            let shipImg = document.createElement("img");
            shipImg.src = "assets/shipGhostTopCannons.png";
            shipImg.style.maxWidth = '100%'

            cont.appendChild(shipImg);

            // Display cannons
            let c = serverInfo.shipCannons;

            for(let i = 0; i < c.length; i++) {
                // Create new div
                let cannonDiv = document.createElement("div");
                cannonDiv.classList.add("captain-crewMember");

                // Show cannon number
                let span = document.createElement("span");
                span.innerHTML = '#' + i;
                cannonDiv.appendChild(span);

                // If the current load is negative, this cannon hasn't been bought yet
                if(c[i].load < 0) {
                    // Show "buy" button
                    // TO DO: Send signal on click (and update my own cannonList + interface)
                    let buyBtn = document.createElement("button")
                    buyBtn.innerHTML = 'BUY';
                    cannonDiv.appendChild(buyBtn);
                } else {
                    // Show the current load

                    // First load a background
                    let divLoad = document.createElement("div");
                    divLoad.classList.add("weaponeer-cannonLoadBg");
                    cannonDiv.appendChild(divLoad);

                    // Then load the amount of guns/bullets/cannon balls on top
                    let spanLoad = document.createElement("span");
                    spanLoad.classList.add("weaponeer-cannonLoad")
                    spanLoad.style.width = (c[i].load*10) + 'px';
                    divLoad.appendChild(spanLoad);

                    // Show "Load cannon" button
                    // TO DO: Send signal on click (and update my own cannonList + interface)
                    let loadBtn = document.createElement("button")
                    loadBtn.innerHTML = 'LOAD';
                    cannonDiv.appendChild(loadBtn);

                    // Show "upgrade button"
                    // TO DO: Send signal on click (and update my own cannonList + interface)
                    let upgradeBtn = document.createElement("button")
                    upgradeBtn.innerHTML = 'UPGRADE';
                    upgradeBtn.classList.add('upgradeButton');
                    cannonDiv.appendChild(upgradeBtn);
                }

                cont.appendChild(cannonDiv);
            }

            break;
    }

};