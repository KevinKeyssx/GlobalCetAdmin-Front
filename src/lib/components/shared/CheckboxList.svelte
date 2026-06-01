<script lang="ts">
	import { slide } from 'svelte/transition';

	interface Item {
		id   : string;
		name : string;
	}

	interface Props {
		items     : Item[];
		selected  : Set<string>;
		isLoading : boolean;
		isError   : boolean;
		onRetry   : () => void;
	}

	let {
		items     = [],
		selected  = $bindable( new Set<string>() ),
		isLoading = false,
		isError   = false,
		onRetry,
	}: Props = $props();

	// ─── Local State: Search Value ────────────────────────────────────────────────
	let searchVal = $state( '' );

	// ─── Derived: Filtered Items ──────────────────────────────────────────────────
	const filteredItems = $derived.by( () => {
		const q = searchVal.trim().toLowerCase();
		if ( !q ) return items;
		return items.filter( ( item ) => item.name.toLowerCase().includes( q ) );
	});

	function toggleItem( id: string ): void {
		const next = new Set( selected );
		if ( next.has( id ) ) {
			next.delete( id );
		} else {
			next.add( id );
		}
		selected = next;
	}
</script>

{#if isLoading}
	<!-- Shimmer loading state -->
	<div class="flex flex-col gap-2">
		{#each Array( 4 ) as _}
			<div class="h-9 w-full animate-pulse rounded-xl bg-surface/50 border border-brand/5"></div>
		{/each}
	</div>
{:else if isError}
	<!-- Error state -->
	<div class="flex flex-col items-center justify-center py-4 text-center gap-2 rounded-xl bg-red-500/5 border border-red-500/10 p-3">
		<span class="text-xl">⚠️</span>
		<p class="text-[11px] font-semibold text-red-500">Error al cargar categorías</p>
		<button
			onclick={ onRetry }
			class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/25 transition-all duration-300"
		>
			Reintentar
		</button>
	</div>
{:else}
	<!-- Direct vertical checkbox list with search input -->
	<div class="flex flex-col gap-3">
		<!-- Search filter field -->
		<div class="relative flex items-center">
			<svg class="absolute left-3.5 h-3.5 w-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
			<input
				type="search"
				bind:value={ searchVal }
				placeholder="Buscar..."
				class="
					w-full rounded-xl border border-brand/10 bg-surface/50
					py-2 pl-9 pr-4 text-xs text-text placeholder-text-muted/65
					outline-none transition-all duration-300
					focus:border-brand/40 focus:ring-1 focus:ring-brand/20
				"
			/>
		</div>

		<!-- Scrollable list of categories -->
		<div class="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
			{#each filteredItems as item (item.id)}
				{@const isChecked = selected.has( item.id )}
				<button
					type="button"
					transition:slide={ { duration: 200 } }
					onclick={ () => toggleItem( item.id ) }
					class="
						w-full flex items-center gap-3 rounded-xl px-3 py-2.5
						transition-all duration-200 text-left border border-transparent
						{isChecked
							? 'bg-brand/10 border-brand/20 text-brand font-semibold shadow-[0_0_10px_rgba(0,230,118,0.05)]'
							: 'hover:bg-brand/5 hover:border-brand/10 text-text-muted hover:text-text'
						}
					"
				>
					<!-- Checkbox Visualizer -->
					<div
						class="
							flex h-4 w-4 shrink-0 items-center justify-center rounded
							border transition-all duration-300
							{isChecked
								? 'border-brand bg-brand text-surface-dark shadow-[0_0_8px_rgba(0,230,118,0.25)]'
								: 'border-brand/20 bg-surface'
							}
						"
					>
						{#if isChecked}
							<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</div>
					<span class="text-xs leading-tight">{item.name}</span>
				</button>
			{:else}
				<p class="text-center text-[11px] text-text-muted py-4 italic">Sin resultados</p>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* Premium Scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: var(--color-brand-muted, rgba(0, 230, 118, 0.2));
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: var(--color-brand, #00e676);
	}
</style>
