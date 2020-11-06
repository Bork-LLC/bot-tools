<script>
	// export let name;

	import { MaterialApp, NavigationDrawer, List, ListItem } from 'svelte-materialify'
	import { Router, Link } from '@jamen/svelte-router'

	import FaHome from 'svelte-icons/fa/FaHome.svelte'
	import FaCoins from 'svelte-icons/fa/FaCoins.svelte'
	import FaHdd from 'svelte-icons/fa/FaHdd.svelte'
	import FaDungeon from 'svelte-icons/fa/FaDungeon.svelte'
	import FaServer from 'svelte-icons/fa/FaServer.svelte'

	import Home from './components/Home.svelte'

	// Router data
	const routes = {
		'/': Home
	}

	// Electron funcs to control app
	const { ipcRenderer } = require("electron");
	window.ipc = ipcRenderer

	let mini = true 
	function enter() {
		mini = false
	}
	function leave() {
		mini = true
	}
</script>

<MaterialApp theme="dark">
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
			<img id='icon' src='./favicon.gif' />
			<h6 style='padding-left: 7px;padding-top: 1px;font-weight: 90%'>Bot Tools</h6>
		</div>
	</div>
	<div style="height: 100%;"class='d-inline-block' id="nav"on:mouseenter={enter} on:mouseleave={leave}>
		<NavigationDrawer {mini} style="background-color: rgb(40,40,40);float: left; position: fixed; z-index: 12; top: 30px">
			<List dense nav>
				<ListItem>
					<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
						<div class='icon'>
							<FaHome />
						</div>
						
					</span>
					<Link style='text-decoration: none;color: white !important' href='/'>Home</Link>
				</ListItem>
				<ListItem>
					<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
						<div class='icon'>
							<FaDungeon />
						</div>
					</span>
					Dashboard
				</ListItem>
				<ListItem>
					<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
						<div class='icon'>
							<FaCoins />
						</div>
					</span>
					Tokens
				</ListItem>
				<ListItem>
					<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
						<div class='icon'>
							<FaHdd />
						</div>
					</span>
					Servers
				</ListItem>
				<ListItem>
					<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
						<div class='icon'>
							<FaServer />
						</div>
					</span>
					Console
				</ListItem>
			</List>
		</NavigationDrawer>
	</div>
	<div id='wrapper'style="float:right;width: calc(100% - 56px); height: calc(100% - 30px);margin-top: 30px">
		<Router style="width:100%;height: 100%; float: right;" {routes}></Router>
	</div>
</MaterialApp>

<style>
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
		display: inline-block
	} 
	#maintop {
		width: calc(100% - 130px);
		float: left;
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