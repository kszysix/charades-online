const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
let net = require('net');
let client = new net.Socket(); //connect to game.c
let clientmaster = new net.Socket(); //connect to masterserver.c
let word, portno, arg;

//Connect to main server, because player wants to create new game
clientmaster.connect(1000, '127.0.0.1', function() {
	console.log('Connected to masterserver\n');
});

//Connection to HTML file
let word_to_guess = document.getElementById("word_to_guess"); 
let start_new_game = document.getElementById("start_new_game"); 
let back_to_menu = document.getElementById("back_to_menu");

//Move between HTML windows in app
back_to_menu.addEventListener('click',function(){
    ipcRenderer.send("changeWindow", "menu");
});

//Player send new game's word to guess to main server
//If word is correct, server will send new game's port number
start_new_game.addEventListener('click',function(){
	if(word_to_guess.value.length > 0 || word_to_guess.value.length < 30){
		clientmaster.write('1'+word_to_guess.value) //messege to server - I want to join the game
		word = word_to_guess.value;
	}else{
		console.log("Failed: Wrong word_to_guess.\n");
		ipcRenderer.send("changeWindow", "tolongword", "");
		ipcRenderer.send("changeWindow", "menu", "");
	}
	
});

//Receive message from main server
clientmaster.on('data',function(data){
	let temp = data.toString();
	switch(temp.slice(0,7)){
		case "created": //server accepts to create my new game
			portno = temp.slice(7,11);
			arg = {word: word, portno: portno}; 
			ipcRenderer.send("changeWindow", "host", arg);
		break;
		case "notcrtd": //something wrong with game
			console.log("Failed: Server didnt create your game. Check port game port number.\n")
			ipcRenderer.send("changeWindow", "notcreated", "");
			ipcRenderer.send("changeWindow", "menu", arg);
		break;
		default:
			console.log("Error: Wrong server messege.\n")
		break;
	}
});