<script lang="ts">
	import type {
        GlobalSearchProduct,
        GlobalSearchKit,
        GlobalSearchMobileLab
    }                       from '$lib/types/search';
	import type { Product } from '$lib/types/product';
	import ItemCard         from './ItemCard.svelte';

	// ─── Props ────────────────────────────────────────────────────────────────────
	interface Props {
		products?  : Array<GlobalSearchProduct | Product>;
		kits?      : GlobalSearchKit[];
		mobileLabs?: GlobalSearchMobileLab[];
		loading    : boolean;
	}

	const {
		products   = [],
		kits       = [],
		mobileLabs = [],
		loading    = false,
	}: Props = $props();

	// ─── Derived: Combined items for unified staggered rendering ─────────────────
	const unifiedItems = $derived.by( () => {
		const list: Array<
			| { cardType: 'product'; data: GlobalSearchProduct | Product }
			| { cardType: 'kit'; data: GlobalSearchKit }
			| { cardType: 'lab'; data: GlobalSearchMobileLab }
		> = [];

		products.forEach( ( p ) => list.push( { cardType: 'product', data: p } ) );
		kits.forEach( ( k ) => list.push( { cardType: 'kit', data: k } ) );
		mobileLabs.forEach( ( l ) => list.push( { cardType: 'lab', data: l } ) );

		return list;
	});

	const isEmpty = $derived(
		unifiedItems.length === 0
	);
</script>

<!-- ─── Grid ──────────────────────────────────────────────────────────────────── -->
<section class="flex-1 min-w-0">

	{#if loading}
		<!-- Skeleton Loading State -->
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
			{#each { length: 6 } as _, i}
				<div
					id="skeleton-card-{ i }"
					class="flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-card animate-pulse"
				>
					<div class="h-48 bg-brand/8"></div>
					<div class="flex flex-col gap-3 p-5">
						<div class="h-3 w-1/3 rounded-full bg-brand/10"></div>
						<div class="h-4 w-3/4 rounded-full bg-brand/10"></div>
						<div class="mt-2 h-3 w-1/2 rounded-full bg-brand/8"></div>
					</div>
				</div>
			{/each}
		</div>

	{:else if isEmpty}
		<!-- Empty State -->
		<div class="flex flex-col items-center justify-center gap-5 py-24 text-center">
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
				<svg class="h-9 w-9 text-brand/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<circle cx="11" cy="11" r="8"/>
					<path d="m21 21-4.35-4.35"/>
					<line x1="8" y1="11" x2="14" y2="11"/>
				</svg>
			</div>
			<div>
				<p class="text-base font-semibold text-text">Sin resultados</p>
				<p class="mt-1 text-sm text-text-muted">
					Prueba ajustando los filtros o la búsqueda
				</p>
			</div>
		</div>

	{:else}
		<!-- Unified Grid with staggered appear animation -->
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
			{#each unifiedItems as item, index ( item.data.id )}
				<div
					class="transition-all duration-300"
					style="animation-delay: { index * 60 }ms; animation: fadeSlideIn 0.35s ease-out both"
				>
					<ItemCard itemType={ item.cardType } item={ item.data } />
				</div>
			{/each}
		</div>
	{/if}

</section>
