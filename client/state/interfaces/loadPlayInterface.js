import { serverInfo } from '../sockets/serverInfo'
import { SHIP_COLORS } from '../utils/shipColors'
import UPGRADE_DICT from '../../../vendor/upgradeDictionary'
import { ROLE_DICTIONARY } from '../utils/roleDictionary'
import LOAD_ERROR_MESSAGE from './loadErrorMessage'

import dynamicLoadImage from '../drawing/dynamicLoadImage'

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
    if(angle < 0) {
        angle += 360;
    }

    // Lock angle to compass level 
    // Determine the maximum rotation per turn (based on compass level)
    var deltaAngle = 180;
    switch(serverInfo.roleStats[1].lvl) {
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
    if(serverInfo.oldOrientation == undefined) {
        angleDiff = ( angle - serverInfo.orientation + 180 ) % 360 - 180;
    } else {
        angleDiff = ( angle - serverInfo.oldOrientation + 180 ) % 360 - 180;
    }

    if(angleDiff < -180) {
        angleDiff += 360
    }

    if(Math.abs(angleDiff) > deltaAngle) {
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
    document.getElementById('canvas-container').oldMovePoint = { x: ev.pageX, y: ev.pageY};

    document.addEventListener('mousemove', mapMove);
}

function stopCanvasDrag(ev) {
    document.removeEventListener('mousemove', mapMove);
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

    @parameter role => the role that wants an upgrade (every role only has one upgrade)
    @parameter level => the level we're upgrading TOWARDS
    @parameter serverInfo => global variable, in case we need it (for certain (cumulative) upgrades)
*/
function loadUpgradeButton(role, level, targetLevel = 0) {
    let costs = UPGRADE_DICT[role][level];
    let curString = '';

    // an upgrade to level 0 is the same as buying ...
    if(level == 0) {
        curString += '<span class="upgradeButtonLabel">Buy</span>';
    } else {
        curString += '<span class="upgradeButtonLabel">Upgrade (lv ' + level + ')</span>';
    }

    // if we're buying, we need to consider cumulative costs
    // because, the thing we buy will IMMEDIATELY be of the same level as this role's other instruments
    if(level == 0) {
        costs = {};

        // For each level ...
        for(let i = 0; i <= targetLevel; i++) {
            let c = UPGRADE_DICT[role][i];

            // Go through the different resource costs at this level ...
            for(let key in c) {
                // If this resource isn't in our costs yet, add it (with this value)
                if(costs[key] == undefined) {
                    costs[key] = c[key];
                // If this resource is already in the costs object, just add this value to it
                } else {
                    costs[key] += c[key];
                }
            }
        }
    }
    

    // display costs inside upgrade button
    for(let key in costs) {
        curString += '<span class="upgradeResourcesNeeded"><img src="assets/resourceIcon' + key + '.png" /><span>x' + costs[key] + '</span></span>';
    }

    return curString;
}

function loadFireButton() {
    // display the word 'FIRE!' (so the user knows what this button is doing)
    let curString = '<span class="upgradeButtonLabel">FIRE!</span>';

    // calculate the crew costs for firing the weapons
    // formula is this: for each added level, we need 1/2 crew member more PER CANNON
    // as a result, by rounding, the required crew per cannon ranges from 1 to 4.
    let costs = { 1: serverInfo.firingCosts };

    // display costs inside upgrade button
    for(let key in costs) {
        curString += '<span class="upgradeResourcesNeeded"><img src="assets/resourceIcon' + key + '.png" /><span>x' + costs[key] + '</span></span>';
    }

    return curString;
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
            // Display error messages
            // The loop is DESCENDING (rather than ASCENDING), because newer error messages should be displayed first
            let msg = serverInfo.errorMessages;
            for(let i = (msg.length - 1); i >= 0; i--) {
                if(msg[i] == null) {
                    continue;
                }

                cont.appendChild( LOAD_ERROR_MESSAGE(msg, i) );
            }

            // Loop through all tasks
            let tasks = serverInfo.taskList;
            for(let i = 0; i < tasks.length; i++) {
                if(tasks[i] == null) {
                    continue;
                }

                let taskType = tasks[i][0];
                let param = tasks[i][1];

                
                switch(taskType) {
                    // Battle => enemies are nearby
                    // No parameter necessary
                    case 0:
                        let span0 = document.createElement("span")
                        span0.classList.add("captain-task")
                        span0.innerHTML = "<p>One or more enemies are nearby. Attack?</p>"

                        let btn0 = document.createElement("button")
                        btn0.setAttribute('data-taskid', i);
                        btn0.classList.add('upgradeButton');
                        btn0.innerHTML = loadFireButton();
                        span0.appendChild(btn0);

                        btn0.addEventListener('click', function() {
                            // send signal to server
                            socket.emit('fire');

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span0.remove();
                        })
                        
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
                        inp1.placeholder = "Tortuga";
                        span1.appendChild(inp1)

                        let btn1 = document.createElement("button")
                        btn1.setAttribute('data-taskid', i);
                        btn1.innerHTML = 'Submit name'
                        span1.appendChild(btn1)

                        btn1.addEventListener('click', function() {
                            // prevent submitting an empty name
                            if(inp1.value.length < 1) {
                                return;
                            }

                            // send signal to server
                            socket.emit('name-island', { name: inp1.value, island: param } );

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span1.remove();
                        })

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

                        let btn2 = document.createElement("button")
                        btn2.setAttribute('data-taskid', i);
                        btn2.innerHTML = 'Perform trade'
                        span2.appendChild(btn2)

                        btn2.addEventListener('click', function() {
                            // send signal to server
                            socket.emit('dock-trade');

                            // TO DO 
                            // just update the resources immediately here, then we don't need to send/receive another signal

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span2.remove();
                        })

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
                this.addEventListener('mousemove', compassMove);

                // already register a mouse move
                compassMove(ev);
            }, false);

            // when the mouse is released, stop moving the compass, send a signal with update (only if it actually changed), update my own info (for tab switching)
            compassPointer.addEventListener('mouseup', function (ev) {
                this.removeEventListener('mousemove', compassMove);

                // Send signal to the server (with the new orientation)
                // (below, we check if the orientation actually changed, and only THEN send the signal)
                let newOrient = Math.round(compassPointer.getAttribute('data-angle') / 45);

                // Update serverInfo
                // Save the current orientation of the ship on the map (so we know what a compass change means)
                // (this is a trick to save the old orientation once, just before we change it, but not after that)
                if((serverInfo.oldOrientation == undefined) || (serverInfo.oldOrientation == serverInfo.orientation)) {
                    serverInfo.oldOrientation = serverInfo.orientation
                }

                // if these two are equal, we didn't change course, so we wouldn't send a signal
                if(newOrient != serverInfo.oldOrientation) {
                    socket.emit('compass-up', newOrient);
                }

                // Update our own orientation (to remember it when switching tabs)
                serverInfo.orientation = newOrient;
            }, false);

            break;

        // Cartographer: 
        //  => display part of the map on canvas (centered on ship)
        //  => arrows to move around
        //  => current map level + upgrade button
        case 2:
            // Get the canvas back
            let canvas = document.getElementById("canvas-container")
            canvas.style.display = 'block';
            cont.appendChild(canvas);

            // Resize canvas (simplified version of the prepInterface; we'll see if it works)
            // The canvas should be square, and width should be the limiting factor (never height)
            let paddingX = 20;
            let maxWidth = document.getElementById('shipInterface').clientWidth - paddingX*2;
            canvas.myGame.scale.setGameSize(maxWidth, maxWidth)

            // LOAD THE MAP (or at least, the part that we can see)
            // Seed the noise generator
            noise.seed(serverInfo.mapSeed);

            // Create graphics object
            var graphics = canvas.myGame.add.graphics(0, 0);

            let mapSize = 3;
            // Determine map size based on instrument level
            switch(serverInfo.roleStats[2].lvl) {
                case 0:
                    mapSize = 3;
                    break;

                case 1:
                    mapSize = 5
                    break;

                case 2:
                    mapSize = 5
                    break;

                case 3:
                    mapSize = 7
                    break;

                case 4:
                    mapSize = 7
                    break;

                case 5:
                    mapSize = 9
                    break;
            }

            // TO DO
            // this is the total size of the map (displayed on monitor)
            // it should be consistent across all devices
            let globalMapWidth = 60;
            let globalMapHeight = 30;

            let globalTileSize = 24.17; // TO DO this is the tile size used for the map on all devices, to keep it consistent
            let localTileSize = 120; // this is the tile size used for displaying the map on this device only (usually to make the squares bigger/more zoomed in)

            // Loop through our visible tiles
            // Make sure we center this around our ship!
            // Get the right noise value, color it correctly, display square of that color
            for (let y = 0; y < mapSize; y++) {
                for (let x = 0; x < mapSize; x++) {
                    let xTile = serverInfo.x - Math.floor(0.5*mapSize) + x
                    if(xTile < 0) { xTile += globalMapWidth } else if(xTile >= globalMapWidth) { xTile -= globalMapWidth }

                    let yTile = serverInfo.y - Math.floor(0.5*mapSize) + y
                    if(yTile < 0) { yTile += globalMapHeight } else if(yTile >= globalMapHeight) { yTile -= globalMapHeight }

                    let nx = xTile*globalTileSize;
                    let ny = yTile*globalTileSize;

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
            canvas.myGame.world.setBounds(0, 0, mapSize*localTileSize, mapSize*localTileSize);

            // Display units (the server determines which ones you can see, based on range and instrument level)
            
            // TO DO
            // As of right now, I just displays our own ship.
            // This information should be sent at the start of each turn, saved, and then read from "serverInfo.mapUnits"
            // NOTE: The server determines what we can see. We don't need to check this. We just display everything that's been given to us.
            serverInfo.mapUnits = [ { x: serverInfo.x, y: serverInfo.y, index: serverInfo.myShip } ];

            let u = serverInfo.mapUnits;
            for(let i = 0; i < u.length; i++) {
                let unit = u[i];

                // coordinates need to be recalculated, using our own ship as the center
                let x = unit.x - serverInfo.x + Math.floor(0.5*mapSize);
                let y = unit.y - serverInfo.y + Math.floor(0.5*mapSize);

                // Fetch image from a different list, based on unit type (this is always a dataURI, even for stuff that isn't drawn by the players)
                // ALso determine the UNIQUE label for this unit type
                // 0 = ship, 1 = monster, 2 = ai ship, 3 = dock
                let dataURI;
                let label;
                if(unit.myType == 0) {
                    dataURI = serverInfo.shipDrawings[unit.index];
                    label = 'shipNum' + unit.index; 
                } else if(unit.myType == 1) {
                    dataURI = serverInfo.monsterDrawings[unit.index];
                    label = 'monsterNum' + unit.index;
                }

                // the (x + 0.5) is needed, becase the image is centered (anchor is set to 0.5, 0.5)
                dynamicLoadImage(canvas.myGame, { x: (x + 0.5)*localTileSize, y: (y + 0.5)*localTileSize }, { width: localTileSize, height: localTileSize }, label, dataURI)
            }

            // Make it possible to slide across the map (by moving mouse/finger over it)
            canvas.addEventListener('mousedown', startCanvasDrag, false)
            canvas.addEventListener('mouseup', stopCanvasDrag, false)

            // Add circular vignet over the image, so it looks like we're watching through binoculars/a telescope
            // This is a png image, with absolute positioning over the canvas, BECAUSE PHASER WOULDN'T LET ME DO IT IN A NORMAL WAY AAAAAAH I HATE MAAAASKS
            let vignetImg = document.createElement("img");
            vignetImg.src = 'assets/cartographerVignet.png';
            vignetImg.style.maxWidth = '100%'
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
            // Display ship bg (side-view, sails alongside slider)
            let bgShipSide = document.createElement("img");
            bgShipSide.src = "assets/shipGhostSide.png";
            bgShipSide.style.maxWidth = '100%'
            bgShipSide.style.position = 'absolute';
            bgShipSide.style.opacity = 0.5;
            bgShipSide.style.zIndex = -1;

            cont.appendChild(bgShipSide);

            // Determine max slider value (based on instrument level)
            let insLvl = [0,0];
            switch(serverInfo.roleStats[3].lvl) {
                case 0:
                    insLvl = [1,1];
                    break;

                case 1:
                    insLvl = [2,1]
                    break;

                case 2:
                    insLvl = [2,2]
                    break;

                case 3:
                    insLvl = [3,2]
                    break;

                case 4:
                    insLvl = [3, 3]
                    break;

                case 5:
                    insLvl = [4, 3]
                    break;
            }

            // Vertical slider for sails
            // Display numbers next to slider
            let rangeHint = document.createElement("span");
            rangeHint.style.position = 'absolute';
            for(let i = 4; i >= 0; i--) {
                let tempDiv = document.createElement("div");
                tempDiv.style.marginBottom = '15px';
                tempDiv.innerHTML = i;
                rangeHint.appendChild(tempDiv);
            }
            cont.appendChild(rangeHint);

            // Create the actual slider
            let vSlider = document.createElement("input");
            vSlider.type = 'range'
            vSlider.min = 0
            vSlider.max = 4
            vSlider.value = serverInfo.roleStats[3].sailLvl;

            vSlider.style.transform = 'rotate(-90deg)';
            vSlider.style.marginTop = '70px';
            vSlider.style.width = 'auto';

            // If the slider was changed ...
            // NOTE: "on input" happens immediately after the change, "on change" only when element loses focus
            // We want the latter, because we only send a signal when the user RELEASES the slider. Otherwise, we would send way too many (unnecessary) signals.
            vSlider.addEventListener('change', function() {
                let v = parseInt(this.value);

                // if we go beyond our maximum input, snap back immediately
                if(v > insLvl[0]) {
                    v = insLvl[0];
                    this.value = v;
                }

                // if it's the same as our current value, don't do anything
                if(serverInfo.roleStats[3].sailLvl == v) {
                    return;
                }

                // ... send the new signal (a sail update)
                socket.emit('sail-up', v);

                // update personal stats
                serverInfo.roleStats[3].sailLvl = v;
            })

            cont.appendChild(vSlider);

            // Horizontal slider for paddles
            // Display the actual slider
            let hSlider = document.createElement("input")
            hSlider.type = 'range'
            hSlider.min = 0
            hSlider.max = 4
            hSlider.value = serverInfo.roleStats[3].peddleLvl;
            
            hSlider.style.width = '100%';
            hSlider.style.marginTop = '140px';
            hSlider.style.marginBottom = '10px';

            cont.appendChild(hSlider);

            // Display numbers underneath slider
            let rangeHint2 = document.createElement("span");
            rangeHint2.style.display = 'flex';
            rangeHint2.style.justifyContent = 'space-between';
            for(let i = 0; i < 5; i++) {
                let tempDiv = document.createElement("div");
                tempDiv.innerHTML = i;
                rangeHint2.appendChild(tempDiv);
            }
            cont.appendChild(rangeHint2);

            // If the slider has changed ...
            hSlider.addEventListener('change', function() {
                let v = parseInt(this.value);

                // if we go beyond our maximum input, snap back immediately
                if(v > insLvl[1]) {
                    v = insLvl[1];
                    this.value = v;
                }

                // if it's the same as our current value, don't do anything
                if(serverInfo.roleStats[3].peddleLvl == v) {
                    return;
                }

                // ... send the new signal (a peddle update)
                socket.emit('peddle-up', v);

                // update personal stats
                serverInfo.roleStats[3].peddleLvl = v;
            })

            break;

        // Weapon Specialist:
        //  => display ship (top-view; shows where each cannon is)
        //  => display all cannons (bought or not, current load, loading button)
        case 4:
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
                span.classList.add("weaponeer-cannonNumber");
                span.innerHTML = (i + 1);
                cannonDiv.appendChild(span);

                // If the current load is negative, this cannon hasn't been bought yet
                let curLoad = c[i];
                if(curLoad < 0) {
                    // Show "buy" button
                    let buyBtn = document.createElement("button")
                    buyBtn.classList.add('upgradeButton');

                    // Because we're buying, the function calculates the cumulative costs for going to the target level immediately (3rd parameter)
                    buyBtn.innerHTML = loadUpgradeButton(4, 0, serverInfo.roleStats[4].lvl)
                    buyBtn.style.marginLeft = '40px';

                    cannonDiv.appendChild(buyBtn);

                    // When the button is clicked ...
                    buyBtn.addEventListener('click', function() {
                        // send signal
                        socket.emit('buy-cannon', i);

                        // set load to 0 (if its positive, the cannon has been bought)
                        serverInfo.shipCannons[i] = 0;

                        // display a message (to fill space AND to notify the user that he/she did something)
                        let tempParagraph = document.createElement('p');
                        tempParagraph.innerHTML = 'A purchase request has been sent.';
                        cannonDiv.appendChild(tempParagraph);

                        // remove this button
                        this.remove();

                        // don't allow it to load (this turn)
                        serverInfo.roleStats[4].cannonsLoaded[i] = true;
                    })
                } else {
                    // Show the current load ...
                    // ... 1) First load a background
                    let divLoad = document.createElement("div");
                    divLoad.classList.add("weaponeer-cannonLoadBg");
                    cannonDiv.appendChild(divLoad);

                    // ... 2) Then load the amount of guns/bullets/cannon balls on top
                    let spanLoad = document.createElement("span");
                    spanLoad.classList.add("weaponeer-cannonLoad")
                    spanLoad.style.width = (curLoad * 10) + 'px';
                    divLoad.appendChild(spanLoad);

                    // If the cannon hasn't been loaded yet, this turn, display the button
                    if(!serverInfo.roleStats[4].cannonsLoaded[i]) {
                        // Show "Load cannon" button
                        let loadBtn = document.createElement("button")
                        loadBtn.innerHTML = 'Load';
                        loadBtn.style.margin = '5px';
                        cannonDiv.appendChild(loadBtn);

                        // When the button is clicked ...
                        loadBtn.addEventListener("click", function() {
                            // send signal
                            socket.emit('load-up', i);

                            // update our own load
                            serverInfo.shipCannons[i]++;

                            // remove this button
                            this.remove();

                            // don't allow it to load again (this turn)
                            serverInfo.roleStats[4].cannonsLoaded[i] = true;
                        })
                    }

                }

                cont.appendChild(cannonDiv);
            }

            break;
    }

    // if no upgrade has been submitted yet, display the upgrade button
    // also, the captain (role 0) is the ONLY role without an upgrade button
    if(!serverInfo.submittedUpgrade[num] && num != 0) {
        let upgradeBtn = document.createElement("button");
        upgradeBtn.classList.add("upgradeButton");

        // load the required resources for the NEXT level of this role 
        upgradeBtn.innerHTML = loadUpgradeButton(num, (serverInfo.roleStats[num].lvl + 1) );

        // on click, send upgrade signal, remove this button, remember we've already upgraded
        upgradeBtn.addEventListener('click', function() {
            socket.emit('upgrade', num);

            this.remove();
            serverInfo.submittedUpgrade[num] = true;
        })

        cont.appendChild(upgradeBtn);
    }

};