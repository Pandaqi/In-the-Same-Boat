import { ROLE_DICTIONARY } from './roleDictionary'
import { serverInfo } from '../sockets/serverInfo'
import LOAD_PREP_INTERFACE from '../interfaces/loadPrepInterface'
import LOAD_PLAY_INTERFACE from '../interfaces/loadPlayInterface'

// I'm cheating here
// I pass curTab as a function with a property 'num', so it is passed by REFERENCE
// This way I can access the old tab, disable it, and then update to the new tab, without having to send the object back
// Bad practice, works well though :p
export default function (eventID, curTab, interfaceType) { 
	let num = eventID.charAt(5); // get number from id

    console.log("Loading tab " + num);

    // disable old selected tab
    document.getElementById("label" + curTab.num).classList.remove('tabSelected');

    // enable new selected tab
    document.getElementById(eventID).classList.add('tabSelected');

    // save the canvas
    let cv = document.getElementById("canvas-container")
    cv.style.display = 'none'
    document.body.appendChild(cv)

    // in fact, empty the canvas completely 
    cv.myGame.world.removeAll();

    // then empty the interface area
    document.getElementById("shipInterface").innerHTML = '';

    // create the interface container
    let container = document.createElement("div");
    container.classList.add("roleInterface")
    container.id = "tab" + num;

    document.getElementById("shipInterface").appendChild(container);

    // now start loading the interface, for this ...
    //  ... the role is needed (obviously) in the form of its number
    //  ... the container is needed (because everything is going to be appended as a child there)

    // interfaceType "0" = preparation interface
    // interfaceType "1" = play interface
    if(interfaceType == 0) {
        LOAD_PREP_INTERFACE(serverInfo.myRoles[num], container);
    } else {
        LOAD_PLAY_INTERFACE(serverInfo.myRoles[num], container);
    }

    // update current tab number
    curTab.num = num;
};