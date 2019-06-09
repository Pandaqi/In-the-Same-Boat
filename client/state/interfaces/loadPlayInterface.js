import { serverInfo } from '../sockets/serverInfo'
import { SHIP_COLORS } from '../utils/shipColors'

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

                resDiv.innerHTML += '<span class="shipResourceGroup"><img src="assets/pirate_flag.jpg"><span id="shipResource' + i + '">' + curResVal + '</span></span>';
            }

            cont.appendChild(resDiv)

            break;

        // **First mate**: 
        //  => display current orientation (in background)
        //  => compass (rotatable; sends info when released)
        //  => current compass level + upgrade button
        case 1:
            // TO DO

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