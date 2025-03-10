import { serverInfo } from '../sockets/serverInfo'
import { SHIP_COLORS } from '../utils/shipColors'

/*
    This function loads the preparation interface for each role

    @parameter num => the number of the role to be loaded
    @parameter cont => the container into which to load the interface

*/
export default function loadPrepInterface(num, cont) { 
    let socket = serverInfo.socket

    // Every role has an instructional paragraph at the top; thus we can declare it here
    // The default value is "Thank You!", for when someone already submitted this role
    let p0 = document.createElement("p");
    p0.innerHTML = 'Thank you!';
    cont.appendChild(p0);

    // if we already submitted this role, don't load everything again!
    if(serverInfo.submittedPreparation[num] == true) {
        return;
    }

    // Otherwise, load the whole shabang!
    // This switch statement loads the required buttons, inputs, drawing area, etc.
    //   => The submit button is underneath this statement, because it's almost identical for each role
    //   => The canvas resizing code is also underneath this, because it needs the height of the button
    let input0 = document.createElement("input");
    input0.style.marginBottom = '5px';

    let canvas = document.getElementById("canvas-container")
    let canvasProportion = 1; // ratio of height to width => value of 2 means that height = width*2

    let requiredInfo = {}; // this variable stores the info that is to be submitted (and their type + id/name)

	switch(num) {
        // **Captain**: give title and draw ship
        case 0:
            // Instructions
            p0.innerHTML = 'Title your ship and draw it (side-view)';

            // Title input bar
            input0.type = "text";
            input0.id = "shipTitle";
            input0.placeholder = "The Black Pearl";
            cont.appendChild(input0);

            // Canvas (drawing area for SHIP)
            canvas.style.display = 'block';
            cont.appendChild(canvas)

            canvasProportion = 1;

            requiredInfo = { 'shipTitle': 'text', 'shipDrawing': 'drawing' }

            break;

        // **First mate**: write motto and draw flag
        case 1:
            // Instructions
            p0.innerHTML = 'Write a motto and draw your flag';

            // Motto input
            input0.type = "text";
            input0.id = "shipMotto";
            input0.placeholder = "Veni, vidi, vici!";
            cont.appendChild(input0);

            // Canvas (drawing area for FLAG)
            canvas.style.display = 'block';
            cont.appendChild(canvas)

            canvasProportion = 0.5; // (flags are wide rectangles, not squares, thus height = width*0.5)

            requiredInfo = { 'shipMotto': 'text', 'shipFlag': 'drawing' }

            break;

        // Cartographer: title seamonster and draw seamonster
        case 2:
            // Instructions
            p0.innerHTML = 'Draw a seamonster and name it';

            // Seamonster name input
            input0.type = "text";
            input0.id = "shipMonster";
            input0.placeholder = "The Kraken!";
            cont.appendChild(input0);

            // Canvas (drawing area for MONSTER)
            canvas.style.display = 'block';
            cont.appendChild(canvas)

            canvasProportion = 1;

            requiredInfo = { 'shipMonster': 'text', 'shipMonsterDrawing': 'drawing' }

            break;

        // Sailor: (slider) choose between crew and resources
        case 3:
            // Instructions
            p0.innerHTML = 'Do you want to start with lots of crew, or lots of wood?'; 

            // Slider input (left = more crew, right = more wood)
            input0.type = "range";
            input0.id = 'res1';
            input0.min = 0;
            input0.max = 4;
            input0.value = 2;
            cont.appendChild(input0);

            // clues about what the slider means at a certain point
            var span0 = document.createElement("span");
            span0.innerHTML = 'CREW';
            span0.style.float = 'left';
            cont.appendChild(span0);

            var span1 = document.createElement("span");
            span1.innerHTML = 'WOOD';
            span1.style.float = 'right';
            cont.appendChild(span1);

            requiredInfo = { 'res1': 'res2' }

            break;

        // Weapon Specialist: (slider) choose between gun powder and resources
        case 4:
            // Instructions
            p0.innerHTML = 'Do you want to start with lots of gun powder, or lots of wood?';

            // Slider input (left = more guns, right = more wood)
            input0.type = "range";
            input0.id = 'res3';
            input0.min = 0;
            input0.max = 4;
            input0.value = 2;
            cont.appendChild(input0);

            // clues about what the slider means at a certain point
            var span0 = document.createElement("span");
            span0.innerHTML = 'GUNS';
            span0.style.float = 'left';
            cont.appendChild(span0);

            var span1 = document.createElement("span");
            span1.innerHTML = 'WOOD';
            span1.style.float = 'right';
            cont.appendChild(span1);

            requiredInfo = { 'res3': 'res2' }

            break;
    }



    /*

        Submit button (for all roles)
         => What it submits, depends on the role

     */
    let btn1 = document.createElement("button")
    btn1.innerHTML = 'Submit information'
    btn1.addEventListener('click', function(event) {
        // Check if all required information has been filled in
        // Text input (slider input has default values)
        if(input0.type == "text" && input0.value.length < 1) {
            return;
        // Drawing input
        } else if(canvas.style.display == 'block' && !canvas.myGame.bmd.hasBeenEdited) {
            return;
        }

        // Remove submit button
        btn1.remove();

        let signalContent = {}

        for(let key in requiredInfo) {
            let t = requiredInfo[key]; // get the type
            // it's either a piece of text
            if(t == 'text') {
                signalContent[ key ] = input0.value;
            // a drawing
            } else if(t == 'drawing') {
                signalContent[ key ] = canvas.myGame.bmd.canvas.toDataURL() // this seems convoluted ... can't I get the dataURI from canvas immediately?
            // or a slider, in which case the dictionary holds another id-name (a slider chooses between two things, mostly resources on the ship)
            } else if (t.substring(0,3) == 'res') {
                signalContent[ key ] = (0 + parseInt(input0.value));
                signalContent[ requiredInfo[key] ] = (4 - input0.value);
            }
        }

        console.log(signalContent);
        
        // send the drawing and info to the server
        // the server doesn't need to know the role or ship => it can figure it out itself
        socket.emit('submit-preparation', signalContent)

        // Disable canvas (and save it!)
        canvas.style.display = 'none';
        document.body.appendChild(canvas);

        // Remember that we already submitted this one
        serverInfo.submittedPreparation[num] = true;

        // Reload the current tab/role - only this time, we're already done, so it just loads a "submitted" message
        // Empty the thing first (otherwise, it just keeps adding stuff to it)
        cont.innerHTML = '';
        loadPrepInterface(num, cont);
    })
    cont.appendChild(btn1)



    /*

        Canvas preparation code
         => The canvas needs to be the right size
         => The bitmapData for drawing needs to be prepared
         => (... but only if the canvas is actually displayed, of course)

     */
    if(canvas.style.display == 'block') {
        // make canvas the correct size
        // SIZE = total screen size - height taken by elements above - height taken by the button
        // keep some padding on both sides (10 is average height padding/margin, 20 is the padding on the sides)
        let paddingY = 10;
        let paddingX = 20;
        let maxHeight = screen.height - (input0.getBoundingClientRect().top + input0.getBoundingClientRect().height) - (btn1.getBoundingClientRect().height + 5*2) - paddingY*2 - 2;
        let maxWidth = document.getElementById('shipInterface').clientWidth - paddingX*2; // screen.width is misleading, because the main controller sets a max width

        // scale to the biggest size that fits (the canvas is a SQUARE)
        let finalSize = Math.min(maxWidth, maxHeight / canvasProportion)
        // scale the game immediately (both stage and canvas simultaneously)
        canvas.myGame.scale.setGameSize(finalSize, finalSize * canvasProportion)

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
    }
};