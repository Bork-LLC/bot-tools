<script>
    import { ProgressCircular } from 'svelte-materialify'
    import { DataTable } from "carbon-components-svelte"

    async function dataExists() {
        return new Promise(resolve => {
            const int = setInterval(() => {
                if (window.statsrows.length != 0) {
                    clearInterval(int)
                    resolve(window.statsrows)
                }
            }, 100)
        })
    }
</script>

<main>
    {#await dataExists()}
        <center>
            <ProgressCircular style='margin-top: 25%'size={100} indeterminate color="red" />
        </center>
    {:then val}
        <h5 class='noselect'>Token Information</h5>
        <DataTable class='noselect'
            style="user-select: none"
            headers = {
                [
                    {   
                        key: 'type',
                        value: 'Type'
                    }, 
                    {
                        key: 'price',
                        value: 'Price / Token'
                    }, 
                    {
                        key: 'stock',   
                        value: 'Stock'
                    }, 
                ]
            }
            rows = {
                [
                    {
                        id: 'a',
                        type: 'Unique Token',
                        price: '0.15 USD',
                        stock: '1923 Tokens'
                    }, 
                    {
                        id: 'b',
                        type: 'Shared Token',
                        price: '0.10 USD',
                        stock: '19234 Tokens'
                    }, 
                ]
            }
        />
        <h5 class='noselect' style="padding-top: 20px">Statistics</h5>
        <DataTable
            style="user-select: none"
            headers = {
                [
                    {
                        key: 'stat',
                        value: 'State'
                    }, 
                    {
                        key: 'value',
                        value: 'Value'
                    }, 
                ]
            }
            rows = {val}
        />
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