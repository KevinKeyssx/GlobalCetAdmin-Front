<script lang="ts">
	import { Plus, Blocks, Rows2 }            from '@lucide/svelte';
	import Breadcrum, { type BreadcrumbItem } from './Breadcrum.svelte';
	import { getStorageItem, setStorageItem } from '$lib/utils/localStorage';

	interface Props {
		title		: string;
		description	: string;
		breadcrumb	: BreadcrumbItem[];
		buttonText?	: string;
		onclick?	: () => void;
		view?		: 'cards' | 'list';
	}

	let {
		title,
		description,
		breadcrumb,
		buttonText,
		onclick,
		view = $bindable( 'cards' )
	} : Props = $props();

	let hasRestored = false;

	$effect( ( ) => {
		if ( view === undefined ) {
			return;
		}

		if ( !hasRestored ) {
			const savedView = getStorageItem< 'cards' | 'list' >( `view-preference-${ title }`, 'cards' );
			view		= savedView;
			hasRestored	= true;
		} else {
			setStorageItem( `view-preference-${ title }`, view );
		}
	} );
</script>

<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6 w-full">
	<div class="space-y-1 w-full md:w-auto">
		<Breadcrum items={ breadcrumb } />

		<h1 class="font-display text-xl md:text-3xl font-black text-text uppercase tracking-wide">
			{ title }
		</h1>

		<p class="text-text-muted">
			{ description }
		</p>
	</div>

	<div class="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto shrink-0">
		{#if ( buttonText && onclick ) }
			<button
				onclick = { onclick }
				class   = "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 md:px-3 xl:px-5 py-2 xl:py-3 font-display text-xs font-semibold uppercase tracking-wider text-white dark:text-brand-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright w-full md:w-auto cursor-pointer"
			>
				<Plus class="size-3 md:size-4" />

				<span class="md:hidden xl:inline text-[11px] xl:text-xs">
					{ buttonText }
				</span>
			</button>
		{/if}

		{#if ( view !== undefined ) }
			<div class="inline-flex rounded-xl bg-surface/30 border border-brand/10 p-1 self-end md:self-auto w-full md:w-auto justify-center md:justify-start gap-1">
				<button
					type="button"
					onclick={ () : void => { view = 'cards'; } }
					class="p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center flex-1 md:flex-initial { view === 'cards' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-brand/5 hover:text-text' }"
					title="Vista de Tarjetas"
					aria-label="Vista de Tarjetas"
				>
					<Blocks class="size-4" />
				</button>

                <button
					type="button"
					onclick={ () : void => { view = 'list'; } }
					class="p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center flex-1 md:flex-initial { view === 'list' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-brand/5 hover:text-text' }"
					title="Vista de Lista"
					aria-label="Vista de Lista"
				>
					<Rows2 class="size-4" />
				</button>
			</div>
		{/if}
	</div>
</header>
