const { app, BrowserWindow, ipcMain } = require('electron');

const discord = require('discord.js')
const path    = require('path');
const fs      = require('fs')

// Live Reload
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true
});

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});





// IPC Code
ipcMain.on('close', (event, arg) => {
  app.quit()
})
ipcMain.on('min', (event, args) => {
  mainWindow.minimize()
})
ipcMain.on('max', (event, args) => {
  mainWindow.maximize()
})






// Discord functions
const tokens = fs.readFileSync(path.join(__dirname, '../tokens.txt')).toString().split(/[\r\n]+/)
const clients = []

// Load all tokens synchronously
let counter = tokens.length
let success = 0
let failed  = 0
for (token of tokens) {
  console.log(token)
  if (token) {
    const client = new discord.Client()
    client.login(token)
      .then(() => {
        clients.push(client)
        success++
        counter--
      })
      .catch(() => {
        failed++
        counter--
      })
  } else {
    failed++
    counter--
  } 
}
function check() {
  return new Promise(resolve => {
    const int = setInterval(() => {
      if (counter == 0) {
        console.log(counter)
        console.log('success')
        console.log(success,failed)
        clearInterval(int)
      }
    },500)
  })
}
(async () => {
  await check()
})()