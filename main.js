// const { app, BrowserWindow } = require('electron')
const electron = require('electron');
// const app = require('app');
// const BrowserWindow = require('browser-window')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// var net = require('net');
// var client = new net.Socket();

// client.connect(1234, '127.0.0.1', function() {
//   console.log('Connected\n');
//   //client.write('Hello, server! Love, Client.\n');
// });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })



  // and load the index.html of the app.
  win.loadFile('index.html');


  // Open the DevTools.;
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
})

  // var message = document.getElementById("message"); //$("#message")
  // var username = document.getElementById('username');//$("#username")
  // var send_message = document.getElementById('send_message');//$("#send_message")
  // var send_username = document.getElementById('send_username');//$("#send_username")
  // var chatroom = document.getElementById('chatroom');//$("#chatroom")
  // var feedback = document.getElementById('feedback');//$("#feedback")
  
  // //Emit message
  // send_message.click(function(){
  //   socket.emit('new_message', {message : message.val()})
  // })

  // //Listen on new_message
  // client.on("new_message", (data) => {
  //   //feedback.html('');
  //   message.val('');
  //   //chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
  //   client.write(data.message);
  // })

//------------------------------------------------

// client.on('connection',(socket) => {
//     console.log('New user connected\n')

//     //default username
//     socket.username = "Anonymous"

//     //listen on change_username
//     socket.on('change_username', (data) => {
//         socket.username = data.username
//     })

//     //listen on new_message
//     socket.on('new_message', (data) => {
//         //broadcast the new message
//         io.sockets.emit('new_message', {message : data.message, username : socket.username});
//     })

//     //listen on typing
//     socket.on('typing', (data) => {
//       socket.broadcast.emit('typing', {username : socket.username})
//     })

// });




// // const readline = require('readline').createInterface({
// //   input: process.stdin,
// //   output: process.stdout
// // });

// // readline.question(`What's your name?`, (name) => {

// // client.write(`${name}\n`);
// // readline.close();
// // client.emit('readline');

// // });

// var socket = io.connect('http://localhost:1234')

//   //buttons and inputs
//   var message = document.getElementById('message'); //$("#message")
//   var username = document.getElementById('username');//$("#username")
//   var send_message = document.getElementById('send_message');//$("#send_message")
//   var send_username = document.getElementById('send_username');//$("#send_username")
//   var chatroom = document.getElementById('chatroom');//$("#chatroom")
//   var feedback = document.getElementById('feedback');//$("#feedback")

//   //Emit message
//   send_message.click(function(){
//     socket.emit('new_message', {message : message.val()})
//   })

//   //Listen on new_message
//   socket.on("new_message", (data) => {
//     feedback.html('');
//     message.val('');
//     chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
//   })

//   //Emit a username
//   send_username.click(function(){
//     socket.emit('change_username', {username : username.val()})
//   })

//   //Emit typing
//   message.bind("keypress", () => {
//     socket.emit('typing')
//   })

//   //Listen on typing
//   socket.on('typing', (data) => {
//     feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
//   })

// client.on('data', function(data) {
//   console.log('Received: ' + data);
//   //client.emit('readline');
//   //client.destroy(); // kill client after server's response
// });

// client.on('close', function() {
//   client.destroy();
//   console.log('Connection closed');
// });


// client.end();
// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.