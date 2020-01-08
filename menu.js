const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

let create_game = document.getElementById("create_game"); 
let find_game = document.getElementById("find_game"); 
let exit = document.getElementById("exit");
let info = document.getElementById("info");

//Close the menu window
exit.addEventListener('click',function(){
    ipcRenderer.send("changeWindow", "exit","");
});

//Show message to player by HTML code
ipcRenderer.on('info',(event,msg)=>{
	info.innerText = msg;
});
//Move between HTML windows in app
find_game.addEventListener('click',function(){
    ipcRenderer.send("changeWindow", "findgame","");
});
//Move between HTML windows in app
create_game.addEventListener('click',function(){
	ipcRenderer.send("changeWindow", "creategame","");
	
});