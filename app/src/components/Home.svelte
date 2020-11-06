<script>
    import { DataTable } from "carbon-components-svelte"
  
</script>

<main>
    <h5 class='noselect'>Token Information</h5>
    <DataTable class='noselect'
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
                    price: '0.50 USD',
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
    <h5 class='noselect' style="padding-top: 20px">Your Information</h5>
    <DataTable
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
        rows = {
            [
                {
                    id: 'a',
                    stat: 'Total Tokens',
                    value: 'loading...'
                }, 
                {
                    id: 'b',
                    stat: 'Total Working Tokens',
                    value: 'loading...'
                }, 
                {
                    id: 'c',
                    stat: 'Total Broken Tokens',
                    value: 'loading...'
                }, 
                {
                    id: 'd',
                    stat: 'Total Servers',
                    value: 'loading...'
                }, 
                {
                    id: 'e',
                    stat: 'Total Server Members',
                    value: 'loading...'
                }, 
            ]
        }
    />
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