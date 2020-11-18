const { app, BrowserWindow, ipcMain } = require('electron');

const discord = require('discord.js')
const fetch   = require('node-fetch')
const socket  = require('ws')
const path    = require('path');
const fs      = require('fs');
const os      = require('os')

// Locate the users documents folder
const home = os.homedir()
const documents = path.join(home, 'Documents')

let tools
if (fs.existsSync(documents)) {
	tools = path.join(documents, 'Bot Tools')
	if (!fs.existsSync(tools)) {
		fs.mkdirSync(tools, { recursive: false })
		fs.mkdirSync(path.join(tools, 'scripts'), { recursive: false })
		fs.writeFileSync(path.join(tools,'tokens.txt'),'')
	}
}


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
	
	// mainWindow.webContents.openDevTools({mode:'undocked'}) // annoying as fuck
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
server.on('connection', (w) => {
	// Handle socket open
	// Handle socket close
	w.on('close', () => {
		console.log('the websocket has been closed')
	})

	// Save socket for external use
	lastSocket = w
		
	// Token Loading
	const tokens  = fs.readFileSync(path.join(__dirname, '../tokens.txt')).toString().split(/[\r\n]+/)
	const clients = {}
	const servers = {}
	const admins  = {}
	const guilds  = {}

	// Load all tokens synchronously
	let success = 0
	let failed = 0
	let start

	const clientData = []
	let clientCount = 0
	for (const token of tokens) {
		if (token) {
			// Create new client
			const client = new discord.Client()

			// Get guild info
			client.on('ready', () => {
				if (client.user) {
					for (guild of client.guilds) {
						servers[guild[1].id] = guild[1].memberCount

						const member = guild[1].members.get(client.user.id)

						admins[guild[1].id] = admins[guild[1].id] || member.hasPermission('ADMINISTRATOR')

						guilds[guild[1].id] = {
							name: guild[1].name,
							id: guild[1].id,
							members: guild[1].memberCount,
						}
					}
	
					const user = client.user
					clientData.push({
						id: user.id,
						type: user.bot ? 'Bot' : 'User',
						name: `${user.username}#${user.discriminator}`,
						token,
						status: 'Valid'
					})
					clientCount++
					success++;
					ping()
				}
			})

			// Attempt to login to token
			client.login(token)
				.then(() => {clients[token] = client;})
				.catch(() => {
					clientData.push({
						id: 'N/A',
						name: `N/A`,
						type: 'N/A',
						token,
						status: 'Invalid'
					})
					clientCount++
					failed++;
					ping()
				})
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

			// all tokens are loading, proceed
			let size = 0
			for (guild in servers) {
				size += servers[guild]
			}
			w.send(JSON.stringify(
				{
					type: 'statistics',
					data: { total: tokens.length, success, failed, servers: Object.keys(servers).length, members: size }
				}
			))
			w.send(JSON.stringify({
				type: 'tokens',
				data: clientData
			}))

			const temp = []
			const keys = Object.keys(guilds)
			let counter = 0

			for (let guildID of keys) {
				counter++

				const guild = guilds[guildID]
				guild.admin = admins[guildID]

				temp.push(guild)
				if (counter == keys.length) {
					w.send(JSON.stringify({
						type: 'servers',
						data: temp
					}))
				}
			}
		}
	}
})
