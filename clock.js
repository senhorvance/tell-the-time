var canvas;
var graphics;
var userTimeZoneOffset = new Date().getTimezoneOffset(); // Default offset in minutes

// Function to fetch timezone from IP
async function fetchTimeZone() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.timezone) {
            userTimeZoneOffset = new Date().toLocaleString('en-US', { timeZone: data.timezone }).getTimezoneOffset();
            console.log(`User timezone detected: ${data.timezone}`);
        } else {
            console.log('Timezone not detected, using local time zone.');
        }
    } catch (error) {
        console.error('Error fetching timezone:', error);
    }
}

// draws a black line segment
function Blackline (x1, y1, x2, y2) {
    // Save the current graphics state.
    graphics.save()

    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2,y2);
    graphics.strokeStyle = "black";
    graphics.stroke();

    // Restore the graphics state to its original state.
    graphics.restore();
}

// this function is merely a tweak of the one provided above: draws a red line segment
function Redline (x1, y1, x2, y2) {
    // Save the current graphics state.
    graphics.save();

    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2,y2);
    graphics.strokeStyle = "red";
    graphics.stroke();

    // Restore the graphics state to its original state.
    graphics.restore();
}

function drawCircle(radius, centerX, centerY, numPoints) {
    // Save the current graphics state.
    graphics.save();

    // Begin a new path, clearing any existing path.
    graphics.beginPath();

    // Calculate the angle increment between each point on the circle.
    var angleIncrement = (2 * Math.PI) / numPoints;

    // Loop through the number of points specified to create the circle.
    for (let i = 0; i <= numPoints; i++) {
        // Calculate the current angle (theta) for this point.
        var theta = i * angleIncrement;

        // Calculate the X and Y coordinates of the current point on the circle.
        // The parametric equations for the circle are used here.
        var x = centerX + radius * Math.cos(theta);
        var y = centerY + radius * Math.sin(theta);

        // If it's the first point in the loop, move the pen to that point (without drawing a line).
        // Otherwise, draw a line from the previous point to this point.
        if (i === 0) {
            graphics.moveTo(x, y);
        } else {
            graphics.lineTo(x, y);
        }
    }

    // Connect the last point to the first point to close the path, creating a closed circle.
    graphics.closePath();

    // Draw the circle on the canvas using the current stroke style (black line color).
    graphics.stroke();

    // Restore the graphics state to its original state.
    graphics.restore();
}

function grid () {
    // Save the current graphics state.
    graphics.save();

    for (let index = 60; index < 600; index+=60) {
        if (index == 300) {
            // Drawing vertical and horizontal red lines at center
            Redline(index, 0, index, 600);
            Redline(0, index, 600, index);
        } else {
            // Drawing black lines
            Blackline(index, 0, index, 600);
            Blackline(0, index, 600, index);
        }
    }

    // Restore the graphics state to its original state.
    graphics.restore();
}

function drawTics(centerX, centerY, numPoints, radius, lengthFactor) {
    // Save the current graphics state.
    graphics.save();

    // Calculate the angle increment for each tic point.
    var angleIncrement = (2 * Math.PI) / numPoints;

    // Loop through all the tic points.
    for (let i = 0; i < numPoints; i++) {
        // Calculate the angle in radians for the current tic.
        var theta = i * angleIncrement;

        // Check if the current tic is a multiple of 5 (hour tic).
        if (i % 5 === 0) {
            // Calculate the length of the hour tic.
            var hourLength = radius * lengthFactor * 2;

            // Calculate coordinates for the inner and outer ends of the hour tic.
            var x1 = centerX + ((radius - hourLength) - (radius * lengthFactor)) * Math.cos(theta);
            var y1 = centerY + ((radius - hourLength) - (radius * lengthFactor)) * Math.sin(theta);

            var x2 = centerX + ((radius - hourLength) + (radius * lengthFactor)) * Math.cos(theta);
            var y2 = centerY + ((radius - hourLength) + (radius * lengthFactor)) * Math.sin(theta);

            // Draw a longer black line for the hour tic.
            Blackline(x1, y1, x2, y2);
        }

        // Calculate the length of the minute tic.
        var minuteLength = radius * lengthFactor / 2;

        // Calculate coordinates for the inner and outer ends of the minute tic.
        var x3 = centerX + (radius - minuteLength) * Math.cos(theta);
        var y3 = centerY + (radius - minuteLength) * Math.sin(theta);

        var x4 = centerX + radius * Math.cos(theta);
        var y4 = centerY + radius * Math.sin(theta);

        // Draw a shorter black line for the minute tic.
        Blackline(x3, y3, x4, y4);
    }

    // Restore the graphics state to its original state.
    graphics.restore();
}

function drawHand(centerX, centerY, length, angle, color) {
    // Save the current graphics state.
    graphics.save();

    // Convert the angle from degrees to radians and adjust by -90 degrees (for 0 starting from top).
    var theta = (angle - 90) * (Math.PI / 180);

    // Calculate the end point coordinates of the hand.
    var x2 = centerX + length * Math.cos(theta);
    var y2 = centerY + length * Math.sin(theta);

    // Begin a new path for drawing.
    graphics.beginPath();

    // Move the starting point of the path to the center of the clock.
    graphics.moveTo(centerX, centerY);

    // Draw a line from the center to the end point of the hand.
    graphics.lineTo(x2, y2);

    // Set the stroke color of the line.
    graphics.strokeStyle = color;

    // Stroke (draw) the path with the specified color.
    graphics.stroke();

    // Restore the graphics state to its original state.
    graphics.restore();
}

function drawClock(centerX, centerY, radius) {
    // Save the current graphics state.
    graphics.save();

    // Clear the canvas before drawing the clock
    graphics.clearRect(0, 0, canvas.width, canvas.height);

    drawCircle(radius, centerX, centerY, 100);

    // Add the 'tics' for hours and minutes
    drawTics(300, 300, 60, 240, 0.05);

    // Restore the graphics state to its original state.
    graphics.restore();
}

function animateClock() {
    // Save the current graphics state.
    graphics.save();

    // Clear the canvas to prepare for drawing the clock.
    graphics.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get the current date and time in the user's timezone.
    var d = new Date(new Date().getTime() + userTimeZoneOffset * 60000);

    // Calculate the angles for the clock hands based on the current time.
    var milliseconds = d.getMilliseconds();
    var seconds = d.getSeconds() + milliseconds / 1000;
    var minutes = d.getMinutes() + seconds / 60;
    var hours = d.getHours() % 12 + minutes / 60;

    // Calculate the angles for each clock hand.
    var secondAngle = (360 / 60) * seconds;
    var minuteAngle = (360 / 60) * minutes;
    var hourAngle = (360 / 12) * hours;

    // Draw the clock circle.
    drawClock(300, 300, 240);

    // Draw the second hand.
    drawHand(300, 300, 300 * 0.8, secondAngle, "red");

    // Draw the minute hand.
    drawHand(300, 300, 300 * 0.7, minuteAngle, "black");

    // Draw the hour hand.
    drawHand(300, 300, 300 * 0.5, hourAngle, "black");

    // Request the next animation frame to continue the animation loop.
    requestAnimationFrame(animateClock);

    // Restore the graphics state to its original state.
    graphics.restore();
}

function updateDateTime() {
    // Get the current date and time in the user's timezone.
    let d = new Date(new Date().getTime() + userTimeZoneOffset * 60000);

    // Update the content of the HTML paragraph element with the current date and time.
    document.getElementById("paragraph").innerHTML = d;
}

function init () {
    canvas = document.getElementById("myCanvas");
    graphics = canvas.getContext("2d");

    // Fetch the user's timezone
    fetchTimeZone();

    // Set up the animation loop
    requestAnimationFrame(animateClock);
    
    // Set interval to update the text clock every second
    setInterval(function() {
        updateDateTime();
    }, 1000);
}
