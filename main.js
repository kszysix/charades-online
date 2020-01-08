const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let win;
let winhost;
let winplayer;
let wh = false;
let wp = false;

//Create desktop app window with menu in Electron app
function createWindow () {

    win = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL('file://'+__dirname+'/menu.html');

    win.on('closed', () => {
      win = null;
    });
}
//Diffrent window for play as host
function createWindowHost (path) {
  // Create the browser window.
    winhost = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    winhost.loadURL(path);
    wh = true;
    winhost.on('closed', () => {
        wh = false;
      winhost = null;
    });
}
//Diffrent window for play as player
function createWindowPlayer (path) {
    winplayer = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    winplayer.loadURL(path);
    wp = true;
    winplayer.on('closed', () => {
        wh = false;
        winplayer = null;
    });
}

app.on('ready', createWindow);

//If all window are close, end app
app.on('window-all-closed', () => {
    app.quit();
});

//Comunication between Electron app windows
//Helps to change HTML file or to send message to player by HTML code
ipcMain.on("changeWindow", function(event, arg1, arg2) {
    switch (arg1) {
        case "menu":
            win.loadURL('file://'+__dirname+'/menu.html');
        break;
        case "findgame":
            win.loadURL('file://'+__dirname+'/findgame.html');
        break;
        case "creategame":
            win.loadURL('file://'+__dirname+'/creategame.html');
        break;
        case "playergame":
            win.loadURL('file://'+__dirname+'/menu.html');
            createWindowPlayer('file://'+__dirname+'/playergame.html')
            winplayer.webContents.on('did-finish-load', () => {
                winplayer.webContents.send('playergameport',arg2);
            });
        break;
        case "host":
            win.loadURL('file://'+__dirname+'/menu.html');
            createWindowHost('file://'+__dirname+'/hostgame.html');
            winhost.webContents.on('did-finish-load', () => {
                winhost.webContents.send('hostgameport', arg2);
            });    
        break;
        case "closehost":
            winhost.close();
            win.webContents.send('info', "As host, you ended your game.\n");
        break;
        case "closeplayer":
            winplayer.close();
            win.webContents.send('info',"You leave the game.\n")
        break;
        case "hostcloseplayergame":
            win.webContents.send('info',"Host ended your game.\n");
        break;
        case "win":
            win.webContents.send('info',arg2+" Win!\n");
        break;
        case "toolongword":
            win.webContents.send('info',"Word is too long(>30) or empty.\n");
        break;
        case "notcreated":
            win.webContents.send('info',"Failed: Server didn't create your game. Check game port number.\n");
        break;
        case "toolongword":
            win.webContents.send('info',"Failed: Server didn't join you to game. Check game port number.\n");
        break;
        case "exit":
            if(!wh && !wp){
                win.close();
            }else{
                win.webContents.send('info',"Other windows are still open. Please close them to exit the app.\n");    
            }
        break;
        default:
        break;
    }
});
