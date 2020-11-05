<script>
	export let name;

	import { MaterialApp, NavigationDrawer, List, ListItem } from 'svelte-materialify'

	import FaHome from 'svelte-icons/fa/FaHome.svelte'
	import FaCoins from 'svelte-icons/fa/FaCoins.svelte'
	import FaHdd from 'svelte-icons/fa/FaHdd.svelte'
	import FaDungeon from 'svelte-icons/fa/FaDungeon.svelte'
	import FaServer from 'svelte-icons/fa/FaServer.svelte'

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
			<div class="iconb">
				<img src="./min.png" alt='' onClick='ipc.send("min")'/>
			</div>
			<div class="iconb">
				<img src="./max.png" alt='' onClick='ipc.send("max")'/>
			</div>
			<div class="iconb" id="close">
				<img src="./close.png" alt='' onClick='ipc.send("close")'/>
			</div>
		</div>
		<div id="maintop">

		</div>
	</div>
	<div style="height: 100%;"class='d-inline-block' id="nav"on:mouseenter={enter} on:mouseleave={leave}>
		<NavigationDrawer {mini} style="background-color: rgb(40,40,40) ">
			<List dense nav>
				<ListItem>
					<span slot="prepend" style="padding-right: 10px;padding-top: 5px">
						<div class='icon'>
							<FaHome />
						</div>
						
					</span>
					Home
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
</MaterialApp>

<style>

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
		height: 40px;
		width: 40px
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