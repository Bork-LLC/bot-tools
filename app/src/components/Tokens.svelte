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
        <table id='tokensdata' style='width:100% !important'>
            <thead>
                <tr style='background-color:#393939'>
                    <th>Name</th>
                    <th>Id</th>
                    <th>Type</th>
                    <th>Token</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <script>
            window.jQuery('#tokensdata').DataTable({
                data: window.tokendata,
                columns: [
                    { data: 'name' },
                    { data: 'id' },
                    { data: 'type' },
                    { data: 'token' },
                    { data: 'status' }
                ],
                searching: false,
                info: false,
                lengthChange: false,
                pageLength: 15,
                autoWidth: false,
                columnDefs: [{
                    targets: '_all',
                    createdCell: (td, celldata, rowdata, row, col) => {
                        const t = window.jQuery(td) 
                        
                        // Valid / Invalid text color
                        if (celldata === 'Valid') {
                            t.css('background-color','#5cbc4b')
                        } else if(celldata ==='Invalid') {
                            t.css('background-color', '#BC4B51')
                        }
                        if (col == 0 ) {
                            t.css('text-overflow','elipse')
                        }
                        // Blur token
                        if (col === 3) {
                            t.css({'color':'transparent','text-shadow':'0 0 5px rgba(255,255,255,0.5)',width:"20%"})
                            

                            t.hover(() => {
                               t.css({color:"white"})
                            }, () => {
                                t.css({color:"transparent"})
                            })
                        } else {
                            t.css('user-select','none')
                        }
                    }
                }]
            })
        </script>
    {/await}
</main>

<style>
    .token {
        text-shadow: 0 0 32px white !important;
        color: transparent !important;
    }
    .token:hover {
        color: white;
        text-shadow: none
    }
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