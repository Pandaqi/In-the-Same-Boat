/*
    This function loads the preparation interface for each role

    @num => the number of the role to be loaded
    @cont => the container into which to load the interface

*/
export default function (num, cont) { 
	switch(num) {
        // Captain: give title and draw ship
        case 0:
            let p1 = document.createElement("p");
            p1.innerHTML = 'Please title your ship and draw it (from the side)';
            cont.appendChild(p1);

            // Title input bar
            let input = document.createElement("input");
            input.type = "text";
            input.id = "shipTitle";
            cont.appendChild(input);

            // Canvas (drawing area)
            // TO DO

            // Title+Canvas submit button
            let btn1 = document.createElement("button")
            btn1.innerHTML = 'Submit title + drawing'
            btn1.addEventListener('click', function(event) {
              // Remove submit button
              btn1.remove();

              // Get the drawing into a form we can send over the internet
              let dataURI = bmdReference.canvas.toDataURL()

              // send the drawing to the server (including the information that it's a profile pic)
              socket.emit('submit-preparation', { role: 0, title: input.value, dataURI: dataURI })

              // Disable canvas
              canvas.style.display = 'none';

              // Remove input
              input.remove();

              // Replace text at the top
              p1.innerHTML = 'Thank you!'
            })
            cont.appendChild(btn1)

            break;

        // First mate: write motto and draw flag
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