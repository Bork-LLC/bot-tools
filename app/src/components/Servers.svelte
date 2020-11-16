<script>
    import { ProgressCircular } from 'svelte-materialify'

    async function serversLoaded() {
        return new Promise(resolve => {
            const int = setInterval(() => {
                if (window.serverdata) {
                    clearInterval(int)
                    resolve()
                }
            }, 250)
        })
    }
</script>

<main>
    {#await serversLoaded} 
        <center>
            <ProgressCircular style='margin-top: 25%'size={100} indeterminate color="red" />
        </center>
    {:then val}
        <table id='serversdata' style='width:100% !important'>
            <thead>
                <tr style='background-color:#393939'>
                    <th>Name</th>
                    <th>Id</th>
                    <th>Members</th>
                    <th>Admin</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <script>
            window.jQuery('#serversdata').DataTable({
                data: window.serverdata,
                columns: [
                    { data: 'name' },
                    { data: 'id' },
                    { data: 'members' },
                    { data: 'admin' },
                ],
                searching: false,
                info: false,
                lengthChange: false,
                pageLength: 15,
                autoWidth: true,
                columnDefs: [{
                    targets: '_all',
                    createdCell: (td, celldata, rowdata, row, col) => {
                        const t = window.jQuery(td) 
                        
                        // Valid / Invalid text color
                        if (celldata === true) {
                            t.css('background-color','#5cbc4b')
                        } else if(celldata === false) {
                            t.css('background-color', '#BC4B51')
                        }
                    }
                }]
            })
        </script>
    {/await}
</main>

<style>
     main {
        height: calc(100% - 20px);
        width: calc(100% - 40px);
        margin-top: 10px;
        margin-left: 20px;
    }
</style>