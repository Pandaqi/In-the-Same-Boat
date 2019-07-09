import { serverInfo } from '../sockets/serverInfo'
import { ROLE_DICTIONARY } from '../utils/roleDictionary'
import { CLUE_STRINGS } from '../utils/clueStrings'

export default function loadErrorMessage(i) { 
    let msgType = serverInfo.errorMessages[i][0];
    let msgParam = serverInfo.errorMessages[i][1];

    let finalMsg = '';
    let msgVisualType = 0; // 0 = error message, 1 = reward/feedback message
    switch(msgType) {
        case 0:
            finalMsg = 'Upgrade by <em>' + ROLE_DICTIONARY[msgParam] + '</em> failed!';
            break;

        case 1:
            finalMsg = 'Crew allocation by <em>' + ROLE_DICTIONARY[msgParam] + '</em> failed!';
            break;

        case 2:
            finalMsg = 'Purchase by <em>' + ROLE_DICTIONARY[msgParam] + '</em> failed!';
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

        case 10:
            finalMsg = "Asking around didn't yield any results!";
            break;

        case 11:
            finalMsg = 'Exploration failed!';
            break;

        case 12:
            finalMsg = "Congratulations! You have found the treasure of <strong>" + msgParam + "</strong>!";
            msgVisualType = 1;
            break;

        // This one's special: it handles ALL possible clues
        // msgParam is an object, containing the clue NUMBER, treasure NAME, and other necessary INFO
        case 13:
            // get clue from dictionary
            finalMsg = CLUE_STRINGS[ msgParam.num ];

            // insert name (owner of treasure; unique identifier)
            finalMsg = finalMsg.replace('@[name]', msgParam.name);

            // insert all other variables/info
            // (the right values for these are already calculated on the server)
            for(let a = 0; a < msgParam.info.length; a++) {
                finalMsg = finalMsg.replace( '@[' + a + ']', msgParam.info[a]);                 
            }

            msgVisualType = 1;
            break;

        case 14:
            finalMsg = 'Unfortunately, there was no treasure here';
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