<script lang="ts">
	interface Props {
		status      : boolean;
        textTrue?   : string;
        textFalse?  : string;
        color?      : boolean;
	}

	let {
        status,
        textTrue    = 'Activo',
        textFalse   = 'Inactivo',
        color = false 
    } : Props = $props();
</script>

{#if status }
	<span class="rounded-full {
        color
            ? 'bg-emerald-500/80 text-emerald-100'
            : 'bg-emerald-500/10 text-emerald-400'
        } px-2 py-0.5 text-xs font-bold border border-emerald-500/20"
    >
        { textTrue }
    </span>
{:else}
	<span class="rounded-full {
        color
            ? 'bg-red-500/80 text-red-100'
            : 'bg-red-500/10 text-red-400'
        } px-2 py-0.5 text-xs font-bold border border-red-500/20"
    >
        { textFalse }
    </span>
{/if}
