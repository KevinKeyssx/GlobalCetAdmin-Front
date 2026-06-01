<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { Pagination }  from 'bits-ui';

	import type {
		GlobalSearchResponse,
		GlobalSearchProduct,
		GlobalSearchKit,
		GlobalSearchMobileLab,
	}                               from '$lib/types/search';
	import connectRequest, {
		isApiError,
	}                               from '$lib/services/fetch.service';
	import type { ProductType }     from '$lib/types/product';
	import ProductGrid              from '$lib/components/ProductGrid.svelte';
	import { INTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
	import { searchStore }          from '$lib/state/search';
	import { globalLoadingStore }   from '$lib/state/loading';
	import FilterSidebar            from './components/FilterSidebar.svelte';

	// ─── Constants ────────────────────────────────────────────────────────────────
	const allTypes: ProductType[] = [ 'Producto', 'Kit', 'Laboratorio Móvil' ];


	let selectedSubCategories = $state( new Set<string>() );
	let selectedMaterials     = $state( new Set<string>() );
	let selectedKitCategories = $state( new Set<string>() );
	let selectedLabCategories = $state( new Set<string>() );
	let activeTab             = $state( 'productos' );
	let sortBy                = $state( 'relevance' );

	// ─── Pagination State (Svelte 5 Runes) ─────────────────────────────────────────
	let page                  = $state( 1 );
	let size                  = $state( 9 );


    $effect( () => {
		selectedSubCategories;
		selectedMaterials;
		selectedKitCategories;
		selectedLabCategories;
		activeTab;
		if ( page !== 1 ) {
			page = 1;
		}
	} );

	// ─── Query: Fetch Global Searches from Backend ────────────────────────────────
	const globalSearchQuery = createQuery( () => ( {
		queryKey : [ 'globalSearch', $searchStore ],
		queryFn  : async () => {
			const params = new URLSearchParams( {
				query          : $searchStore,
				limitPerEntity : '15',
				suggestion     : 'true',
			});

			const response = await connectRequest<GlobalSearchResponse>( {
				endpoint   : `global-search?${ params.toString() }`,
				isInternal : true,
			});

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
	} ) );

	const hasActiveProductFilters = $derived( selectedSubCategories.size > 0 || selectedMaterials.size > 0 );
	const hasActiveKitFilters     = $derived( selectedKitCategories.size > 0 );
	const hasActiveLabFilters     = $derived( selectedLabCategories.size > 0 );
	const isAnyFilterActive       = $derived( hasActiveProductFilters || hasActiveKitFilters || hasActiveLabFilters );

	// ─── Query: Fetch Products paginated and filtered from Backend ──────────────
	const productsQuery = createQuery( () => ( {
		queryKey : [ 'products', Array.from( selectedSubCategories ), Array.from( selectedMaterials ), page, size ],
		queryFn  : async () => {
			const params = new URLSearchParams( {
				page : page.toString(),
				size : size.toString(),
			} );

			selectedSubCategories.forEach( ( id ) => params.append( 'subcategories', id ) );
			selectedMaterials.forEach( ( id ) => params.append( 'materials', id ) );

			const response = await connectRequest<{ data : GlobalSearchProduct[]; meta : { total : number; page : number; size : number; totalPages : number } }>( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.FILTERS }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled : activeTab === 'productos' && $searchStore === '' && hasActiveProductFilters,
	} ) );

	// ─── Query: Fetch Kits paginated and filtered from Backend ──────────────────
	const kitsQuery = createQuery( () => ( {
		queryKey : [ 'kits', Array.from( selectedKitCategories ), page, size ],
		queryFn  : async () => {
			const params = new URLSearchParams( {
				page : page.toString(),
				size : size.toString(),
			} );

			selectedKitCategories.forEach( ( id ) => params.append( 'categories', id ) );

			const response = await connectRequest<{ data : GlobalSearchKit[]; meta : { total : number; page : number; size : number; totalPages : number } }>( {
				endpoint   : `${ INTERNAL_ENDPOINTS.KITS.FILTERS }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled : activeTab === 'kits' && $searchStore === '' && hasActiveKitFilters,
	} ) );

	// ─── Query: Fetch Labs paginated and filtered from Backend ──────────────────
	const labsQuery = createQuery( () => ( {
		queryKey : [ 'labs', Array.from( selectedLabCategories ), page, size ],
		queryFn  : async () => {
			const params = new URLSearchParams({
				page : page.toString(),
				size : size.toString(),
			});

			selectedLabCategories.forEach( ( id ) => params.append( 'categories', id ) );

			const response = await connectRequest<{ data : GlobalSearchMobileLab[]; meta : { total : number; page : number; size : number; totalPages : number } }>( {
				endpoint   : `${ INTERNAL_ENDPOINTS.LABS.FILTERS }?${ params.toString() }`,
				isInternal : true,
			});

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			console.log('🚀 ~ response:', response)
			return response;
		},
		enabled : activeTab === 'lab-movil' && $searchStore === '' && hasActiveLabFilters,
	} ) );

	// ─── Derived: Collections from Query Data ──────────────────────────────────────
	const products   = $derived( globalSearchQuery.data?.products || [] );
	const kits       = $derived( globalSearchQuery.data?.kits || [] );
	const mobileLabs = $derived( globalSearchQuery.data?.mobileLabs || [] );
	const isSearchSuggestion = $derived( !!globalSearchQuery.data?.meta?.isSuggestion );

	// ─── Derived & Local Filtering ────────────────────────────────────────────────
	const filteredProducts = $derived.by( () => {
		return products.filter( ( p: GlobalSearchProduct ) => {
			const matchSub = selectedSubCategories.size === 0 || selectedSubCategories.has( p.subcategory?.id );
			const matchMat = selectedMaterials.size === 0 || selectedMaterials.has( p.material?.id );
			return matchSub && matchMat;
		} );
	} );

	const filteredKits = $derived.by( () => {
		return kits.filter( ( k: GlobalSearchKit ) => {
			return selectedKitCategories.size === 0 || selectedKitCategories.has( k.category?.id );
		} );
	} );

	const filteredLabs = $derived.by( () => {
		return mobileLabs.filter( ( l: GlobalSearchMobileLab ) => {
			return selectedLabCategories.size === 0 || selectedLabCategories.has( l.category?.id );
		} );
	} );

	// ─── Derived: Local Sorting ──────────────────────────────────────────────────
	const sortedProducts = $derived.by( () => {
		const items = [ ...filteredProducts ];
		if ( sortBy === 'name' ) {
			items.sort( ( a, b ) => a.name.localeCompare( b.name ) );
		} else if ( sortBy === 'category' ) {
			items.sort( ( a, b ) => ( a.subcategory?.category?.name || '' ).localeCompare( b.subcategory?.category?.name || '' ) );
		}
		return items;
	} );

	const sortedKits = $derived.by( () => {
		const items = [ ...filteredKits ];
		if ( sortBy === 'name' ) {
			items.sort( ( a, b ) => a.name.localeCompare( b.name ) );
		} else if ( sortBy === 'category' ) {
			items.sort( ( a, b ) => ( a.category?.name || '' ).localeCompare( b.category?.name || '' ) );
		}
		return items;
	} );

	const sortedLabs = $derived.by( () => {
		const items = [ ...filteredLabs ];
		if ( sortBy === 'name' ) {
			items.sort( ( a, b ) => a.name.localeCompare( b.name ) );
		} else if ( sortBy === 'category' ) {
			items.sort( ( a, b ) => ( a.category?.name || '' ).localeCompare( b.category?.name || '' ) );
		}
		return items;
	} );

	// ─── Derived: Display Counts ─────────────────────────────────────────────────
	const currentDisplayCount = $derived(
		( $searchStore !== '' || !isAnyFilterActive )
			? ( sortedProducts.length + sortedKits.length + sortedLabs.length )
			: ( activeTab === 'productos'
				? ( hasActiveProductFilters ? ( productsQuery.data?.meta?.total || 0 ) : sortedProducts.length )
				: ( activeTab === 'kits'
					? ( hasActiveKitFilters ? ( kitsQuery.data?.meta?.total || 0 ) : sortedKits.length )
					: ( hasActiveLabFilters ? ( labsQuery.data?.meta?.total || 0 ) : sortedLabs.length )
				)
			)
	);

	const totalDisplayCount = $derived(
		( $searchStore !== '' || !isAnyFilterActive )
			? ( products.length + kits.length + mobileLabs.length )
			: ( activeTab === 'productos'
				? ( hasActiveProductFilters ? ( productsQuery.data?.meta?.total || 0 ) : products.length )
				: ( activeTab === 'kits'
					? ( hasActiveKitFilters ? ( kitsQuery.data?.meta?.total || 0 ) : kits.length )
					: ( hasActiveLabFilters ? ( labsQuery.data?.meta?.total || 0 ) : mobileLabs.length )
				)
			)
	);

	// ─── Sync global loading store with query loading state ─────────────────────
	const activeLoadingState = $derived(
		( $searchStore !== '' || !isAnyFilterActive )
			? globalSearchQuery.isFetching
			: ( activeTab === 'productos'
				? ( hasActiveProductFilters ? productsQuery.isFetching : globalSearchQuery.isFetching )
				: ( activeTab === 'kits'
					? ( hasActiveKitFilters ? kitsQuery.isFetching : globalSearchQuery.isFetching )
					: ( hasActiveLabFilters ? labsQuery.isFetching : globalSearchQuery.isFetching )
				)
			)
	);

	$effect( ( ) => {
		$globalLoadingStore = activeLoadingState;

		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function handleSearch( value: string ): void {
		$searchStore = value;
	}

	// Reset page to 1 when filters are toggled to avoid paginating empty pages
	function toggleSubCategory( id: string ): void {
		const next = new Set( selectedSubCategories );
		if ( next.has( id ) ) {
			next.delete( id );
		} else {
			next.add( id );
		}
		selectedSubCategories = next;
		page                  = 1;
	}

	function toggleMaterial( id: string ): void {
		const next = new Set( selectedMaterials );
		if ( next.has( id ) ) {
			next.delete( id );
		} else {
			next.add( id );
		}
		selectedMaterials = next;
		page              = 1;
	}

	function toggleType( type: ProductType ): void {
		// No-op or type selector logic if type pill clicked
	}

	function clearAll(): void {
		selectedSubCategories = new Set();
		selectedMaterials     = new Set();
		selectedKitCategories = new Set();
		selectedLabCategories = new Set();
		$searchStore          = '';
		page                  = 1;
	}
</script>

<svelte:head>
	<title>Catálogo de Productos - Kits - Laboratorios Móbiles | GlobalCET</title>
	<meta name="description" content="Explora el catálogo de productos de bioquímica de GlobalCET: material de vidrio, reactivos, kits de laboratorio y sistemas completos." />
</svelte:head>

<!-- ─── Hero Banner ───────────────────────────────────────────────────────────── -->
<section class="relative overflow-hidden border-b border-brand/10 px-6 py-20 lg:py-6">
	<!-- Dynamic Animated Background Elements -->
	<div class="pointer-events-none absolute -top-32 -left-10 h-[500px] w-[500px] animate-pulse rounded-full bg-brand/15 blur-[100px] duration-10000"></div>
	<div class="pointer-events-none absolute top-10 right-0 h-[400px] w-[400px] animate-pulse rounded-full bg-brand/10 blur-[80px] duration-7000" style="animation-delay: 2s;"></div>
	<div class="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-linear-to-r from-brand/0 via-brand/10 to-brand/0 blur-3xl"></div>

	<div class="relative mx-auto flex max-w-7xl flex-col items-center text-center px-6 space-y-2">
		<span class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand backdrop-blur-md shadow-[0_0_15px_rgba(0,181,100,0.15)]">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
			</span>
			Catálogo { new Date().getFullYear() }
		</span>

		<!-- <h1 class="font-display mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-text sm:text-6xl md:text-7xl">
			Equipamiento Científico
			<br />
			<span class="bg-linear-to-r from-brand-muted via-brand to-brand-bright bg-clip-text text-transparent drop-shadow-sm">
				de Precisión
			</span>
		</h1> -->

		<p class="mx-auto max-w-2xl text-md text-text-muted leading-relaxed font-medium">
			Encuentra los insumos y equipos que tu laboratorio necesita. Calidad certificada para investigación y educación científica.
		</p>
	</div>
</section>

<!-- ─── Main Content ──────────────────────────────────────────────────────────── -->
<main class="mx-auto flex max-w-7xl gap-8 px-6 py-8">
	<!-- Sidebar -->
	<FilterSidebar
		types={ allTypes }
		bind:selectedSubCategories
		bind:selectedMaterials
		bind:selectedKitCategories
		bind:selectedLabCategories
		bind:activeTab
		selectedTypes={ new Set() }
		filteredCount={ currentDisplayCount }
		totalCount={ totalDisplayCount }
		onSubCategoryToggle={ toggleSubCategory }
		onMaterialToggle={ toggleMaterial }
		onTypeToggle={ toggleType }
		onClearAll={ clearAll }
	/>

	<!-- Content area -->
	<div class="flex flex-1 min-w-0 flex-col gap-6">
		<!-- Toolbar row -->
		<div class="flex items-center justify-between">
			<p class="text-sm text-text-muted">
				Mostrando
				<span class="font-semibold text-text">{ currentDisplayCount }</span>
				resultado{ currentDisplayCount !== 1 ? 's' : '' }
			</p>

			<div class="flex items-center gap-2 text-xs text-text-muted">
				<span class="hidden sm:inline">Ordenar por:</span>
				<select
					id="sort-select"
					bind:value={ sortBy }
					class="
						rounded-lg border border-brand/20 bg-input
						px-3 py-1.5 text-xs text-text
						outline-none transition-colors duration-200
						focus:border-brand focus:ring-1 focus:ring-brand/25
					"
				>
					<option value="relevance">Relevancia</option>
					<option value="name">Nombre A–Z</option>
					<option value="category">Categoría</option>
				</select>
			</div>
		</div>

		{#if ( $searchStore !== '' && isSearchSuggestion ) }
			<div class="mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-text backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.1)] flex items-start gap-4 animate-fade-in">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
				</div>
				<div class="space-y-1 flex-1">
					<p class="font-display text-base font-bold text-amber-400">No se encontraron resultados para "{ $searchStore }"</p>
					<p class="text-xs text-text-muted leading-relaxed font-medium">
						No hemos encontrado ninguna coincidencia exacta para lo que estás buscando en nuestro catálogo actual. Para ayudarte a encontrar lo que necesitas, te sugerimos los siguientes equipos y materiales científicos relacionados:
					</p>
				</div>
			</div>
		{/if}

		<!-- Unified Product & Kit & Lab Grid -->
		<ProductGrid
			products={ ( $searchStore !== '' || !isAnyFilterActive )
				? sortedProducts
				: ( activeTab === 'productos'
					? ( hasActiveProductFilters ? ( productsQuery.data?.data || [] ) : sortedProducts )
					: []
				)
			}
			kits={ ( $searchStore !== '' || !isAnyFilterActive )
				? sortedKits
				: ( activeTab === 'kits'
					? ( hasActiveKitFilters ? ( kitsQuery.data?.data || [] ) : sortedKits )
					: []
				)
			}
			mobileLabs={ ( $searchStore !== '' || !isAnyFilterActive )
				? sortedLabs
				: ( activeTab === 'lab-movil'
					? ( hasActiveLabFilters ? ( labsQuery.data?.data || [] ) : sortedLabs )
					: []
				)
			}
			loading={ ( $searchStore !== '' || !isAnyFilterActive )
				? globalSearchQuery.isLoading
				: ( activeTab === 'productos'
					? ( hasActiveProductFilters ? productsQuery.isLoading : globalSearchQuery.isLoading )
					: ( activeTab === 'kits'
						? ( hasActiveKitFilters ? kitsQuery.isLoading : globalSearchQuery.isLoading )
						: ( hasActiveLabFilters ? labsQuery.isLoading : globalSearchQuery.isLoading )
					)
				)
			}
		/>

		<!-- Interlocking Paginated Controls -->
		{#if $searchStore === '' && activeTab === 'productos' && hasActiveProductFilters && productsQuery.data && productsQuery.data.meta.totalPages > 1}
			<Pagination.Root
				count={ productsQuery.data.meta.total }
				perPage={ size }
				bind:page={ page }
			>
				{#snippet children( { pages } )}
					<div class="flex items-center justify-center gap-2 mt-8">
						<Pagination.PrevButton
							class="
								inline-flex h-9 w-9 items-center justify-center rounded-xl
								border border-brand/10 bg-surface/30 text-text
								transition-all duration-300
								hover:bg-brand/10 hover:text-brand
								disabled:pointer-events-none disabled:opacity-40
							"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
						</Pagination.PrevButton>

						{#each pages as p ( p.key )}
							{#if p.type === 'ellipsis'}
								<span class="inline-flex h-9 w-9 items-center justify-center text-xs font-bold text-text-muted">...</span>
							{:else}
								<Pagination.Page
									page={ p }
									class="
										inline-flex h-9 w-9 items-center justify-center rounded-xl
										border border-brand/10 bg-surface/30 text-xs font-bold text-text-muted
										transition-all duration-300
										hover:bg-brand/10 hover:text-brand
										data-selected:bg-brand data-selected:text-surface-dark data-selected:border-brand data-selected:shadow-md
									"
								>
									{ p.value }
								</Pagination.Page>
							{/if}
						{/each}

						<Pagination.NextButton
							class="
								inline-flex h-9 w-9 items-center justify-center rounded-xl
								border border-brand/10 bg-surface/30 text-text
								transition-all duration-300
								hover:bg-brand/10 hover:text-brand
								disabled:pointer-events-none disabled:opacity-40
							"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</Pagination.NextButton>
					</div>
				{/snippet}
			</Pagination.Root>
		{/if}

		{#if $searchStore === '' && activeTab === 'kits' && hasActiveKitFilters && kitsQuery.data && kitsQuery.data.meta.totalPages > 1}
			<Pagination.Root
				count={ kitsQuery.data.meta.total }
				perPage={ size }
				bind:page={ page }
			>
				{#snippet children( { pages } )}
					<div class="flex items-center justify-center gap-2 mt-8">
						<Pagination.PrevButton
							class="
								inline-flex h-9 w-9 items-center justify-center rounded-xl
								border border-brand/10 bg-surface/30 text-text
								transition-all duration-300
								hover:bg-brand/10 hover:text-brand
								disabled:pointer-events-none disabled:opacity-40
							"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
						</Pagination.PrevButton>

						{#each pages as p ( p.key )}
							{#if p.type === 'ellipsis'}
								<span class="inline-flex h-9 w-9 items-center justify-center text-xs font-bold text-text-muted">...</span>
							{:else}
								<Pagination.Page
									page={ p }
									class="
										inline-flex h-9 w-9 items-center justify-center rounded-xl
										border border-brand/10 bg-surface/30 text-xs font-bold text-text-muted
										transition-all duration-300
										hover:bg-brand/10 hover:text-brand
										data-selected:bg-brand data-selected:text-surface-dark data-selected:border-brand data-selected:shadow-md
									"
								>
									{ p.value }
								</Pagination.Page>
							{/if}
						{/each}

						<Pagination.NextButton
							class="
								inline-flex h-9 w-9 items-center justify-center rounded-xl
								border border-brand/10 bg-surface/30 text-text
								transition-all duration-300
								hover:bg-brand/10 hover:text-brand
								disabled:pointer-events-none disabled:opacity-40
							"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</Pagination.NextButton>
					</div>
				{/snippet}
			</Pagination.Root>
		{/if}

		{#if $searchStore === '' && activeTab === 'lab-movil' && hasActiveLabFilters && labsQuery.data && labsQuery.data.meta.totalPages > 1}
			<Pagination.Root
				count={ labsQuery.data.meta.total }
				perPage={ size }
				bind:page={ page }
			>
				{#snippet children( { pages } )}
					<div class="flex items-center justify-center gap-2 mt-8">
						<Pagination.PrevButton
							class="
								inline-flex h-9 w-9 items-center justify-center rounded-xl
								border border-brand/10 bg-surface/30 text-text
								transition-all duration-300
								hover:bg-brand/10 hover:text-brand
								disabled:pointer-events-none disabled:opacity-40
							"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
						</Pagination.PrevButton>

						{#each pages as p ( p.key )}
							{#if p.type === 'ellipsis'}
								<span class="inline-flex h-9 w-9 items-center justify-center text-xs font-bold text-text-muted">...</span>
							{:else}
								<Pagination.Page
									page={ p }
									class="
										inline-flex h-9 w-9 items-center justify-center rounded-xl
										border border-brand/10 bg-surface/30 text-xs font-bold text-text-muted
										transition-all duration-300
										hover:bg-brand/10 hover:text-brand
										data-selected:bg-brand data-selected:text-surface-dark data-selected:border-brand data-selected:shadow-md
									"
								>
									{ p.value }
								</Pagination.Page>
							{/if}
						{/each}

						<Pagination.NextButton
							class="
								inline-flex h-9 w-9 items-center justify-center rounded-xl
								border border-brand/10 bg-surface/30 text-text
								transition-all duration-300
								hover:bg-brand/10 hover:text-brand
								disabled:pointer-events-none disabled:opacity-40
							"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</Pagination.NextButton>
					</div>
				{/snippet}
			</Pagination.Root>
		{/if}
	</div>
</main>
