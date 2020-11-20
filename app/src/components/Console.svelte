<script>
    import { Button } from 'svelte-materialify'
    // import { onMount } from 'svelte'

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
                    name="a"
                />
            </div>
        </div>
        <div id="side2" style='width:calc(40% - 10px);height: 100%;float:left;padding-left: 10px'>
            <h5 class='titlebar'>Output</h5>
            <div id='editor2' style='width:100%;height:calc(100% - 40px)'></div>
        </div>
        <div id='side3' style='width: calc(20% - 10px); height: 112.5%;float:left;padding-left: 10px'>
            <h5 class='titlebar'>Scripts</h5>
            <div id='scripts' style='height: calc(100% - 40px); width: 100%; background-color:#191919'>
    
            </div>
        </div>
    </div>
    <div id="bottombar" >
        <Button class='btnaaaa' style="height:100%" >execute</Button>
        <!-- aaaaaa -->
    </div>
</main>

<style>
    main {
        height: calc(100% - 20px);
        width: calc(100% - 40px);
        margin-top: 10px;
        margin-left: 20px;
        display: flex;
        flex-flow: wrap;
    }
    .btnaaaa {
        position: relative;
        margin-bottom: 0;
        height: 100%;
    }
    #bottombar {
        width: calc(80% - 20px); 
        min-height: calc(10% - 40px);
        background-color:#191919; 
        padding-top: 10px;
        padding-left: 10px;
        padding-bottom: 10px;
    }
    .titlebar {
        width: 100%;
        height: 30px;
        user-select: none;
        text-align: center
    }
</style>