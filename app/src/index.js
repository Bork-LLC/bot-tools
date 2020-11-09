const { app, BrowserWindow, ipcMain } = require('electron');

const discord = require('discord.js')
const socket  = require('ws')
const path    = require('path');
const fs      = require('fs');

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




///////////////////////////////////////
//                                  //
//   Interprocess communications   //
//                                //
///////////////////////////////////

// Websockets for data transfer
const server = new socket.Server({ port: 32875 })
let lastSocket
let lastData
server.on('connection', (w) => {
	// Handle socket open
	if (lastData) {
		w.send(JSON.stringify(
			{
				type: 'statistics',
				data: lastData
			}
		))
	}
	// Handle socket close
	w.on('close', () => {
		console.log('the websocket has been closed')
	})

	// Save socket for external use
	lastSocket = w
		
	// Token Loading
	const tokens = fs.readFileSync(path.join(__dirname, '../tokens.txt')).toString().split(/[\r\n]+/)
	const clients = []
	const servers = {}

	// Load all tokens synchronously
	let success = 0
	let failed = 0
	let start

	for (token of tokens) {
		if (token) {
			// Create new client
			const client = new discord.Client()

			// Get guild info
			client.on('ready', () => {
				success++;
				ping()
				for (guild of client.guilds) {
					servers[guild[1].id] = guild[1].memberCount
				}
			})

			// Attempt to login to token
			client.login(token)
				.then(() => {clients.push(client);})
				.catch(() => { failed++;ping()})
		} else {
			failed++
			ping()
		} 
	}
	function ping() {
		w.send(JSON.stringify(
			{
				type: 'tokenupdate',
				data: {text: `${success+failed}/${tokens.length} tokens loaded`}
			}
		))
		if (success + failed == tokens.length) {
			let size = 0
			for (guild in servers) {
				size += servers[guild]
			}
			lastData = { total: tokens.length, success, failed, servers: Object.keys(servers).length, members: size }
			w.send(JSON.stringify(
				{
					type: 'statistics',
					data: lastData
				}
			))
		}
	}
})
