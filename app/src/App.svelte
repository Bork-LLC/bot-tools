<script>
	// export let name;
	import { onMount } from 'svelte'
	import { MaterialApp, NavigationDrawer, List, ListItem, ProgressCircular } from 'svelte-materialify'
	import { push } from 'svelte-spa-router'

	import Router from 'svelte-spa-router'
	import jQuery from 'jquery'
	
	import FaHome from 'svelte-icons/fa/FaHome.svelte'
	import FaCoins from 'svelte-icons/fa/FaCoins.svelte'
	import FaHdd from 'svelte-icons/fa/FaHdd.svelte'
	import FaDungeon from 'svelte-icons/fa/FaDungeon.svelte'
	import FaServer from 'svelte-icons/fa/FaServer.svelte'
	import FaAlignCenter from 'svelte-icons/fa/FaAlignCenter.svelte'

	import Home from './components/Home.svelte'
	import Tokens from './components/Tokens.svelte'
	import Servers from './components/Servers.svelte'
	import Console from './components/Console.svelte'
	import Dashboard from './components/DashBoard.svelte'

	// Router data
	const routes = {
		'/': Home,
		'/tokens': Tokens,
		'/servers': Servers,
		'/console': Console,
		'/dash' : Dashboard
	}

	// Electron funcs to control app
	const { ipcRenderer } = require("electron");
	window.ipc = ipcRenderer

	// Handle side bar movement
	let mini = true 
	function enter() {
		mini = false
	}
	function leave() {
		mini = true
	}

	// Create websocket for interprocess transfer
	let opened = false
	let status = 'Launching websocket'
	window.socket = new WebSocket("ws://localhost:32875")
	
	socket.onmessage = (event) => {
		const { type, data } = JSON.parse(event.data)

		switch(type) {
			case 'statistics': 
				const {total,success,failed,servers,members} = data
				opened = true
				window.statsrows=[{id:"a",stat:"Total Tokens",value:total},{id:"b",stat:"Total Valid Tokens",value:success},{id:"c",stat:"Total Invalid Tokens",value:failed},{id:"d",stat:"Total Servers",value:servers},{id:"e",stat:"Total Server Members",value:members}];
			case 'tokenupdate':
				status = data.text || ''
			case 'tokens': 
				window.tokendata = data
			case 'servers':
				window.serverdata = data
			default:
				window[type+ "data"] = data;
				break
		}
	}
	socket.onopen = () => {
		console.log('opened')
	}

	// Assert certain data for other pages info that will be transfered via websocket
	window.statsrows = []
	window.editors = []
	// Wait for all tokens to load
	async function isLoaded() {
		return new Promise(resolve => {
			const int = setInterval(() => {
				if (opened) {
					clearInterval(int)
					resolve(true) 
				}
			}, 250)
		})
	}

	onMount(() => {
		window.jQuery = jQuery
	})
</script>

<MaterialApp theme="dark">
	<script src="./jquery.dataTables.min.js" defer></script>
	<div id="topbar">
		<div id="buttons">
			<div class="iconb" on:click="{()=>window.ipc.send("min")}" >
				<img src="./min.png" alt=''/>
			</div>
			<div class="iconb" on:click="{()=>window.ipc.send("max")}">
				<img src="./max.png" alt='' />
			</div>
			<div class="iconb" id="close" on:click="{()=>window.ipc.send("close")}">
				<img src="./close.png" alt=''/>
			</div>
		</div>
		<div id="maintop">
			<h6 id="title" >Bot Tools</h6>
		</div>
	</div>
	{#await isLoaded()}
		<div id='loader'>
			<center>
				<h4 class='noselect'style='margin-top: 20%'>Loading Tokens...</h4>
				<h5 class='noselect'style='margin-top: 30px'>{status}</h5>
				<ProgressCircular style='margin-top: 45px'size={100} indeterminate color="red" />
			</center>
		</div>
	{:then val}
		<div style="height: 100%;"class='d-inline-block' id="nav"on:mouseenter={enter} on:mouseleave={leave}>
			<NavigationDrawer {mini} style="background-color: #964044;float: left; position: fixed; z-index: 12; top: 30px">
				<List dense nav>
					<ListItem on:click={() => push('/')}>
						<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
							<div class='icon'>
								<FaHome />
							</div>
							
						</span>
						Home
					</ListItem>
					<ListItem on:click={() => push('/dash')} >
						<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
							<div class='icon'>
								<FaDungeon />
							</div>
						</span>
						Dashboard
					</ListItem>
					<ListItem on:click={() => push('/tokens')}>
						<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
							<div class='icon'>
								<FaCoins />
							</div>
						</span>
						Tokens
					</ListItem>
					<ListItem on:click={() => push('/servers')}>
						<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
							<div class='icon'>
								<FaHdd />
							</div>
						</span>
						Servers
					</ListItem>
					<ListItem on:click={() => push('/console')}>
						<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
							<div class='icon'>
								<FaServer />
							</div>
						</span>
						Console
					</ListItem>
					<ListItem>
						<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
							<div class='icon'>
								<FaAlignCenter />
							</div>
						</span>
						Logs
					</ListItem>
				</List>
			</NavigationDrawer>
		</div>
		<div id='wrapper'style="float:right;width: calc(100% - 56px); height: calc(100% - 30px);margin-top: 30px">
			<Router {routes}></Router>
		</div>
	{/await}
</MaterialApp>

<style>
	#title {
		padding-left: 7px;
		padding-top: 1px;
		font-weight: normal;
		font-size: 12px;
		text-align: center;
		user-select:none
	}
	.noselect {
		-moz-user-select: none;
		-khtml-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}	
	#loader {
		height: calc(100%);
		width: 100%;
		background-color: rgb(30,30,30);
		padding-top: 30px
	}
	#icon {
		float: left;
		padding-left: 5px;
		padding-top: 11px;
		height: 25px;
		width: 25px
	}
	.icon {
		height: 20px;
		width: 20px;
		bottom: 5px;
	}
	#topbar {
		-webkit-box-shadow: 0 2px 4px -1px rgba(0,0,0,0.25);
		-moz-box-shadow: 0 2px 4px -1px rgba(0,0,0,0.25);
		box-shadow: 0 2px 4px -1px rgba(0,0,0,0.25);
		height: 30px;
		width: 100%;
		background-color: #BC4B51;
		position: fixed; 
		z-index: 3125
	}
	#buttons {
		width: 130px;
		height: 100%; 
		float: right;
		display: inline-block;
	} 
	#maintop {
		width: 100vw;
		float: left;
		position: absolute;
		height: 100%;
		-webkit-app-region: drag
	}
	main {
		height: 100%;
		width: 100%;
		padding: 0;
	}
	.iconb {
		display: inline-block;
		height: 100%;
		width: 40px;
		cursor: pointer;
		z-index: 1000000
	}
	.iconb img {
		padding-left: 10px;
		padding-top: 10px;
		width: 20px;
		height: 20px;
		-moz-user-select: none;
		-khtml-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

</style>