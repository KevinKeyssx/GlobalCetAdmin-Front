<script lang="ts">
	import { resolve } from '$app/paths';

    import { ChevronLeft, ChevronRight } from '@lucide/svelte';


	export interface BreadcrumbItem {
		label  : string;
		href?  : string;
	}


    interface Props {
		items : BreadcrumbItem[];
	}


    let {
		items
	} : Props = $props();
</script>

<div class="flex items-center gap-1.5 text-text-muted text-xs font-semibold">
    <button
        aria-label="Volver"
        onclick={ () => {history.back()} }
        class="hover:text-brand transition-colors duration-400 p-0.5 hover:bg-brand-bright/20 rounded-md"
    >
        <ChevronLeft class="size-3.5" />
    </button>

	{#each items as item, index ( item.label )}
		{#if ( index > 0 ) }
			<ChevronRight class="size-3 text-text-muted/50" />
		{/if}

		{#if ( index === items.length - 1 ) }
			<span class="text-brand font-bold">{ item.label }</span>
		{:else}
			{#if ( item.href ) }
				<a href={ resolve( ( item.href ?? '' ) as any ) } class="hover:text-brand transition-colors duration-200">{ item.label }</a>
			{:else}
				<span>{ item.label }</span>
			{/if}
		{/if}
	{/each}
</div>
