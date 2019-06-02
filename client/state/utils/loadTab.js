import { ROLE_DICTIONARY } from './roleDictionary'
import { serverInfo } from '../sockets/serverInfo'
import LOAD_INTERFACE from '../interfaces/loadPrepInterface'

// I'm cheating here
// I pass curTab as a function with a property 'num', so it is passed by REFERENCE
// This way I can access the old tab, disable it, and then update to the new tab, without having to send the object back
// Bad practice, works well though :p
export default function (eventID, curTab) { 
	let num = eventID.charAt(5); // get number from id

    console.log("Loading tab " + num);

    // disable old selected tab
    document.getElementById("label" + curTab.num).classList.remove('tabSelected');

    // enable new selected tab
    document.getElementById(eventID).classList.add('tabSelected');

    // empty the interface area
    document.getElementById("shipInterface").innerHTML = '';

    // create the interface container
    let container = document.createElement("div");
    container.classList.add("roleInterface")
    container.id = "tab" + num;

    document.getElementById("shipInterface").appendChild(container);

    console.log(serverInfo.myRoles[num]);
    console.log(container);

    // now start loading the interface, for this ...
    //  ... the role is needed (obviously) in the form of its number
    //  ... the container is needed (because everything is going to be appended as a child there)
    LOAD_INTERFACE(serverInfo.myRoles[num], container);

    // update current tab number
    curTab.num = num;
};