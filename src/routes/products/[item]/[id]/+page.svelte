<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page }        from '$app/state';

	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }         from '$lib/utils/endpoints';
	import ProductSpecs                   from './components/ProductSpecs.svelte';
	import KitSpecs                       from './components/KitSpecs.svelte';
	import LabSpecs                       from './components/LabSpecs.svelte';

	// ─── Route Params ( Reactive Svelte 5 Kit ) ────────────────────────────────────
	const itemType = $derived( page.params.item );
	const itemId   = $derived( page.params.id );

	// ─── Query: Fetch Detail using server-side proxies ─────────────────────────────
	const itemQuery = createQuery( ( ) => ( {
		queryKey : [ 'itemDetail', itemType, itemId ],
		queryFn  : async ( ) => {
			let endpoint = '';
			if ( itemType === 'product' ) {
				endpoint = INTERNAL_ENDPOINTS.PRODUCTS.GET_ONE;
			} else if ( itemType === 'kit' ) {
				endpoint = INTERNAL_ENDPOINTS.KITS.GET_ONE;
			} else if ( itemType === 'lab' ) {
				endpoint = INTERNAL_ENDPOINTS.LABS.GET_ONE;
			}

			const response = await connectRequest< any >( {
				endpoint   : `${ endpoint }?id=${ itemId }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled : !!itemType && !!itemId,
	} ) );

	const item      = $derived( itemQuery.data );
	const isLoading = $derived( itemQuery.isLoading );
	const isError   = $derived( itemQuery.isError );

	// ─── Reactivity: Large Carousel State ──────────────────────────────────────────
	let activeIndex = $state( 0 );

	// ─── Description Read-More Toggle State ────────────────────────────────────────
	let isDescriptionExpanded = $state( false );

	const descLength = $derived( item?.description ? item.description.length : 0 );
	const shouldTruncate = $derived( descLength > 280 );

	const displayedDescription = $derived.by( ( ) => {
		if ( !item ) {
			return 'Sin descripción disponible para este recurso educativo.';
		}

        if ( !item.description ) {
			return 'Sin descripción disponible para este recurso educativo.';
		}

        if ( shouldTruncate && !isDescriptionExpanded ) {
			return item.description.slice( 0, 260 ) + '...';
		}

        return item.description;
	});

	const images = $derived.by( ( ) => {
		if ( !item ) return [];
		if ( item.files && item.files.length > 0 ) {
			return item.files.map( ( f : any ) => f.url );
		}
		if ( item.image ) {
			return [ item.image ];
		}
		return [ '/images/placeholder.avif' ];
	} );

	// Reset index if item changes
	$effect( ( ) => {
		item;
		activeIndex = 0;
	} );

	function nextImage( ): void {
		activeIndex = ( activeIndex + 1 ) % images.length;
	}

	function prevImage( ): void {
		activeIndex = ( activeIndex - 1 + images.length ) % images.length;
	}

	function setImage( idx : number ): void {
		activeIndex = idx;
	}

	const categoryName = $derived.by( ( ) => {
		if ( !item ) return '';
		if ( itemType === 'product' ) {
			return item.category || item.subcategory?.category?.name || 'Producto';
		}
		return item.category?.name || ( itemType === 'kit' ? 'Kit Científico' : 'Laboratorio Móvil' );
	} );
</script>


<svelte:head>
	<title>{ item ? item.name : 'Detalle de Producto' } | CET Chile SpA</title>
</svelte:head>

<!-- ─── Detail View Shell ────────────────────────────────────────────────────────── -->
<main class="mx-auto max-w-7xl px-6 py-10 sm:py-16">

	<!-- ─── Breadcrumb Navigation ─── -->
	<nav class="mb-8 flex items-center gap-2 text-xs font-semibold text-text-muted">
		<a href="/" class="hover:text-brand transition-colors">Inicio</a>
		<span>/</span>
		<a href="/catalog" class="hover:text-brand transition-colors">Catálogo</a>
		<span>/</span>
		{#if item }
			<span class="text-text-muted truncate max-w-[ 150px ]">{ categoryName }</span>
			<span>/</span>
			<span class="text-brand truncate max-w-[ 200px ]">{ item.name }</span>
		{:else}
			<span class="animate-pulse w-20 h-3.5 rounded-sm bg-brand/10"></span>
		{/if}
	</nav>

	{#if isLoading }
		<!-- Premium Loading Skeleton Grid -->
		<div class="space-y-12 animate-pulse">
			<!-- Top Grid: Image and Description Skeletons -->
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
				<!-- Left Column: Image Skeleton -->
				<div class="lg:col-span-6 h-[ 360px ] sm:h-[ 480px ] rounded-3xl bg-brand/5 border border-brand/5 shadow-card"></div>

				<!-- Right Column: Info & Description Skeletons -->
				<div class="lg:col-span-6 space-y-6 flex flex-col justify-center">
					<div class="h-6 w-24 rounded-full bg-brand/10"></div>
					<div class="space-y-3">
						<div class="h-10 w-3/4 rounded-full bg-brand/10"></div>
						<div class="h-4 w-1/3 rounded-full bg-brand/5"></div>
					</div>
					<div class="h-36 w-full rounded-2xl bg-brand/5"></div>
				</div>
			</div>

			<!-- Bottom: Full-Width Specs Skeleton -->
			<div class="space-y-4 pt-8 border-t border-brand/5">
				<div class="h-4 w-32 rounded-full bg-brand/10"></div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="h-48 rounded-2xl bg-brand/5 border border-brand/5"></div>
					<div class="h-48 rounded-2xl bg-brand/5 border border-brand/5"></div>
				</div>
			</div>
		</div>

	{:else if isError || !item }
		<!-- Elegant Error Recovery State -->
		<div class="flex flex-col items-center justify-center gap-4 py-24 text-center">
			<span class="text-4xl">⚠️</span>
			<h1 class="text-xl font-bold text-text">Error al cargar la ficha técnica</h1>
			<p class="max-w-md text-sm text-text-muted">
				No pudimos recuperar la información molecular de este elemento. Por favor, verifica el ID o intenta de nuevo más tarde.
			</p>
			<a
				href  = "/catalog"
				class = "
					mt-4 rounded-xl bg-brand/10 border border-brand/20 px-6 py-3
					text-xs font-black uppercase tracking-wider text-brand
					hover:bg-brand hover:text-surface-dark transition-all duration-300
				"
			>
				Volver al Catálogo
			</a>
		</div>

	{:else}
		<!-- Unified Detail Page Grid -->
		<div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">

			<!-- Left Column: Premium Large Image Carousel -->
			<section class="lg:col-span-6 flex flex-col gap-4">
				<div class="relative h-[ 360px ] sm:h-[ 480px ] overflow-hidden rounded-3xl border border-brand/10 bg-surface shadow-card group">

					<!-- Sliding images row -->
					<div
						class="flex h-full w-full transition-transform duration-500 ease-out"
						style="transform: translateX( -{ activeIndex * 100 }% )"
					>
						{#each images as imgUrl ( imgUrl ) }
							<img
								src   = { imgUrl }
								alt   = { item.name }
								class = "h-full w-full shrink-0 object-cover"
							/>
						{/each}
					</div>

					<!-- Navigation chevron buttons -->
					{#if images.length > 1 }
						<button
							onclick = { prevImage }
							aria-label = "Imagen anterior"
							class = "
								absolute left-4 top-1/2 -translate-y-1/2 z-20
								flex h-10 w-10 items-center justify-center rounded-full
								bg-black/35 backdrop-blur-md text-white border border-white/10
								opacity-0 group-hover:opacity-100 transition-all duration-300
								hover:bg-black/60 hover:scale-105 cursor-pointer
							"
						>
							<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
						</button>

						<button
							onclick = { nextImage }
							aria-label = "Siguiente imagen"
							class = "
								absolute right-4 top-1/2 -translate-y-1/2 z-20
								flex h-10 w-10 items-center justify-center rounded-full
								bg-black/35 backdrop-blur-md text-white border border-white/10
								opacity-0 group-hover:opacity-100 transition-all duration-300
								hover:bg-black/60 hover:scale-105 cursor-pointer
							"
						>
							<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</button>
					{/if}
				</div>

				<!-- Dots navigation carousel slider -->
				{#if images.length > 1 }
					<div class="flex items-center justify-center gap-2 pt-2">
						{#each images as _, idx ( idx ) }
							<button
								onclick    = { ( ) => setImage( idx ) }
								aria-label = "Ir a imagen { idx + 1 }"
								class      = "
									h-2 rounded-full transition-all duration-300 cursor-pointer
									{ idx === activeIndex
										? 'bg-brand w-6 shadow-[0_0_8px_var(--color-brand)]'
										: 'bg-text-muted/20 hover:bg-text-muted/40 w-2'
									}
								"
							></button>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Right Column: Info and Technical Ficha -->
			<section class="lg:col-span-6 flex flex-col gap-6">

				<!-- Meta Type Badge -->
				<div>
					<span class="
						rounded-full px-3 py-1
						text-[10px] font-black uppercase tracking-widest backdrop-blur-md
						{ itemType === 'lab'
							? 'border border-blue-400/30 bg-blue-400/20 text-blue-300'
							: itemType === 'kit'
								? 'border border-emerald-400/30 bg-emerald-400/20 text-emerald-300'
								: 'border border-brand/30 bg-brand/20 text-brand-bright'
						}
					">
						{ itemType === 'lab' ? 'Laboratorio Móvil' : itemType === 'kit' ? 'Kit Científico' : 'Producto Individual' }
					</span>
				</div>

				<!-- Main Title Header -->
				<div class="space-y-1.5">
					<h1 class="text-3xl font-extrabold font-display leading-tight text-text sm:text-4xl">
						{ item.name }
					</h1>
					<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
						<span class="font-bold text-brand uppercase tracking-wider">{ categoryName }</span>
						<span class="h-3 w-[ 1px ] bg-brand/25"></span>
						<span class="font-mono">SKU: { item.sku }</span>
					</div>
				</div>

				<!-- Educational Description Container -->
				<div class="rounded-2xl border border-brand/10 bg-surface/50 p-6 shadow-card space-y-3">
					<h4 class="text-[10px] font-black uppercase tracking-widest text-brand">Descripción del Recurso</h4>
					<p class="text-sm leading-relaxed text-text-muted">
						{ displayedDescription }
					</p>
					{#if shouldTruncate }
						<button
							onclick = { ( ) => isDescriptionExpanded = !isDescriptionExpanded }
							class   = "text-xs font-bold text-brand hover:text-brand-bright transition-colors duration-200 focus:outline-hidden cursor-pointer"
						>
							{ isDescriptionExpanded ? 'Leer menos' : 'Leer más...' }
						</button>
					{/if}
				</div>

			</section>
		</div>

        <div class="space-y-2 mt-12">
            <h4 class="text-[10px] font-black uppercase tracking-widest text-brand mb-4">Especificaciones Técnicas</h4>

            {#if itemType === 'product' }
                <ProductSpecs product={ item } />
            {:else if itemType === 'kit' }
                <KitSpecs kit={ item } />
            {:else if itemType === 'lab' }
                <LabSpecs lab={ item } />
            {/if}
        </div>
	{/if}
</main>
