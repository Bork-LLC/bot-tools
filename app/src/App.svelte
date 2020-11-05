<script>
	export let name;

	import { MaterialApp } from 'svelte-materialify'

	const { ipcRenderer } = require("electron");
	window.ipc = ipcRenderer
</script>

<main>
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
	<MaterialApp theme="dark" style="height: calc(100% - 36px); width: 100%; padding-top: 36px">
		
	</MaterialApp>
</main>

<style>
	#topbar {
		-webkit-box-shadow: 0 2px 4px -1px rgba(0,0,0,0.25);
		-moz-box-shadow: 0 2px 4px -1px rgba(0,0,0,0.25);
		box-shadow: 0 2px 4px -1px rgba(0,0,0,0.25);
		height: 36px;
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
		background-color: #202225
	}
	.iconb {
		display: inline-block;
		height: 40px;
		width: 40px
	}
	.iconb img {
		padding-left: 10px;
		padding-top: 10px;
		width: 15px;
		height: 15px;
		-moz-user-select: none;
		-khtml-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.iconb img :hover {
		background-color: #1A1A1A
	}
</style>