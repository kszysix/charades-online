const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
let net = require('net');
let client = new net.Socket(); //connect to game.c
let clientmaster = new net.Socket(); //connect to masterserver.c
let portno;

//Connect to port which server send as 'msg.portno'
ipcRenderer.on('playergameport',(event,msg)=>{
	portno = msg;
	console.log('Connecting to game nr '+portno+'\n');
	//Connect to game server
	client.connect(portno, '127.0.0.1', function() {
	console.log('Connected to game nr '+portno+'\n');
	});
	gamenumber.innerText = portno;
})

//Connection to HTML file
let message = document.getElementById("message"); 
let send_message = document.getElementById('send_message');
let messageContainer = document.getElementById('message-container');
let canvas = document.getElementById('myCanvas');
let back_to_menu = document.getElementById("back_to_menu");
let username = document.getElementById("username");
let gamenumber = document.getElementById("gamenumber");
let info = document.getElementById("info");
let context = canvas.getContext('2d');
let mouseClicked = false, mouseReleased = true;
let xdata,ydata;
let won = false;

//Move between HTML windows in app
back_to_menu.addEventListener('click',function(){
	//Kill yourself if you want to leave the game
	client.write("pkill\n");
    ipcRenderer.send("changeWindow", "closeplayer", "");
});

//when host game is closing send message to Electron app
client.on('close', function() {
	console.log('Connection closed\n');
});

//If click 'send_message' button, send a message
send_message.addEventListener('click',function(){
    if(won){
		info.innerText = "Game is won. You can't send messages.\n";
    }else{
    	client.emit('new_message', message.value);
    }  
});

//Send message 'data' to game server
client.on('new_message', (data) => {
    document.getElementById("message").value = ""; 
	client.write(":"+data+"\n");
});

//Draw black circle on coordinates
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
 	//'e' - host message that game is end / or host leave the game
 	//'u' - message from server with username
 	//'w' - someone won the game
 	//'9' - '9kill' kill yourself
 	if(temp[0] == '$'){
 		//Get the message and add to group chat
 		chatmsg = temp.slice(1,temp.length-1);
		appendMessage("user"+chatmsg+"\n");

 	}else if(temp[0] =='x'){
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
 		xdata = xdata.slice(1,xdata.length);
 		ydata = ydata.slice(1,ydata.length-1);
 		console.log(temp+" = "+xdata+" + "+ydata)
 		xdata = Number(xdata);
 		ydata = Number(ydata);
 		//Draw a circle on coordinates
 		drawing(xdata,ydata);

 	}else if(temp[0] =='c'){
 		//Clear your canvas
 		context.clearRect(0,0,canvas.width,canvas.height);
 	
 	}else if(temp[0] =='e'){
 		//when host end game
 		ipcRenderer.send("changeWindow", "hostcloseplayergame", "");
 		ipcRenderer.send("changeWindow", "closeplayer", "");
 	}else if(temp[0] =='u'){
 		//Server send username of player
 		if(temp[2]==':'){
			username.innerText = "user"+temp[1];
		}else{
			username.innerText = "user"+temp[1]+temp[2];
		}
 	}else if(temp[0]=='w'){
 		//Someone won the game
 		//server also send word to guess to show it to other players
 		let winner;

 		if(temp[4]==':'){
			winner = temp[3];
		}else{
			winner = temp[3]+temp[4];
		}
 		gamenumber.innerText = portno + " is win by user" + winner+" !\n";
 		document.body.style.backgroundColor = "lightblue";
 		won = true;
 	}else if(temp[0]=='9'){
 		//Tell game server to kill you
 		client.write("pkill\n");
 	 	ipcRenderer.send("changeWindow", "hostcloseplayergame", "");
 		ipcRenderer.send("changeWindow", "closeplayer", "");
 	}
});
