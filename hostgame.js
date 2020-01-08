const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
let net = require('net');
let client = new net.Socket(); //connect to game.c
let clientmaster = new net.Socket(); //connect to masterserver.c
let portno, word;
let wordtoguess = document.getElementById('wordtoguess');
let gamenumber = document.getElementById('gamenumber');

//Connect to port which server send as 'msg.portno'
ipcRenderer.on('hostgameport',(event,msg)=>{
	portno = msg.portno;
	word = msg.word;
	console.log('Creating game nr '+portno+'\n');
	//Connect to game server
	client.connect(portno, '127.0.0.1', function() {
	console.log('Created game nr '+portno+'\n');
	});
	gamenumber.innerText = portno;
	wordtoguess.innerText = word;
});

//Connection to HTML file
let cold = document.getElementById('cold');
let hot = document.getElementById('hot');
let messageContainer = document.getElementById('message-container');
let canvas = document.getElementById('myCanvas');
let clear = document.getElementById("clearing");
let back_to_menu = document.getElementById("back_to_menu");
let info = document.getElementById("info");
let context = canvas.getContext('2d');
let mouseClicked = false, mouseReleased = true;
let xdata,ydata;
let won = false;

//Move between HTML windows in app
back_to_menu.addEventListener('click',function(){ //host end the game
	//Send host message to players to call out 'kill' by theirself
	client.write("9kill\n");
	//Connect to main server
	clientmaster.connect(1000,'127.0.0.1',function(){
	});
	//Tell main server to end host's game
	clientmaster.write('4'+portno+'\n'); 
});

//Send message 'data' to game server
client.on('new_message', (data) => {
	client.write(":"+data+"\n");
});

//Send message 'Cold' to players mean that they are far from word to guess
cold.addEventListener('click',function(){
	if(won){//If game is won, you can't click the button
		info.innerText = "Game is won. You can't send messages.\n";
	}else{
		client.emit('new_message', "Cold");
	} 
});

//Send message 'Hot' to players mean that they are close from word to guess
hot.addEventListener('click',function(){
    if(won){//If game is won, you can't click the button
    	info.innerText = "Game is won. You can't send messages.\n";
	}else{
		client.emit('new_message', "Hot");
	}
});

//Send message to all players to clear their canvases
clear.addEventListener('click',function(){
	if(won){//If game is won, you can't click the button
		info.innerText = "Game is won. You can't clear.\n";
	}else{
		console.log('clearing...\n');
	    client.write("clear\n");
		context.clearRect(0,0,canvas.width,canvas.height);
	}
});	

//when host game is closing send message to Electron app
client.on('close', function() {
	console.log('Connection closed\n');
	ipcRenderer.send("changeWindow", "closehost", "");
});

//Draw black circle where mouse is clicked
function drawing(xd,yd){
 	context.beginPath();
    context.arc(xd, yd, 2, 0, Math.PI * 2, false);
	context.strokeStyle = "#000";
	context.lineJoin = "round";
	context.fill();
    context.stroke();
}

//Function to add messages to group chat
//That means to add new HTML element with message
function appendMessage(message) {
	const messageElement = document.createElement('div');
	messageElement.innerText = message;
	messageContainer.append(messageElement);
}

//Receive message from server
client.on('data', function(data) {
 	let temp = data.toString();
 	let chatmsg;
 	//First char of message is a message type"
 	//'$' - normal group chat message
 	//'x' - co-ordinats where to draw a circle
 	//'c' - clear canvas
 	//'w' - someone won the game
 	//'9' - '9kill' kill yourself
 	if(temp[0] == '$'){
 		//Get the message and add to group chat
 		chatmsg = temp.slice(1,temp.length-1);
		appendMessage("user"+chatmsg+"\n");

 	}else if(temp[0]=='x'){
 		//Get coordinates from messages
 		let ii=0;
 		xdata = "";
 		ydata = "";
 		while(temp[ii]!="y"){
 			xdata = xdata + temp[ii];
 			ii++;
 		}
 		while(ii<temp.length){
 			ydata = ydata + temp[ii];
 			ii++;
 		}
 		ii=0;
 		xdata = temp.slice(1,temp.length-1);
 		ydata = temp.slice(1,temp.length-1);
 		
 		xdata = Number(xdata);
 		ydata = Number(ydata);
 		//Draw a circle on coordinates
 		drawing(xdata,ydata);

 	}else if(temp[0]=='c'){
 		//Clear your canvas
 		context.clearRect(0,0,canvas.width,canvas.height);
 	
 	}else if(temp[0]=='w'){
 		//Someone won the game
 		//server also send word to guess to show it to other players
 		let winner;

 		if(temp[4]==':'){
			winner = temp[3];
		}else{
			winner = temp[3]+temp[4];
		}
		//Send message that someone won
 		gamenumber.innerText = portno + " is win by user" + winner+" !\n";
 		client.write(":Winner is user"+winner+" ! Word: "+word+"\n");
 		document.body.style.backgroundColor = "lightblue";
 		appendMessage("user"+winner+"::"+word+"\n");
 		won = true;
 	}else if(temp[0]=='9'){
 		//Tell game server to kill you
 		client.write("kill\n");
 	}
});

//-----------MOUSE-POSITION------------------

canvas.addEventListener("click", onMouseClick, false);
canvas.addEventListener("mousemove",onMouseMove, false);

//Drawing is avalible when mouse is clicked
function onMouseClick(e) {
	let mousePos = getMousePos(canvas, e);
    mouseClicked = !mouseClicked;
}

//Message on canvas about mouse coordinates
function writeMessage(canvas, message) {
	context.clearRect(0, 0, 400, 40);
	context.font = '12pt Calibri';
	context.fillStyle = 'black';
	context.fillText(message, 10, 25);
}

//Mouse position on host canvas
function getMousePos(canvas, evt) {
	let rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

//React when mouse is moving
function onMouseMove(e) {
	let mousePos = getMousePos(canvas, e);
	let tempx,tempy;
	let message = 'Mouse position: ' + Math.round(mousePos.x) + ',' + Math.round(mousePos.y);
	//If drawing is avalible, draw circle where mouse is
	if (mouseClicked) {
	    context.beginPath();
	    tempx = Math.round(mousePos.x);
	    tempy = Math.round(mousePos.y);
	    context.arc(tempx, tempy, 2, 0, Math.PI * 2, false);
		context.strokeStyle = "#000";
		context.lineJoin = "round";
		context.fill();
	    context.stroke();

	    let xy = "x"+tempx.toString()+"y"+tempy.toString()+"\n";
	    //Send to all players where to draw a circle
	    client.write(xy);
	    lastY = tempx;
		lastX = tempy;
	}
	writeMessage(canvas, message);
}

