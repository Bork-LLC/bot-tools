<script>
    import { Button } from 'svelte-materialify'
    import { onMount } from 'svelte'

    import AceEditor from 'svelte-ace-editor'

    require('brace');
    require('brace/mode/lua')
    require('brace/theme/clouds_midnight')

    let value = 'a'
</script>

<main>
    <div style="width: 100%; height: 90%; margin-bottom: 0">
        <div id="side1" style='width:calc(40% - 10px);height: 100%;float:left'>
            <h5 class='titlebar'>Input</h5>
            <div id='editor1' style='width:100%;height:calc(100% - 40px)'>
                <AceEditor 
                    height="100%"
                    width="100%"
                    theme="clouds_midnight"
                    lang='lua'
                    bind:value={value}
                />
            </div>
        </div>
        <div id="side2" style='width:calc(40% - 10px);height: 100%;float:left;padding-left: 10px'>
            <h5 class='titlebar'>Output</h5>
            <div id='editor2' style='width:100%;height:calc(100% - 40px)'></div>
        </div>
        <div id='side3' style='width: calc(20% - 10px); height: 109.5%;float:left;padding-left: 10px'>
            <h5 class='titlebar'>Scripts</h5>
            <div id='scripts' style='height: calc(100% - 40px); width: 100%; background-color:#191919'>
    
            </div>
        </div>
    </div>
    <div id="bottombar" style="width: calc(80% - 20px); height: calc(10% - 20px);background-color:#191919; ">
        <Button style="position: absolute; left:90px; transform: translateY(5px);" >execute</Button>
    </div>
</main>

<style>
    main {
        height: calc(100% - 20px);
        width: calc(100% - 40px);
        margin-top: 10px;
        margin-left: 20px;
    }
    .titlebar {
        width: 100%;
        height: 30px;
        user-select: none;
        text-align: center
    }
</style>