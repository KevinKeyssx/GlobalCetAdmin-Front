<script lang="ts">
	import type {
        GlobalSearchProduct,
		GlobalSearchKit,
		GlobalSearchMobileLab,
	}                       from '$lib/types/search';
    import type { Product } from '$lib/types/product';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	export interface SubProduct {
		quantity : number;
		name     : string;
	}

	interface Props {
		itemType : 'product' | 'kit' | 'lab';
		item     : GlobalSearchProduct | Product | GlobalSearchKit | GlobalSearchMobileLab;
	}

	const { itemType, item }: Props = $props();

	// ─── Reactivity: Carousel State ───────────────────────────────────────────────
	let activeIndex = $state( 0 );

	// ─── Derived: Unifying properties ─────────────────────────────────────────────
	const name        = $derived( item.name );
	const description = $derived( 'description' in item ? item.description : '' );
	const sku         = $derived( ( item as any ).sku || 'N/A' );

	const categoryName = $derived.by( ( ) => {
		if ( itemType === 'product' ) {
			const prod = item as any;
			return prod.category || prod.subcategory?.category?.name || 'Producto';
		}
		if ( itemType === 'kit' ) {
			return ( item as any ).category?.name || 'Kit Científico';
		}
		if ( itemType === 'lab' ) {
			return ( item as any ).category?.name || 'Laboratorio Móvil';
		}
		return 'General';
	} );

	const material = $derived(
		itemType === 'product'
			? ( ( item as any ).material?.name || 'N/A' )
			: 'N/A'
	);

	const subcategory = $derived(
		itemType === 'product'
			? ( ( item as any ).subcategory?.name || 'N/A' )
			: 'N/A'
	);

	const dimensions = $derived(
		itemType === 'lab'
			? ( ( item as any ).dimensions || 'N/A' )
			: 'N/A'
	);

	// Components inside a Kit
	const components: Array< SubProduct > = $derived.by( ( ) => {
		if ( itemType === 'kit' && 'products' in item ) {
			const kp = item.products || [];
			return kp.map( ( p : any ) => ({
				quantity	: p.quantity,
				name		: p.product.name,
			}) );
		}
		return [];
	} );

	// Included elements inside a Mobile Lab
	const labKits: Array< SubProduct > = $derived.by( ( ) => {
		if ( itemType === 'lab' && 'kits' in item ) {
			const lk = item.kits || [];
			return lk.map( ( k : any ) => ({
				quantity	: k.quantity,
				name		: k.kit.name,
			}) );
		}
		return [];
	} );

	const labProducts: Array< SubProduct > = $derived.by( ( ) => {
		if ( itemType === 'lab' && 'products' in item ) {
			const lp = item.products || [];
			return lp.map( ( p : any ) => ({
				quantity	: p.quantity,
				name		: p.product.name,
			}) );
		}
		return [];
	} );

	// Unified image URLs list
	const images: Array< string > = $derived.by( ( ) => {
		if ( 'files' in item && item.files && item.files.length > 0 ) {
			return item.files.map( ( f ) => f.url );
		}
		if ( 'image' in item && item.image ) {
			return [ item.image ];
		}
		return [ '/images/placeholder.avif' ];
	} );

	// ─── Carousel Navigation Methods ──────────────────────────────────────────────
	function nextImage( e : Event ): void {
		e.preventDefault();
		e.stopPropagation();
		activeIndex = ( activeIndex + 1 ) % images.length;
	}

	function prevImage( e : Event ): void {
		e.preventDefault();
		e.stopPropagation();
		activeIndex = ( activeIndex - 1 + images.length ) % images.length;
	}

	function setImage( index : number, e : Event ): void {
		e.preventDefault();
		e.stopPropagation();
		activeIndex = index;
	}
</script>


<a
	href  = "/products/{ itemType }/{ item.id }"
	id    = "item-card-{ item.id }"
	class = "
		group relative flex h-full flex-col overflow-hidden rounded-2xl
		border border-brand/10 bg-card shadow-card
		transition-all duration-300
		hover:border-brand/35 hover:shadow-card-hover hover:-translate-y-1
	"
>
	<!-- Image Carousel Wrapper -->
	<div class="relative h-48 overflow-hidden bg-surface">
		<!-- Dynamic sliding slides container -->
		<div
			class="flex h-full w-full transition-transform duration-500 ease-out"
			style="transform: translateX( -{ activeIndex * 100 }% )"
		>
			{#each images as imgUrl ( imgUrl ) }
				<img
					src      = { imgUrl }
					alt      = { name }
					loading  = "lazy"
					class    = "h-full w-full shrink-0 object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			{/each}
		</div>

		<!-- Single Top-Left Type Badge -->
		<span class="
			absolute left-3 top-3 z-30
			rounded-full px-2.5 py-0.5
			text-[9px] font-black uppercase tracking-wider backdrop-blur-md
			{ itemType === 'lab'
				? 'border border-blue-400/30 bg-blue-400/20 text-blue-300'
				: itemType === 'kit'
					? 'border border-emerald-400/30 bg-emerald-400/20 text-emerald-300'
					: 'border border-brand/30 bg-brand/20 text-brand-bright'
			}
		">
			{ itemType === 'lab' ? 'Laboratorio Móvil' : itemType === 'kit' ? 'Kit Científico' : 'Producto' }
		</span>

		<!-- Left / Right Navigation Overlay Buttons ( Revealed on Hover ) -->
		{#if images.length > 1 }
			<button
				onclick    = { prevImage }
				aria-label = "Imagen anterior"
				class      = "
					absolute left-2.5 top-1/2 -translate-y-1/2 z-30
					flex h-7.5 w-7.5 items-center justify-center rounded-full
					bg-black/35 backdrop-blur-md text-white border border-white/10
					opacity-0 group-hover:opacity-100 transition-all duration-300
					hover:bg-black/60 hover:scale-105 cursor-pointer
				"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>

			<button
				onclick    = { nextImage }
				aria-label = "Siguiente imagen"
				class      = "
					absolute right-2.5 top-1/2 -translate-y-1/2 z-30
					flex h-7.5 w-7.5 items-center justify-center rounded-full
					bg-black/35 backdrop-blur-md text-white border border-white/10
					opacity-0 group-hover:opacity-100 transition-all duration-300
					hover:bg-black/60 hover:scale-105 cursor-pointer
				"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>

			<!-- Tiny indicators dots at the bottom edge of image -->
			<div class="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
				{#each images as _, idx ( idx ) }
					<button
						onclick    = { ( e ) => setImage( idx, e ) }
						aria-label = "Ir a imagen { idx + 1 }"
						class      = "
							h-1.5 rounded-full transition-all duration-300 cursor-pointer
							{ idx === activeIndex
								? 'bg-brand w-3.5 shadow-[0_0_8px_var(--color-brand)]'
								: 'bg-white/45 hover:bg-white/70 w-1.5'
							}
						"
					></button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Card Body Container -->
	<div class="flex flex-1 flex-col gap-2 p-4">

		<!-- Category and SKU Header -->
		<div class="flex flex-col">
			<span class="text-[10px] font-black uppercase tracking-widest text-brand/70 truncate">
				{ categoryName }
			</span>

            <span class="text-[9px] font-mono text-text-muted mt-0.5">
				SKU: { sku }
			</span>
		</div>

		<!-- Title and description ( Space stabilized ) -->
		<div class="flex-1 space-y-1">
			<h3 class="
				text-base font-semibold leading-snug text-text truncate
				transition-colors duration-200 group-hover:text-brand
			">
				{ name }
			</h3>

            <p class="line-clamp-2 text-[11px] leading-relaxed text-text-muted h-[ 32px ] overflow-hidden">
				{ description }
			</p>
		</div>

		<!-- Unified Specs Ficha Técnica ( Stabilized Height for Symmetry ) -->
		<div class="border-t border-brand/10 pt-3.5 h-[ 92px ] overflow-y-auto custom-scrollbar pr-1">
			{#if itemType === 'product' }
				<!-- Product specifications -->
				<div class="grid grid-cols-2 gap-3.5">
					<div class="space-y-0.5 min-w-0">
						<span class="block text-[9px] font-black uppercase tracking-wider text-brand">Material</span>
						<span class="block text-xs font-semibold text-text truncate">{ material }</span>
					</div>
					<div class="space-y-0.5 min-w-0">
						<span class="block text-[9px] font-black uppercase tracking-wider text-brand">Subcategoría</span>
						<span class="block text-xs font-semibold text-text truncate">{ subcategory }</span>
					</div>
				</div>

			{:else if itemType === 'kit' }
				<!-- Kit specifications: Components list -->
				<div class="space-y-2">
					<span class="block text-[9px] font-black uppercase tracking-wider text-brand">Componentes Incluidos</span>
					{#if components.length > 0 }
						<div class="flex flex-wrap gap-1.5">
							{#each components as kp }
								<span class="inline-flex items-center gap-1 rounded-md bg-brand/5 border border-brand/10 px-2 py-0.5 text-[10px] font-bold text-text">
									<strong class="text-brand-bright">{ kp.quantity }x</strong>
									<span class="truncate max-w-[ 100px ]">{ kp.name }</span>
								</span>
							{/each}
						</div>
					{:else}
						<span class="text-xs text-text-muted italic">Sin componentes asociados</span>
					{/if}
				</div>

			{:else if itemType === 'lab' }
				<!-- Mobile Lab specifications -->
				<div class="space-y-3">
					<!-- Dimensions row -->
					<div class="flex items-center gap-2">
						<svg class="h-3.5 w-3.5 text-brand-bright" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
							<polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
							<line x1="12" y1="22.08" x2="12" y2="12"></line>
						</svg>
						<span class="text-[10px] font-black uppercase tracking-wider text-brand">Dimensiones:</span>
						<span class="text-xs font-semibold text-text truncate">{ dimensions }</span>
					</div>

					<!-- Equipment details list -->
					<div class="space-y-1.5">
						<span class="block text-[9px] font-black uppercase tracking-wider text-brand">Equipamiento Incluido</span>
						{#if ( labKits.length > 0 || labProducts.length > 0 ) }
							<div class="flex flex-wrap gap-1.5">
								{#each labKits as lk }
									<span class="inline-flex items-center gap-1 rounded-md bg-blue-500/5 border border-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-text">
										<strong class="text-blue-400">{ lk.quantity }x</strong>
										<span class="truncate max-w-[ 90px ]">{ lk.name } (Kit)</span>
									</span>
								{/each}
								{#each labProducts as lp }
									<span class="inline-flex items-center gap-1 rounded-md bg-brand/5 border border-brand/10 px-2 py-0.5 text-[10px] font-bold text-text">
										<strong class="text-brand-bright">{ lp.quantity }x</strong>
										<span class="truncate max-w-[ 90px ]">{ lp.name }</span>
									</span>
								{/each}
							</div>
						{:else}
							<span class="text-xs text-text-muted italic">Configuración base sin kits</span>
						{/if}
					</div>
				</div>
			{/if}
		</div>

	</div>
</a>


<style>
	/* Custom Premium scrollbar for specs sheet */
	.custom-scrollbar::-webkit-scrollbar {
		width : 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background : transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background    : color-mix( in srgb, var( --color-brand ) 20%, transparent );
		border-radius : 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background : var( --color-brand );
	}
</style>
