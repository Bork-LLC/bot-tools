const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

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
    width: 800,
    height: 600,
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
