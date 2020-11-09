<script>
    import { ProgressCircular } from 'svelte-materialify'
    
    async function tokenLoaded() {
        return new Promise(resolve => {
            const int = setInterval(() => {
                if (window.tokendata) {
                    clearInterval(int)
                    resolve()
                }
            },250)
        })
    }
</script>

<main>
    {#await tokenLoaded()}
        <center>
            <ProgressCircular style='margin-top: 25%'size={100} indeterminate color="red" />
        </center>
    {:then val} 

    {/await}
</main>

<style>
    .noselect {
		-moz-user-select: none;
		-khtml-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
    main {
        height: calc(100% - 20px);
        width: calc(100% - 40px);
        margin-top: 10px;
        margin-left: 20px;
    }
</style>