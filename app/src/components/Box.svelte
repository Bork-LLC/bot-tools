<script>
</script>


    <div class="box" > <slot/> </div>

<style>

    .box {
        background: #303030;
        margin: 0 10px;
        min-width: 24%;
        height: 100%;
        border-radius: 10px;
        
        padding:10px;

        transition: all 500ms;
    }
    .box:hover {
        transition: box-shadow 250ms;
        box-shadow: inset 0px 0px 0px 3px #212121, 0 0 1px 3px #af4b4b;

    }

</style>