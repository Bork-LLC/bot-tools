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

ipcMain.on('close', (event, arg) => {
  app.quit()
})
ipcMain.on('min', (event, args) => {
  mainWindow.minimize()
})
ipcMain.on('max', (event, args) => {
  mainWindow.maximize()
})

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

// Discord functions
const tokens = fs.readFileSync(path.join(__dirname, '../tokens.txt')).toString().split(/[\r\n]+/)
const clients = []

// Load all tokens synchronously
let counter = tokens.length
for (token of tokens) {
    
}