<script lang="ts">
	interface Props {
		status      : boolean;
        textTrue?   : string;
        textFalse?  : string;
	}

	let {
        status,
        textTrue    = 'Activo',
        textFalse   = 'Inactivo'
    } : Props = $props();
</script>

{#if status }
	<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 font-bold border border-emerald-500/20">
        { textTrue }
    </span>
{:else}
	<span class="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400 font-bold border border-red-500/20">
        { textFalse }
    </span>
{/if}
