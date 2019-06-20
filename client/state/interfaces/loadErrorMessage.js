import { serverInfo } from '../sockets/serverInfo'
import { ROLE_DICTIONARY } from '../utils/roleDictionary'

export default function loadErrorMessage(msg, i) { 
    let msgType = msg[i][0];
    let msgRole = ROLE_DICTIONARY[ msg[i][1] ];

    let finalMsg = '';
    let msgVisualType = 0; // 0 = error message, 1 = reward/feedback message
    switch(msgType) {
        case 0:
            finalMsg = 'Upgrade by <em>' + msgRole + '</em> failed!';
            break;

        case 1:
            finalMsg = 'Crew allocation by <em>' + msgRole + '</em> failed!';
            break;

        case 2:
            finalMsg = 'Purchase by <em>' + msgRole + '</em> failed!';
            break;

        case 3:
            finalMsg = "You don't have enough crew to fire the cannons!";
            break;

        case 4:
            finalMsg = 'You were attacked!'
            break;

        case 5:
            finalMsg = 'Your ship hit something.'
            break;

        case 6:
            finalMsg = 'Your cannonball hit a target!';
            msgVisualType = 1;
            break;

        case 7:
            finalMsg = 'You killed something! Check your resources for loot.';
            msgVisualType = 1;
            break;

        case 8:
            finalMsg = 'The game has started! Good luck!';
            msgVisualType = 1;
            break;

        case 9:
            finalMsg = 'Trade with dock failed!';
            break;
    }

    let errorMsg = document.createElement("span")

    if(msgVisualType == 0) {
        errorMsg.classList.add("captain-error")        
    } else {
        errorMsg.classList.add("captain-feedback") 
    }

    errorMsg.setAttribute('data-errorid', i);
    errorMsg.innerHTML = "<p>" + finalMsg + "</p>";

    errorMsg.addEventListener('click', function() {
        serverInfo.errorMessages[ this.getAttribute('data-errorid') ] = null;

        this.remove();
    });

    return errorMsg;
};