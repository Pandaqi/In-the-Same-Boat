import { serverInfo } from '../sockets/serverInfo'
import { SHIP_COLORS } from '../utils/shipColors'

/*
    This function loads the preparation interface for each role

    @num => the number of the role to be loaded
    @cont => the container into which to load the interface

*/
export default function (num, cont) { 
    let socket = serverInfo.socket

    // if we already submitted this role, don't load everything again!
    if(serverInfo.submittedPreparation[num] == true) {
        let p0 = document.createElement("p");
        p0.innerHTML = 'Thank you!';
        cont.appendChild(p0);
        return;
    }

    // Otherwise, load the whole shabang!
	switch(num) {
        // **Captain**: give title and draw ship
        case 0:
            // Instructions
            let p1 = document.createElement("p");
            p1.innerHTML = 'Title your ship and draw it (side-view)';
            cont.appendChild(p1);

            // Title input bar
            let input = document.createElement("input");
            input.type = "text";
            input.id = "shipTitle";
            input.style.marginBottom = '5px';
            input.placeholder = "The Black Pearl";
            cont.appendChild(input);

            // Canvas (drawing area)
            let canvas = document.getElementById("canvas-container")
            canvas.style.display = 'block';
            cont.appendChild(canvas)

            // Title+Canvas submit button
            let btn1 = document.createElement("button")
            btn1.innerHTML = 'Submit title + drawing'
            btn1.addEventListener('click', function(event) {
                // check that the input isn't empty and the drawing has actually been edited
              if(input.value.length < 1 || !canvas.myGame.bmd.hasBeenEdited) {
                return;
              }

              // Remove submit button
              btn1.remove();

              // Get the drawing into a form we can send over the internet
              let dataURI = bmd.canvas.toDataURL()

              console.log(dataURI);

              // send the drawing and info to the server
              // the server doesn't need to know the role or ship => it can figure it out itself
              socket.emit('submit-preparation', { shipTitle: input.value, shipDrawing: dataURI })

              // Disable canvas
              canvas.style.display = 'none';

              // Remove input
              input.remove();

              // Replace text at the top
              p1.innerHTML = 'Thank you!'

              // Remember that we already submitted this one
              serverInfo.submittedPreparation[num] = true;
            })
            cont.appendChild(btn1)

            // make canvas the correct size
            // SIZE = total screen size - height taken by elements above - height taken by the button
            // keep some padding on both sides (I use 10 here)
            let padding = 10;
            let maxHeight = screen.height - (input.getBoundingClientRect().top + input.getBoundingClientRect().height) - btn1.getBoundingClientRect().height - padding*2;
            let maxWidth = document.getElementById('main-controller').clientWidth - padding*2; // screen.width is misleading, because the main controller sets a max width

            // scale to the biggest size that fits (the canvas is a SQUARE)
            let finalSize = Math.min(maxWidth, maxHeight)
            // scale the game immediately (both stage and canvas simultaneously)
            canvas.myGame.scale.setGameSize(finalSize, finalSize)

            // remove previous drawing (if any)
            if(canvas.myGame.canvasSprite != undefined) {
                canvas.myGame.canvasSprite.destroy();
            }

            // Create bitmap for canvas 
            // Use the ship color for drawing
            let bmd = canvas.myGame.add.bitmapData(canvas.myGame.width, canvas.myGame.height);
            bmd.ctx.strokeStyle = SHIP_COLORS[serverInfo.myShip];   
            bmd.ctx.lineWidth   = 10;     
            bmd.ctx.lineCap     = 'round';          
            bmd.isDragging = false;
            bmd.lastPoint = null;

            //  => add it to the game, so we can manipulate it in update() (this also automatically replaces the old one)
            canvas.myGame.bmd = bmd;

            //  => create a sprite, so we can actually see the bitmap
            canvas.myGame.canvasSprite = canvas.myGame.add.sprite(0, 0, bmd); 

            break;

        // **First mate**: write motto and draw flag
        case 1:

            break;

        // Cartographer: title seamonster and draw seamonster
        case 2:

            break;

        // Sailor: (slider) choose between crew and resources
        case 3:

            break;

        // Weapon Specialist: (slider) choose between gun powder and resources
        case 4:

            break;
    }
};