const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
let net = require('net');
let client = new net.Socket(); //connect to game.c
let clientmaster = new net.Socket(); //connect to masterserver.c

//Connect to main server, because player wants to join the existing game
clientmaster.connect(1000, '127.0.0.1', function() {
	console.log('Connected to masterserver\n');
	//'3' - player ask for list of avalible games
	clientmaster.write("3");
});

//Connection to HTML file
let write_game_port = document.getElementById("write_game_port"); 
let connect_to_game = document.getElementById("connect_to_game"); 
let back_to_menu = document.getElementById("back_to_menu");
let avalible_games = document.getElementById('avalible_games');
let portno = 0;

//Move between HTML windows in app
back_to_menu.addEventListener('click',function(){
    ipcRenderer.send("changeWindow", "menu");
});

connect_to_game.addEventListener('click',function(){
	if(write_game_port.value > 1000 && write_game_port.value<3000){
		portno = write_game_port.value;
		clientmaster.write('2'+portno); //messege to server - I want to join the game
	}else{
		console.log("Error: Wrong port number.\n");
	}
});

//Receive message from main server
clientmaster.on('data',function(data){
	let temp = data.toString();
	console.log("server::"+temp+"\n");
	switch(temp.slice(0,5)){
		case "added": //server accepts to join me to game
			ipcRenderer.send("changeWindow", "playergame", portno);
		break;
		case "notad": //something wrong with game
			console.log("Failed: Server didnt join you to game. Check game port number.\n")
			ipcRenderer.send("changeWindow", "notjoined", "");
			ipcRenderer.send("changeWindow", "menu", "");
		break;
		case "games"://server send list of avalible games
			let avalibleport = temp.slice(5,temp.length);
			avalible_games.innerText = avalibleport;
		break;
		default:
			console.log("Error: Wrong server messege.\n")
		break;
	}
});