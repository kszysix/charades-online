var net = require('net');
var client = new net.Socket();


client.connect(1234, '127.0.0.1', function() {
  console.log('Connected2\n');
  //client.write('Hello, server! Love, Client.\n');
});

  var message = document.getElementById("message"); //$("#message")
  var username = document.getElementById('username');//$("#username")
  var send_message = document.getElementById('send_message');//$("#send_message")
  var send_username = document.getElementById('send_username');//$("#send_username")
  var chatroom = document.getElementById('chatroom');//$("#chatroom")
  var feedback = document.getElementById('feedback');//$("#feedback")
  var messageContainer = document.getElementById('message-container');
  var canvas = document.getElementById('myCanvas');
  var clear = document.getElementById("clearing");
  //Emit message
var context = canvas.getContext('2d');
var mouseClicked = false, mouseReleased = true;
var lastX;
var lastY;
var xdata,ydata;
var lastXdata, lastYdata;


  send_message.addEventListener('click',function(){
    //console.log('jestem1\n');
    client.emit('new_message', message.value);
    
  })


   clear.addEventListener('click',function(){
    console.log('czyszcze...\n');
    client.write("clear\n");
	context.clearRect(0,0,canvas.width,canvas.height);
    
  })

  //Listen on new_message
  client.on('new_message', (data) => {
    //feedback.html('');
    //console.log('jestem2\n');
    document.getElementById("message").value = ""; 
    //message.value('');
    //chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
    client.write("-> "+data+"\n");
  })
   function drawing(xd,yd){

 	 	context.beginPath();
	    console.log("draw-x,y: "+xd+","+yd);
	    // var xa = Number(x);
	    // var ya = Number(y);
	    //context.fillRect(xd,yd,3,3);
	    context.arc(xd, yd, 2, 0, Math.PI * 2, false);
	    // context.lineWidth = 5;
		// context.lineWidth = 7;
		context.strokeStyle = "#000";
		context.lineJoin = "round";
		// context.moveTo(lastXdata,lastYdata);
		// context.lineTo(xd,yd);
		context.fill();
	    context.stroke();
	    lastXdata = xdata;
	    lastYdata = ydata;
 }

 client.on('data', function(data) {

 	var temp = data.toString();
	 	//console.log('Received: ' + data+ '\n');
 	if(temp.charAt(0) == '-'){
	 	console.log('Received: ' + data+ '\n');
		//chatroom.append("<p class='message'>"+"chat : " + data + "</p>")
		appendMessage("IP: "+client.remoteAddress + " port: "+ client.remotePort + " "+data+"\n");
		//client.emit('readline');
		//client.destroy(); // kill client after server's response
 	}else if(temp.charAt(0)=='x'){
 		xdata = data.slice(1,4);
 		xdata = Number(xdata);
 		//console.log('x: '+xdata+'\n');
 	}else if(temp.charAt(0)=='y'){
 		ydata = data.slice(1,4);
 		ydata = Number(ydata)
 		//console.log('y: '+ydata+'\n');

	    //console.log("toDraw: "+xdata+"  "+ydata+"\n")
	    drawing(xdata,ydata);
	 //    context.arc(x, 100, 3, 0, Math.PI * 2, false);
	 //    context.lineWidth = 5;
		// context.strokeStyle = "#000";
		// context.lineJoin = "round";
		// context.fill();
	 //    context.stroke();
 	}else if(temp.charAt(0)=='c'){
 		context.clearRect(0,0,canvas.width,canvas.height);
 	}

});




client.on('close', function() {
	client.destroy();
	console.log('Connection closed\n');
});

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

//-----------MOUSE-POSITION------------------


// var height = canvas.height = window.innerHeight;
// var width = canvas.width = window.innerWidth;

canvas.addEventListener("click", onMouseClick, false);
canvas.addEventListener("mousemove",onMouseMove, false);

function onMouseClick(e) {
	var mousePos = getMousePos(canvas, e);
    lastY = mousePos.y;
    lastX = mousePos.x;
    lastYdata = mousePos.y;
    lastXdata = mousePos.x;
    mouseClicked = !mouseClicked;
}

function writeMessage(canvas, message) {
	//var context = canvas.getContext('2d');
	context.clearRect(0, 0, 400, 40);
	context.font = '12pt Calibri';
	context.fillStyle = 'black';
	context.fillText(message, 10, 25);
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();

	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	};
}


function onMouseMove(e) {

	var mousePos = getMousePos(canvas, e);
	var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
	if (mouseClicked) {
		//console.log("click\n");
	    context.beginPath();
	    //console.log("click2\n");
	    context.arc(mousePos.x, mousePos.y, 2, 0, Math.PI * 2, false);
	    // context.lineWidth = 7;
		context.strokeStyle = "#000";
		context.lineJoin = "round";
		// context.moveTo(lastX,lastY);
		// context.lineTo(mousePos.x,mousePos.y);
		context.fill();
	    context.stroke();
	    client.write("x"+mousePos.x+"\n");
	    client.write("y"+mousePos.y+"\n");
	    lastY = mousePos.y;
		lastX = mousePos.x;

	}

	// lastY = mousePos.y;
	// lastX = mousePos.x;
	writeMessage(canvas, message);

}

// var height = canvas.height = window.innerHeight;
// var width = canvas.width = window.innerWidth;
// var mouseClicked = false, mouseReleased = true;
// document.addEventListener("click", onMouseClick, false);
// document.addEventListener("mousemove", onMouseMove, false);

// function onMouseClick(e) {
//     mouseClicked = !mouseClicked;
// }

// function onMouseMove(e) {
//     if (mouseClicked) {
//         context.beginPath();
//         context.arc(e.clientX, e.clientY, 7.5, 0, Math.PI * 2, false);
//         context.lineWidth = 5;
//         context.strokeStyle = "#000";
//         context.stroke();
//     }
// }