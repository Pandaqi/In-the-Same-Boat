import { serverInfo } from '../sockets/serverInfo'
import { ROLE_DICTIONARY } from '../utils/roleDictionary'

export default function loadErrorMessage(msg, i) { 
    let msgType = msg[i][0];
    let msgRole = ROLE_DICTIONARY[ msg[i][1] ];

    let finalMsg = '';
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
    }

    let errorMsg = document.createElement("span")
    errorMsg.classList.add("captain-error")
    errorMsg.setAttribute('data-errorid', i);
    errorMsg.innerHTML = "<p>" + finalMsg + "</p>";

    errorMsg.addEventListener('click', function() {
        serverInfo.errorMessages[ this.getAttribute('data-errorid') ] = null;

        this.remove();
    });

    return errorMsg;
};