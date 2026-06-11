<script>
    const text = 'KevinsKeyssx';

    function handleNavigate() {
        window.open('https://www.kevinkeyssx-profile.dev/', '_blank');
    }
</script>

<div class="grid">
    <span class="font-semibold text-[#162d20] dark:text-[#e8f5e9] text-[10px]">powered by</span>

    <button 
        class       = "button [-webkit-text-stroke:1px_#004d26] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.6)]" 
        data-text   = { text }
        onclick     = { handleNavigate }
    >
        <span class="actual-text">&nbsp;{text}&nbsp;</span>
        <span aria-hidden="true" class="hover-text">&nbsp;{text}&nbsp;</span>
    </button>
</div>

<style>
    .button {
        margin: 0;
        height: auto;
        background: transparent;
        padding: 0;
        border: none;
        cursor: pointer;
    }

    .button {
        --border-right: 6px;
        --animation-color: #00e676;
        --fs-size: 1.3em;
        letter-spacing: 6px;
        text-decoration: none;
        font-size: var(--fs-size);
        font-family: "Lato";
        position: relative;
        text-transform: uppercase;
        color: transparent;
    }

    .hover-text {
        position: absolute;
        box-sizing: border-box;
        content: attr(data-text);
        color: var(--animation-color);
        width: 0%;
        inset: 0;
        border-right: var(--border-right) solid var(--animation-color);
        overflow: hidden;
        transition: 0.5s;
        -webkit-text-stroke: 1px var(--animation-color);
    }

    .button:hover .hover-text {
        width: 100%;
        filter: drop-shadow(0 0 23px var(--animation-color))
    }
</style>