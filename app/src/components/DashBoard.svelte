<script>

    import Box from "./Box.svelte"
    import FaServer from 'svelte-icons/fa/FaServer.svelte'
    import FaCoins from 'svelte-icons/fa/FaCoins.svelte'
    import { ProgressCircular } from 'svelte-materialify'


    async function TokensLoaded() {
        return new Promise(resolve => {
            const int = setInterval(() => {
                if (window.tokendata) {
                    clearInterval(int)
                    console.log(window.tokendata)
                    resolve(window.tokendata)
                }
            },250)
        })
    }

    async function serversLoaded() {
        return new Promise(resolve => {
            const int = setInterval(() => {
                if (window.serverdata) {
                    clearInterval(int)
                    resolve(window.serverdata)
                }
            }, 250)
        })
    }

</script>

<main>
    <div class="box-previews" >
        <Box ref="b_t" > 
            {#await TokensLoaded()}
                <center>
                    <ProgressCircular style='margin-top: 25%'size={20} indeterminate color="red" />
                </center>
            {:then val}
                <h4 style='user-select: none'>Loaded Tokens</h4> 
                <hr/> 
                <br/>
                <div style="display:flex; flex-flow:row " >
                    <div style="width:45px; margin-right:20px " >

                        
                        <FaCoins /> 
                    </div>
                    <h5  style='user-select: none'> {val.length}  </h5> 
                </div>
            {/await}
        </Box>
        <Box ref="b_s" > 
            {#await serversLoaded()}
                <center>
                    <ProgressCircular style='margin-top: 25%'size={20} indeterminate color="red" />
                </center>
            {:then val}
                <h4 style='user-select: none'>Loaded Servers</h4> 
                <hr/> 
                <br/>
                <div style="display:flex; flex-flow:row " >
                    <div style="width:45px; margin-right:20px " >

                        
                        <FaServer /> 
                    </div>
                    <h5  style='user-select: none'> {val.length}  </h5> 
                </div>
            {/await}
        </Box>
    </div>
</main>

<style>

    .box-previews {
        width: 100%;
        height: 20vh;
        margin-top: 40px;
        margin-bottom: 10px;
        display: flex;
        flex-flow: row;
    }

    hr {
        width:90%;
        border-color:#BC4B51;
        border-radius: 20px;
        margin: auto;
    }

</style>