import { serverInfo } from '../sockets/serverInfo'
import { SHIP_COLORS } from '../utils/shipColors'

import UPGRADE_DICT from '../../../vendor/upgradeDictionary'
import UPGRADE_EFFECT_DICT from '../../../vendor/upgradeEffectsDictionary'

import { ROLE_DICTIONARY } from '../utils/roleDictionary'
import LOAD_ERROR_MESSAGE from './loadErrorMessage'

import noise from '../../../vendor/perlinImproved'

/*
    The functions below are HELPER FUNCTIONS for specific roles (that require interactivity beyond basic DOM stuff)
    (At the bottom of this file, the main "loadPlayInterface" function can be found)

    The compass needs to be moved (and snapped) to certain angles

    The cartographer needs to move the map around

    The sailor needs to calculate which sail/peddle levels it may set (mostly based on max speed and max change)

*/
function compassMove(ev) {
    ev.preventDefault();

    // rotate compass to match angle between mouse and center of compass

    // find center of compass
    var image1 = document.getElementById('firstmate-compassPointer');
    var rect1 = image1.getBoundingClientRect();
    var centerCoords = { x: rect1.left + rect1.width * 0.5, y: rect1.top + rect1.height * 0.5 };

    // get click position (mouse is default; otherwise use touch)
    let coords = { x: ev.pageX, y: ev.pageY }
    if(ev.type == 'touchmove') {
        coords = { x: ev.touches[0].pageX, y: ev.touches[0].pageY }
    }

    // calculate difference vector, determine angle from that
    var vec = [coords.x - centerCoords.x, coords.y - centerCoords.y];
    var angle = Math.atan2(vec[1], vec[0]) * 180 / Math.PI;
    if(angle < 0) {
        angle += 360;
    }

    // Lock angle to compass level 
    // Determine the maximum rotation per turn (based on compass level)
    var deltaAngle = UPGRADE_EFFECT_DICT[1][serverInfo.roleStats[1].lvl].angle;

    // get distance from current angle to current ship orientation
    // if this distance is above delta, you're too far
    let getOldOrientation = serverInfo.oldOrientation * 45; // convert old orientation into degrees
    var angleDiff = ( angle - getOldOrientation + 180 ) % 360 - 180;

    if(angleDiff < -180) {
        angleDiff += 360
    }

    if(Math.abs(angleDiff) > deltaAngle) {
        return;
    } else {
        // Snap angle to fixed directions (8 dir, around center)
        // Make sure angle is within the [0,360] range with a modulo
        angle = Math.round((angle % 360) / 45) * 45;

        // Update compass pointer
        document.getElementById('firstmate-compassPointer').style.transform = 'rotate(' + angle + 'deg)';
        document.getElementById('firstmate-compassPointer').setAttribute('data-angle', angle);
    }
    
}

/*
    This function sends the value of the compass to the server, once you've released it

    @socket => the current socket (used for sending the signal)
    @curOrientation => the current arrow orientation on the client, which is exactly the info we need to send
*/
function sendCompassInformation(socket, curOrientation) {
    // Send signal to the server (with the new orientation)
    // (below, we check if the orientation actually changed, and only THEN send the signal)
    let newOrient = Math.round(curOrientation / 45);

    // if these two are equal, we didn't change course, so we wouldn't send a signal
    if(newOrient != serverInfo.oldOrientation) {
        socket.emit('compass-up', newOrient);
    }

    // Update our own orientation (to remember it when switching tabs)
    serverInfo.orientation = newOrient;
}

function startCanvasDrag(ev) {
    // prevent actually dragging the image (which is default behaviour for most browsers in this situation)
    ev.preventDefault();

    // get coordinates (default is mouse; otherwise get touch)
    let coords = { x: ev.pageX, y: ev.pageY }
    if(ev.type == 'touchstart') {
        coords = { x: ev.touches[0].pageX, y: ev.touches[0].pageY }
    }

    // save the first point (on the canvas)
    document.getElementById('canvas-container').oldMovePoint = coords;

    document.addEventListener('mousemove', mapMove);
    document.addEventListener('touchmove', mapMove);
}

function stopCanvasDrag(ev) {
    document.removeEventListener('mousemove', mapMove);
    document.removeEventListener('touchmove', mapMove);
}

function mapMove(ev) {
    ev.preventDefault();

    let cv = document.getElementById('canvas-container')

    // get coordinates (default is mouse; otherwise touch)
    let coords = { x: ev.pageX, y: ev.pageY }
    if(ev.type == 'touchmove') {
        coords = { x: ev.touches[0].pageX, y: ev.touches[0].pageY }
    }

    // get movement delta
    var dx = coords.x - cv.oldMovePoint.x;
    var dy = coords.y - cv.oldMovePoint.y

    // move camera according to delta
    cv.myGame.camera.x += dx;
    cv.myGame.camera.y += dy;

    // update oldMovePoint
    cv.oldMovePoint = coords;
}

function disableForbiddenMoves() {
    /* There are four reasons a move might be forbidden:
        => It changes the ship speed to a negative number
        => It changes the ship speed to a number ABOVE max speed
        => It changes the ship speed by TOO MUCH in a single turn 
        => It changes sail/peddles to a negative number (we can't have -1 crew rowing the boat")

       This function goes through all the moves and marks the forbidden ones.

       Then, we make sure to display these options as "forbidden", AND disallow pulling the slider towards it
    */

    // get old speed
    let oldSpeed = serverInfo.oldSpeed;

    // get old sail/peddle level
    let oldSail = serverInfo.roleStats[3].oldSailLvl;
    let oldPeddle = serverInfo.roleStats[3].oldPeddleLvl;

    // get new/current sail/peddle level
    let curSail = serverInfo.roleStats[3].sailLvl;
    let curPeddle = serverInfo.roleStats[3].peddleLvl;

    // get speed stats
    const speedStats = UPGRADE_EFFECT_DICT[3][serverInfo.roleStats[3].lvl];
    let maxSpeed = speedStats.speed;
    let maxChange = speedStats.change;

    // range for saving forbidden moves: lowest number allowed, highest number allowed
    // this will be set once we start marking forbidden options
    let allowedSailRange = [0,0];
    let allowedPeddleRange = [0,0];


    // determine range of change
    const changeRange = Math.ceil( (serverInfo.roleStats[3].lvl + 1) / 4);

    // check sail levels (assuming current peddle stays constant)
    for(let i = -changeRange; i <= changeRange; i++) {
        let newSpeed = oldSpeed + (curPeddle - oldPeddle) + i;

        if((oldSail + i) < 0 || newSpeed < 0 || newSpeed > maxSpeed || Math.abs(newSpeed - oldSpeed) > maxChange) {
            document.getElementById('sailor-sail' + i).classList.add('sailor-forbidden');
            document.getElementById('sailor-sailCost' + i).classList.add('sailor-forbidden');
        } else {
            document.getElementById('sailor-sail' + i).classList.remove('sailor-forbidden');
            document.getElementById('sailor-sailCost' + i).classList.remove('sailor-forbidden');

            // Mark as ALLOWED
            // => check if the number is outside the current range; if so, update the range (to be bigger)!
            if(i < allowedSailRange[0]) {
                allowedSailRange[0] = i;
            } else if(i > allowedSailRange[1]) {
                allowedSailRange[1] = i;
            }

        }
    }

    // check peddle levels (assuming current sail stays constant)
    for(let i = -changeRange; i <= changeRange; i++) {
        let newSpeed = oldSpeed + (curSail - oldSail) + i;

        if((oldPeddle + i) < 0 || newSpeed < 0 || newSpeed > maxSpeed || Math.abs(newSpeed - oldSpeed) > maxChange) {
            document.getElementById('sailor-peddle' + i).classList.add('sailor-forbidden');
            document.getElementById('sailor-peddleCost' + i).classList.add('sailor-forbidden');
        } else {
            document.getElementById('sailor-peddle' + i).classList.remove('sailor-forbidden');
            document.getElementById('sailor-peddleCost' + i).classList.remove('sailor-forbidden');

            // Mark as ALLOWED
            // => check if the number is outside the current range; if so, update the range (to be bigger)!
            if(i < allowedPeddleRange[0]) {
                allowedPeddleRange[0] = i;
            } else if(i > allowedPeddleRange[1]) {
                allowedPeddleRange[1] = i;
            }
        }
    }

    serverInfo.roleStats[3].allowedSailRange = allowedSailRange;
    serverInfo.roleStats[3].allowedPeddleRange = allowedPeddleRange;
  
    // Debugging
    console.log("Allowed Sail Range", allowedSailRange);
    console.log("Allowed Peddle Range", allowedPeddleRange);
}

function sailorSlider(ev) {
    let curEl = ev.target;

    let tempRect = curEl.getBoundingClientRect(); 
    let offset = {
        top: tempRect.top + document.body.scrollTop,
        left: tempRect.left + document.body.scrollLeft
    }

    // differentiate between mouse and touch movements (and get the right coordinates)
    let coords = { x: ev.pageX, y: ev.pageY }
    if(ev.type == 'touchmove' || ev.type == 'touchstart') {
        coords = { x: ev.touches[0].pageX, y: ev.touches[0].pageY }
    } else {
        // in fact, just ignore this whole thing if we're not on a touchscreen
        // the default behaviour of sliders should take over and should work fine
        return;
    }

    let minValue = parseInt(curEl.min);
    let fullValue = parseInt(curEl.max) - minValue;

    // differentiate between the horizontal and vertical slider
    let cors, percent, val;
    if(curEl.id == "sailor-sailInput") {
        cors = (coords.y - offset.top);
        percent = cors / tempRect.height; 
        val = - ( minValue + Math.round( fullValue * percent) ); // invert value, because slider is inverted
    } else {
        cors = (coords.x - offset.left); // get the X on the slider itself, by subtracting slider X coordinate by page X coordinate
        percent = cors / tempRect.width; // get the percentage on the slider
        val = minValue + Math.round( fullValue * percent); // value is minimum value, plus full width multiplied by the percentage (from the click)
    }

    console.log(offset);
    console.log(tempRect.width, tempRect.height);
    console.log(coords.x, cors, percent, val);

    // set slider to new value
    curEl.setAttribute('data-value', val)

    // dispatch the event to update the shizzle
    let ghostEvent = new CustomEvent("input");
    curEl.dispatchEvent(ghostEvent);
}

/*

    @parameter role => the role that wants an upgrade (every role only has one upgrade)
    @parameter level => the level we're upgrading TOWARDS
    @parameter targetLevel => level we're building towards (for certain (cumulative) upgrades)
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

function loadAskAroundButton() {
    // display the word 'EXPLORE!' (this button controls both exploring parts of the ocean and asking around in cities)
    let curString = '<span class="upgradeButtonLabel">ASK AROUND!</span>';

    // calculate the crew costs for asking around
    // TO DO: For now, it always costs 1 crew
    //        (also, don't forget to sync this between client and server)
    let costs = { 1: 1 };

    // display costs inside upgrade button
    for(let key in costs) {
        curString += '<span class="upgradeResourcesNeeded"><img src="assets/resourceIcon' + key + '.png" /><span>x' + costs[key] + '</span></span>';
    }

    return curString;
}

function loadExploreButton() {
    // display the word 'EXPLORE!' (this button controls both exploring parts of the ocean and asking around in cities)
    let curString = '<span class="upgradeButtonLabel">EXPLORE!</span>';

    // calculate the crew costs for exploration
    // TO DO: For now, it always costs 1 crew
    //        (also, don't forget to sync this between client and server)
    let costs = { 1: 1 };

    // display costs inside upgrade button
    for(let key in costs) {
        curString += '<span class="upgradeResourcesNeeded"><img src="assets/resourceIcon' + key + '.png" /><span>x' + costs[key] + '</span></span>';
    }

    return curString;
}

function loadDeal(deal) {
    const resDict = ['Gold', 'Crew', 'Wood', 'Ammo']; //resDict[ deal[0][0] ] for resource as a string

    const good1 = '<strong>' + deal[0][1] + ' x </strong><img src="assets/resourceIcon' + deal[0][0] + '.png" />'
    const good2 = '<img src="assets/resourceIcon' + deal[1][0] + '.png" />' + '<strong> x ' + deal[1][1] + '</strong>'

    return '<p class="captain-dockDeal">' + good1 + ' ==> ' + good2 + '</p>';
}

function displayUpgradeStats(role, level) {
    let curStats = UPGRADE_EFFECT_DICT[role][level]

    // TO DO: On max level, don't get next stats, and don't display stuff about it
    // Right now, it would throw an error trying to get level 7 (index 6) from the array
    let nextStats = UPGRADE_EFFECT_DICT[role][(level+1)]

    let curString = '';

    for(let key in curStats) {
        let curLevel = curStats[key];
        let nextLevel = nextStats[key]

        // display which property is being upgraded (get it directly from the object)
        curString += key + ': ';

        // display the current level of this property
        curString += curLevel;

        // display next level (if you were to upgrade)
        if(nextLevel > curLevel) {
            curString += ' <span style="color:lightgreen;">(&uarr;' + nextLevel + ')</span>'
        } else if(nextLevel == curLevel) {
            curString += ' <span>(&middot;' + nextLevel + ')</span>'
        } else if(nextLevel < curLevel) {
            curString += ' <span style="color:red;">(&darr;' + nextLevel + ')</span>'
        }
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
            let errorMsgContainer = document.createElement("span");
            errorMsgContainer.id = 'captain-errorMessageContainer'

            let msg = serverInfo.errorMessages;
            for(let i = (msg.length - 1); i >= 0; i--) {
                if(msg[i] == null) {
                    continue;
                }

                errorMsgContainer.appendChild( LOAD_ERROR_MESSAGE(i) );
            }

            cont.appendChild(errorMsgContainer);

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
                    // No parameter.
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

                        // Display the proposed trade, saved in serverInfo.dockTrade
                        // TO DO: Make the trade look nice (with icons and all)
                        span2.innerHTML = loadDeal(param.deal);

                        let btn2 = document.createElement("button")
                        btn2.setAttribute('data-taskid', i);
                        btn2.innerHTML = 'Perform trade'
                        span2.appendChild(btn2)

                        btn2.addEventListener('click', function() {
                            // send signal to server
                            socket.emit('dock-trade', param.index);

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span2.remove();
                        })

                        cont.appendChild(span2)

                        break;

                    // Discovery => a dock has been discovered, and you may give it a name
                    // @parameter index of the dock
                    case 3:
                        let span3 = document.createElement("span")
                        span3.classList.add("captain-task")
                        span3.innerHTML = "<p>You have found a new dock! What will you name it?</p>"

                        let inp3 = document.createElement("input")
                        inp3.type = "text"
                        inp3.placeholder = "Diddly Dock";
                        span3.appendChild(inp3)

                        let btn3 = document.createElement("button")
                        btn3.setAttribute('data-taskid', i);
                        btn3.innerHTML = 'Submit name'
                        span3.appendChild(btn3)

                        btn3.addEventListener('click', function() {
                            // prevent submitting an empty name
                            if(inp3.value.length < 1) {
                                return;
                            }

                            // send signal to server
                            socket.emit('name-dock', { name: inp3.value, dock: param } );

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span3.remove();
                        })

                        cont.appendChild(span3)

                        break;

                    // Discovery => a city has been discovered, and you may give it a name
                    // @parameter index of the city
                    case 4:
                        let span4 = document.createElement("span")
                        span4.classList.add("captain-task")
                        span4.innerHTML = "<p>You stumbled upon a small town! What will you name it?</p>"

                        let inp4 = document.createElement("input")
                        inp4.type = "text"
                        inp4.placeholder = "City of Stars";
                        span4.appendChild(inp4)

                        let btn4 = document.createElement("button")
                        btn4.setAttribute('data-taskid', i);
                        btn4.innerHTML = 'Submit name'
                        span4.appendChild(btn4)

                        btn4.addEventListener('click', function() {
                            // prevent submitting an empty name
                            if(inp4.value.length < 1) {
                                return;
                            }

                            // send signal to server
                            socket.emit('name-city', { name: inp4.value, city: param } );

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span4.remove();
                        })

                        cont.appendChild(span4)

                        break;

                    // Exploration => you are near a city and can ask around for clues
                    // @parameter index of the city
                    case 5:
                        let span5 = document.createElement("span")
                        span5.classList.add("captain-task")
                        span5.innerHTML = "<p>The people in this town might know something. Do you want to ask around? (Leave empty for a random clue.)</p>"

                        let inp5 = document.createElement("input")
                        inp5.type = 'text';
                        inp5.placeholder = '... name of treasure here ...';
                        span5.appendChild(inp5);

                        let btn5 = document.createElement("button")
                        btn5.setAttribute('data-taskid', i);
                        btn5.classList.add('upgradeButton');
                        btn5.innerHTML = loadAskAroundButton();
                        span5.appendChild(btn5)

                        btn5.addEventListener('click', function() {
                            // send signal to server
                            socket.emit('explore-city', { ind: param, name: inp5.value });

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span5.remove();
                        })

                        cont.appendChild(span5)

                        break;

                    // Exploration => you are at (deep) sea and can dive in search of clues
                    // @parameter ??
                    case 6:
                        let span6 = document.createElement("span")
                        span6.classList.add("captain-task")
                        span6.innerHTML = "<p>Want to dive and search for treasure?</p>"

                        let btn6 = document.createElement("button")
                        btn6.setAttribute('data-taskid', i);
                        btn6.classList.add('upgradeButton');
                        btn6.innerHTML = loadExploreButton();
                        span6.appendChild(btn6)

                        btn6.addEventListener('click', function() {
                            // send signal to server
                            socket.emit('explore-tile');

                            // pop this task off the list
                            // set it to null; it will just be ignored from now on
                            serverInfo.taskList[this.getAttribute('data-taskid')] = null;

                            // remove this whole task block
                            span6.remove();
                        })

                        cont.appendChild(span6)

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

            bgOrient.style.transform = 'rotate(' + serverInfo.oldOrientation * 45 + 'deg)';
            
            cont.appendChild(bgOrient);

            // Compass on top of that
            let bgCompass = document.createElement("img");
            bgCompass.src = "assets/compassBackground.png";
            bgCompass.style.maxWidth = '100%'
            bgCompass.style.position = 'absolute';

            cont.appendChild(bgCompass);

            // Show which part of the compas is disabled/"forbidden"
            /***

                CREATING SVG ARC

            ***/
            const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            // set width and height
            svg1.setAttribute("width", "100%");
            svg1.setAttribute("viewBox", "0 0 100 100")
            svg1.style.position = "absolute";

            // get maximum steering angle + current orientation
            let deltaAngle = UPGRADE_EFFECT_DICT[1][serverInfo.roleStats[1].lvl].angle;
            let oldOrientation = serverInfo.oldOrientation;

            // Don't display anything if we have full steering range
            if(deltaAngle < 180) {
              // get how large the gap should be
              let targetAngle = (0 + deltaAngle*2) * 180 / Math.PI;

                // if we have no range, we need to make a "dot" at our current rotation, and make the rest a circle 
              if(targetAngle == 0) { targetAngle = 0.1 }

                // set circle parameters
              let cx = 50, cy = 50, rx = 45, ry = 45
              let lineSize = 3;

                // determine start and end position
              let startPos = { x: cx + rx, y: cy }
              let endPos = { x: cx + Math.cos(targetAngle) * rx, y: cy + Math.sin(targetAngle) * ry}

              // determine large and sweep flags 
              // (to ensure the arc always follows a circle)
              let largeArc = 1;
              if(deltaAngle >= 90) {
                largeArc = 0;
              }

              let sweepFlag = 1;
              if(deltaAngle == 0) {
                sweepFlag = 0;
              }

              // move to start point, draw arc towards end point, make it a large arc.
              let tempPath = 'M ' + startPos.x + ' ' + startPos.y + ' ';
              tempPath += 'A ' + rx + ' ' + ry + ' 0 ' + largeArc + ' ' + sweepFlag + ' ' + endPos.x + ' ' + endPos.y;

              // create path (according to tempPath template)
              let newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");    
              newpath.setAttributeNS(null, "d", tempPath);  
              newpath.setAttributeNS(null, "stroke", "red"); 
              newpath.setAttributeNS(null, "stroke-width", lineSize);  
              newpath.setAttributeNS(null, "fill", "none");
              newpath.setAttributeNS(null, "stroke-linecap", "round")

              // add this path (which is an arc with a gap) to the SVG element
              svg1.appendChild(newpath)
            }

            // add complete SVG element to the container
            cont.appendChild(svg1)

            // the SVG creates some overlap by rounding the arc stroke
            // we need to offset this by adding 10 degrees to the final rotation, but only if there's actually a gap
            if(deltaAngle != 0) {
                deltaAngle += 10;
            }

            // rotate the SVG to match current ship rotation
            svg1.style.transform = 'rotate(' + (oldOrientation * 45 + deltaAngle) + 'deg)';

            /***

                END OF SVG ARC CODE

            ***/

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
                compassMove(ev); // already register a mouse move
            }, false);

            // do the same for touch events
            compassPointer.addEventListener('touchstart', function (ev) {
                ev.preventDefault();

                this.addEventListener('touchmove', compassMove);
                compassMove(ev);
            }, false);

            // when the mouse is released, stop moving the compass, send a signal with update (only if it actually changed), update my own info (for tab switching)
            compassPointer.addEventListener('mouseup', function (ev) {
                this.removeEventListener('mousemove', compassMove);
                sendCompassInformation(socket, compassPointer.getAttribute('data-angle'));
            }, false);

            // do the same for touch events
            compassPointer.addEventListener('touchend', function (ev) {
                ev.preventDefault();

                this.removeEventListener('touchmove', compassMove);
                sendCompassInformation(socket, compassPointer.getAttribute('data-angle'));
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

            // Get map size from the upgrade effect dictionary. 
            // This size is a "radius", so transform it into the actual region of tiles around the ship
            let mapSize = UPGRADE_EFFECT_DICT[2][serverInfo.roleStats[2].lvl].range * 2 + 1;

            // TO DO: Not used at the moment (might only be needed at the server)
            let detailSize = UPGRADE_EFFECT_DICT[2][serverInfo.roleStats[2].lvl].detail * 2 + 1;

            // this is the total size of the map (displayed on monitor)
            // it should be consistent across all devices
            let globalMapWidth = serverInfo.config.mapWidth;
            let globalMapHeight = serverInfo.config.mapHeight;

            // this is the tile size used for displaying the map on this device only (usually to make the squares bigger/more zoomed in)
            // FIRST PARAMETER: the larger the map, the LESS zoomed in you are, thus tiles are SMALLER
            // SECOND PARAMETER: however, the width of a player's screen can vary, and thus the canvas size can be larger than tiles allow => calculate the minimum tile size to fill the whole canvas
            let localTileSize = Math.max(120 - mapSize*5, Math.ceil(maxWidth / mapSize) + 10)

            // Loop through our visible tiles
            // Make sure we center this around our ship!
            // Get the right noise value, color it correctly, display square of that color
            let dx = serverInfo.config.dx, dy = serverInfo.config.dy;
            for (let y = 0; y < mapSize; y++) {
                for (let x = 0; x < mapSize; x++) {
                    let xTile = serverInfo.x - Math.floor(0.5*mapSize) + x
                    if(xTile < 0) { xTile += globalMapWidth } else if(xTile >= globalMapWidth) { xTile -= globalMapWidth }

                    let yTile = serverInfo.y - Math.floor(0.5*mapSize) + y
                    if(yTile < 0) { yTile += globalMapHeight } else if(yTile >= globalMapHeight) { yTile -= globalMapHeight }

                    // 4D noise => wraps back to 2D map with seamless edges
                    let s = xTile / globalMapWidth
                    let t = yTile / globalMapHeight
                    let pi = Math.PI

                    // Walk over two independent circles (perpendicular to each other)
                    let nx = Math.cos(s*2*pi) * dx / (2*pi)
                    let nz = Math.sin(s*2*pi) * dy / (2*pi)

                    let ny = Math.cos(t*2*pi) * dx / (2*pi)
                    let nw = Math.sin(t*2*pi) * dy / (2*pi)

                    // save the noise value
                    let curVal = noise.perlin4(nx, ny, nz, nw);

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
            
            // This information should be sent at the start of each turn, saved, and then read from "serverInfo.mapUnits"
            // NOTE: The server determines what we can see. We don't need to check this. We just display everything that's been given to us.

            let u = serverInfo.mapUnits;
            for(let i = 0; i < u.length; i++) {
                let unit = u[i];

                // coordinates do NOT need to be recalculated, as the server already did that for us

                // Determine the UNIQUE label for this unit type => the corresponding drawing should have been preloaded
                // 0 = ship, 1 = monster, 2 = ai ship, 3 = dock
                let label;
                if(unit.myType == 0) {
                    label = 'shipNum' + unit.index; 
                } else if(unit.myType == 1) {
                    label = 'monsterNum' + unit.index;
                } else if(unit.myType == 2) {
                    label = 'aiShipNum' + unit.index;
                } else if(unit.myType == 3) {
                    if(unit.dir == 'left' || unit.dir == 'right') { 
                        label = 'dock_side';
                    } else {
                        label = 'dock_' + unit.dir;                        
                    }
                } else if(unit.myType == 4) {
                    if(unit.dir == 'left' || unit.dir == 'right') { 
                        label = 'city_side';
                    } else {
                        label = 'city_' + unit.dir;                        
                    }
                }

                let newSprite = canvas.myGame.add.sprite(unit.x*localTileSize, unit.y*localTileSize, label);
                newSprite.width = newSprite.height = localTileSize;

                // scale / position / reflect sprite correctly based on direction
                if(unit.dir != null) {
                    if(unit.dir == 'front') {
                      newSprite.height = localTileSize*2;
                      newSprite.y -= localTileSize;
                    } else if(unit.dir == 'back') {
                      newSprite.height = localTileSize*2;
                    } else if(unit.dir == 'right') {
                      newSprite.height = newSprite.width = localTileSize * 2;

                      newSprite.x -= localTileSize;
                      newSprite.y -= localTileSize;
                    } else if(unit.dir == 'left') {
                      newSprite.anchor.setTo(0.5, 0.5);

                      newSprite.height = localTileSize * 2;
                      newSprite.width = -1 * localTileSize * 2;

                      newSprite.x += localTileSize;
                    }
                }

                // for debugging: canvas.myGame.add.text(newSprite.x, newSprite.y, unit.index);
            }

            // move camera to center on our player's ship (by default)
            canvas.myGame.camera.x = Math.floor(0.5*mapSize)*localTileSize - canvas.myGame.width*0.5
            canvas.myGame.camera.y = Math.floor(0.5*mapSize)*localTileSize - canvas.myGame.height*0.5

            // Make it possible to slide across the map (by moving mouse/finger over it)
            canvas.addEventListener('mousedown', startCanvasDrag, false)
            canvas.addEventListener('mouseup', stopCanvasDrag, false)

            // do the same for touch
            canvas.addEventListener('touchstart', startCanvasDrag, false)
            canvas.addEventListener('touchend', stopCanvasDrag, false)

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

            // TO DO: Do we still want the ghost ship in the background??
            //cont.appendChild(bgShipSide);

            // create CONTAINER for all the sailor stuff
            // we need it, because we're doing complex CSS shit
            let sailorContainer = document.createElement("div");
            sailorContainer.id = 'sailor-container'

            // Determine the change range, based on instrument level
            // Once maxChange becomes 3, we allow it to change 2 per instrument. (Otherwise, we'll never be able to change 3 in one turn.)
            const changeRange = Math.ceil( (serverInfo.roleStats[3].lvl + 1) / 4);

            // Vertical slider for sails
            // Create the actual slider
            let vSlider = document.createElement("input");
            vSlider.type = 'range'
            vSlider.min = -changeRange
            vSlider.max = changeRange
            vSlider.value = (serverInfo.roleStats[3].sailLvl - serverInfo.roleStats[3].oldSailLvl);
            vSlider.id = "sailor-sailInput"

            sailorContainer.appendChild(vSlider);

            // Display numbers next to slider
            let rangeHint00 = document.createElement("div");
            rangeHint00.classList.add("sailor-rangeHintsVertical");
            for(let i = changeRange; i >= -changeRange; i--) {
                let tempSpan = document.createElement("span");

                if(i == 0) {
                    tempSpan.innerHTML = '';                    
                } else {
                    let numSails = (serverInfo.roleStats[3].oldSailLvl + i);
                    let tempString = '';
                    for(let a = 0; a < numSails; a++) {
                        tempString += '<img src="assets/sailorIconSails.png" style="margin-left:-30px;" />';
                    }
                    tempSpan.innerHTML = tempString;
                }

                tempSpan.id = 'sailor-sail' + i;

                rangeHint00.appendChild(tempSpan);
            }
            sailorContainer.appendChild(rangeHint00);

            // Display crew cost next to slider (move it more to the right of the slider)
            let rangeHint01 = document.createElement("div");
            rangeHint01.classList.add("sailor-rangeHintsVertical");
            rangeHint01.style.left = '55%';

            for(let i = changeRange; i >= -changeRange; i--) {
                let tempSpan = document.createElement("span");

                // determine cost; show it via color (red/green)
                let tempCost = -1;
                if(tempCost > 0) {
                    tempSpan.style.color = 'lightgreen';
                    tempCost = '+' + tempCost;
                }

                // show cost (number + icon), if not behind speed circle
                if(i != 0) {
                    tempSpan.innerHTML = tempCost + '<img src="assets/resourceIcon1.png" />';                    
                }

                tempSpan.id = 'sailor-sailCost' + i;

                rangeHint01.appendChild(tempSpan);
            }
            sailorContainer.appendChild(rangeHint01);

            vSlider.addEventListener('touchstart', sailorSlider);
            vSlider.addEventListener('touchmove', sailorSlider);

            // If the slider was changed ...
            // NOTE: "on input" happens immediately after the change, "on change" only when element loses focus
            // We want the latter, because we only send a signal when the user RELEASES the slider. Otherwise, we would send way too many (unnecessary) signals.
            vSlider.addEventListener('input', function(ev) {
                console.log("Changing vertical (sail) slider")
              
                let v = parseInt(this.value);
                if(this.hasAttribute('data-value') && v != this.getAttribute('data-value')) {
                    v = parseInt( this.getAttribute('data-value') );
                }

                console.log("Value:", v);

                let sailRange = serverInfo.roleStats[3].allowedSailRange;

                // if we go beyond our maximum input, snap back immediately
                if(v < sailRange[0]) {
                    v = sailRange[0];
                } else if(v > sailRange[1]) {
                    v = sailRange[1]
                }
                this.value = v;

                // get new sail value: it's based on change, so the slider only knows the CHANGE in level, and we need to add the current value
                let newSailValue = serverInfo.roleStats[3].oldSailLvl + v;
              
                console.log("New sail value:", newSailValue)

                // if it's the same as our current value, don't do anything
                if(serverInfo.roleStats[3].sailLvl == newSailValue) {
                    return;
                }

                // ... send the new signal (a sail update)
                socket.emit('sail-up', newSailValue);

                // update personal stats
                serverInfo.roleStats[3].sailLvl = newSailValue;

                // update speed circle (old speed + change in SAILS + change in PEDDLES)
                serverInfo.speed = serverInfo.oldSpeed + (newSailValue - serverInfo.roleStats[3].oldSailLvl) + (serverInfo.roleStats[3].peddleLvl - serverInfo.roleStats[3].oldPeddleLvl);
                document.getElementById('sailor-speedCircle').innerHTML = serverInfo.speed;
                
                // update forbidden moves
                disableForbiddenMoves();
              
                console.log("End of vertical slider change");
            })

            // Horizontal slider for paddles
            // Display the actual slider
            let hSlider = document.createElement("input")
            hSlider.type = 'range'
            hSlider.min = -changeRange
            hSlider.max = changeRange
            hSlider.value = (serverInfo.roleStats[3].peddleLvl - serverInfo.roleStats[3].oldPeddleLvl);
            hSlider.id = 'sailor-peddleInput';

            sailorContainer.appendChild(hSlider);

            // Display numbers underneath slider
            let rangeHint10 = document.createElement("div");
            rangeHint10.classList.add('sailor-rangeHintsHorizontal');
            for(let i = -changeRange; i <= changeRange; i++) {
                let tempSpan = document.createElement("span");

                if(i == 0) {
                    tempSpan.innerHTML = '';                    
                } else {
                    let numPeddles = (serverInfo.roleStats[3].oldPeddleLvl + i);
                    let tempString = '';
                    for(let a = 0; a < numPeddles; a++) {
                        if(a == 0) {
                            // the first one needs no left margin decrease; otherwise it goes out of frame (and generally looks weird)
                            tempString += '<img src="assets/sailorIconPeddles.png" />';                            
                        } else {
                            tempString += '<img src="assets/sailorIconPeddles.png" style="margin-left:-30px;" />';
                        }
                    }
                    tempSpan.innerHTML = tempString;
                }

                tempSpan.id = 'sailor-peddle' + i;

                rangeHint10.appendChild(tempSpan);
            }
            sailorContainer.appendChild(rangeHint10);

            // Display crew cost above slider (and thus change the "top" attribute)
            let rangeHint11 = document.createElement("div");
            rangeHint11.classList.add('sailor-rangeHintsHorizontal');
            rangeHint11.style.top = '32%';
            for(let i = -changeRange; i <= changeRange; i++) {
                let tempSpan = document.createElement("span");

                // calculate cost; show it via color (red/green)
                let tempCost = (-2 * i);
                if(tempCost > 0) {
                    tempSpan.style.color = 'lightgreen';
                    tempCost = '+' + tempCost;
                }

                // display the cost (number + icon), if it's not behind the speed circle
                if(i != 0) {
                    tempSpan.innerHTML = tempCost + '<img src="assets/resourceIcon1.png" />';                    
                }

                tempSpan.id = 'sailor-peddleCost' + i;

                rangeHint11.appendChild(tempSpan);
            }
            sailorContainer.appendChild(rangeHint11);

            hSlider.addEventListener('touchstart', sailorSlider);
            hSlider.addEventListener('touchmove', sailorSlider);

            // If the slider has changed ...
            hSlider.addEventListener('input', function(ev) {
                let v = parseInt(this.value);

                // override value if our touchstart/touchmove events found a different value
                if(this.hasAttribute('data-value') && v != this.getAttribute('data-value')) {
                    v = parseInt( this.getAttribute('data-value') );
                }

                let peddleRange = serverInfo.roleStats[3].allowedPeddleRange;

                // if we go beyond our maximum input, snap back immediately
                if(v < peddleRange[0]) {
                    v = peddleRange[0];
                } else if(v > peddleRange[1]) {
                    v = peddleRange[1]
                }
                this.value = v;

                // get new peddle value
                let newPeddleValue = serverInfo.roleStats[3].oldPeddleLvl + v;

                // if it's the same as our current value, don't do anything
                if(serverInfo.roleStats[3].peddleLvl == newPeddleValue) {
                    return;
                }

                // ... send the new signal (a peddle update)
                socket.emit('peddle-up', newPeddleValue);

                // update personal stats
                serverInfo.roleStats[3].peddleLvl = newPeddleValue;

                // update speed circle (old speed + change in SAILS + change in PEDDLES)
                serverInfo.speed = serverInfo.oldSpeed + (newPeddleValue - serverInfo.roleStats[3].oldPeddleLvl) + (serverInfo.roleStats[3].sailLvl - serverInfo.roleStats[3].oldSailLvl);
                document.getElementById('sailor-speedCircle').innerHTML = serverInfo.speed;
            
                // update forbidden moves
                disableForbiddenMoves();
            })

            // Display the large "speed circle" in the center
            let speedCircle = document.createElement("div");
            speedCircle.id = 'sailor-speedCircle';

            // Display the current ship speed
            speedCircle.innerHTML = serverInfo.speed; 

            sailorContainer.appendChild(speedCircle);

            // make the SAILOR container a box that perfectly fits the WIDTH of the screen
            sailorContainer.style.width = cont.offsetWidth + "px";
            sailorContainer.style.height = cont.offsetWidth + "px";

            // add SAILOR container to the overall INTERFACE container (this is getting complex)
            cont.appendChild(sailorContainer)

            // disable all forbidden moves
            // this function is also called every time someone updates the sliders
            disableForbiddenMoves();

            break;

        // Cannoneer:
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
    // NOTE: the captain (role 0) is the ONLY role without an upgrade button
    // NOTE: All instruments go from level 0 to 5 - never higher, so don't display an upgrade button then
    let nextLevel = (serverInfo.roleStats[num].lvl + 1);
    if(num != 0) {
        // If no upgrade submitted...
        if(!serverInfo.submittedUpgrade[num]) {
            // If we can still upgrade, display the upgrade button
            if(nextLevel <= 5) {
                let upgradeBtn = document.createElement("button");
                upgradeBtn.classList.add("upgradeButton");

                // load the required resources for the NEXT level of this role 
                upgradeBtn.innerHTML = loadUpgradeButton(num, nextLevel);

                // on click, send upgrade signal, remove this button, display feedback text, remember we've already upgraded
                upgradeBtn.addEventListener('click', function() {
                    socket.emit('upgrade', num);

                    this.remove();
                    document.getElementById('currentLevelStats').remove();
                    serverInfo.submittedUpgrade[num] = true;

                    let p2 = document.createElement("p");
                    p2.innerHTML = "Upgrade requested. It takes a turn before it's done."

                    cont.appendChild(p2)
                })

                // add button to container
                cont.appendChild(upgradeBtn);

                // underneath the button, display the stats of the current level, and the level we'd be upgrading towards
                let divLevelStats = document.createElement("div");
                divLevelStats.classList.add("levelStats")
                divLevelStats.id = 'currentLevelStats'

                divLevelStats.innerHTML = displayUpgradeStats(num, serverInfo.roleStats[num].lvl)

                cont.appendChild(divLevelStats)
            } else {
                // Otherwise, tell the player he's maxed out
                let p0 = document.createElement("p");
                p0.innerHTML = 'You are at maximum level!'

                cont.appendChild(p0)
            }
        } else {
            let p1 = document.createElement("p");
            p1.innerHTML = "Upgrade requested. It takes a turn before it's done."

            cont.appendChild(p1)
        }
    }

};
