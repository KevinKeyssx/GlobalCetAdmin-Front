<script lang="ts">
	import { Plus, Blocks, Rows2 } from '@lucide/svelte';

	import Breadcrum, { type BreadcrumbItem } from './Breadcrum.svelte';
	import { getStorageItem, setStorageItem } from '$lib/utils/localStorage';

	interface Props {
		title				: string;
		description			: string;
		breadcrumb			: BreadcrumbItem[];
		buttonText?			: string;
		onclick?			: () => void;
		view?				: 'cards' | 'list';
		showCancelButton?	: boolean;
		oncancel?			: () => void;
		saveButtonText?		: string;
		onsave?				: () => void;
		formId?				: string;
		isPending?			: boolean;
	}

	let {
		title,
		description,
		breadcrumb,
		buttonText,
		onclick,
		view             = $bindable( 'cards' ),
		showCancelButton = false,
		oncancel,
		saveButtonText   = 'Guardar',
		onsave,
		formId,
		isPending        = false
	} : Props = $props();

	let hasRestored = false;

	$effect( () => {
		if ( view === undefined || showCancelButton ) {
			return;
		}

		if ( !hasRestored ) {
			const savedView = getStorageItem< 'cards' | 'list' >( `view-preference-${ title }`, 'cards' );
			view        = savedView;
			hasRestored = true;
		} else {
			setStorageItem( `view-preference-${ title }`, view );
		}
	} );
</script>

<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-4 md:pb-6 w-full">
	<div class="space-y-1 w-full md:w-auto">
		<Breadcrum items={ breadcrumb } />

		<h1 class="font-display text-xl md:text-2xl lg:text-3xl font-black dark:text-white text-brand-bright uppercase tracking-wide">
			{ title }
		</h1>

		<p class="text-text-muted">
			{ description }
		</p>
	</div>

	<div class={ showCancelButton ? "flex md:grid lg:flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0" : "grid sm:flex items-center sm:justify-end gap-3 w-full md:w-auto shrink-0" }>
		{#if showCancelButton}
			<button
				type    = "button"
				onclick = { oncancel }
				class   = "w-full cursor-pointer rounded-lg border border-brand/20 bg-card/70 px-4 py-1.5 font-display text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted transition-all hover:border-brand/35 hover:bg-brand/10 hover:text-brand"
			>
				Cancelar
			</button>

			<button
				type     = { formId ? 'submit' : 'button' }
				form     = { formId }
				onclick  = { onsave }
				disabled = { isPending }
				class    = "flex text-center justify-center w-full cursor-pointer items-center gap-1.5 rounded-lg border-none bg-linear-to-tr from-brand via-brand-bright to-brand px-5 py-1.5 font-display text-[0.7rem] font-black uppercase tracking-[0.08em] text-white dark:text-brand-dark shadow-[0_0_16px_color-mix(in_srgb,var(--color-brand)_30%,transparent)] transition-all hover:shadow-[0_0_26px_color-mix(in_srgb,var(--color-brand)_50%,transparent)] disabled:cursor-not-allowed disabled:opacity-55"
			>
				{#if isPending}
					<span class="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
					Guardando…
				{:else}
					<span>{ saveButtonText }</span>
				{/if}
			</button>
		{:else}
			{#if ( view !== undefined )}
				<div class="inline-flex rounded-xl bg-surface/30 border border-brand/10 p-1 self-end md:self-auto w-full md:w-auto justify-center md:justify-start gap-1">
					<button
						type        = "button"
						onclick     = { () : void => { view = 'cards'; } }
						class       = "p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center flex-1 md:flex-initial { view === 'cards' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-brand/5 hover:text-text' }"
						title       = "Vista de Tarjetas"
						aria-label  = "Vista de Tarjetas"
					>
						<Blocks class="size-4" />
					</button>

					<button
						type        = "button"
						onclick     = { () : void => { view = 'list'; } }
						class       = "p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center flex-1 md:flex-initial { view === 'list' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-brand/5 hover:text-text' }"
						title       = "Vista de Lista"
						aria-label  = "Vista de Lista"
					>
						<Rows2 class="size-4" />
					</button>
				</div>
			{/if}

            {#if ( buttonText && onclick )}
				<button
					onclick = { onclick }
					class   = "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 md:px-3 xl:px-5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-white dark:text-brand-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright w-full md:w-auto cursor-pointer"
				>
					<Plus class="size-3 md:size-4" />

					<span class="md:hidden xl:inline text-[11px] xl:text-xs">
						{ buttonText }
					</span>
				</button>
			{/if}
		{/if}
	</div>
</header>
