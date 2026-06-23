<script lang="ts">
	import {
        createQuery,
        createMutation,
        useQueryClient
    }                           from '@tanstack/svelte-query';
	import toast                from 'svelte-french-toast';
	import { BrushCleaning }    from '@lucide/svelte';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Pagination                       from '$lib/components/shared/Pagination.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import Select                           from '$lib/components/shared/Inputs/Select.svelte';
	import SearchInput                      from '$lib/components/shared/Inputs/SearchInput.svelte';
	import type { Category, SubCategory }   from '$lib/types/category';
	import CategoryCard                     from '$lib/components/shared/itemCard/CategoryCard.svelte';
	import CardSkeleton                     from '$lib/components/shared/CardSkeleton.svelte';
	import ListSkeleton                     from '$lib/components/shared/ListSkeleton.svelte';


	// ─── Paginated Response Interface ──────────────────────────────────────────────
	interface PaginatedResponse< T > {
		data : T[];
		meta : {
			total      : number;
			page       : number;
			size       : number;
			totalPages : number;
		};
	}

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	let activeTab         = $state( 'categories' ); // 'categories' | 'subcategories'
	let search            = $state( '' );
	let debouncedSearch   = $state( '' );
	let activeStatus      = $state( 'all' ); // 'all' | 'true' | 'false'
	let order             = $state( 'name' );
	let typeOrder         = $state( 'asc' );
	let categoriesPage    = $state( 1 );
	let subcategoriesPage = $state( 1 );
	let size              = $state( 12 );
	let view              = $state< 'cards' | 'list' >( 'cards' );
	let showModal         = $state( false );
	let isEditing         = $state( false );
	let editingId         = $state( '' );
	let editingCategory   = $state<{ name : string; parentCatId? : string; active? : boolean; } | null>( null );
	let deletingId        = $state( '' );
	let selectedCategories = $state( new Set< string >() );

	const statusOptions = [
		{
			id   : 'all',
			name : 'Todos los estados'
		},
		{
			id   : 'true',
			name : 'Activos'
		},
		{
			id   : 'false',
			name : 'Inactivos'
		}
	];

	// Reset to page 1 on filter changes
	$effect( ( ) => {
		const _ = [ debouncedSearch, activeStatus, Array.from( selectedCategories ), size ];
		categoriesPage    = 1;
		subcategoriesPage = 1;
	});

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const categoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'categories', categoriesPage, size, debouncedSearch, activeStatus, order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< Category > > => {
			const params = new URLSearchParams( {
				type                 : 'category',
				page                 : categoriesPage.toString(),
				size                 : size.toString(),
				orderBy              : order,
				order                : typeOrder,
				includeSubcategories : 'true',
			} );

			if ( debouncedSearch.trim() ) {
				params.append( 'name', debouncedSearch.trim() );
			}

			if ( activeStatus !== 'all' ) {
				params.append( 'active', activeStatus );
			}

			const response = await connectRequest< PaginatedResponse< Category > >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.BASE }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response )) {
				throw new Error( 'No se pudieron cargar las categorías.' );
			}

			return response;
		},
		enabled  : activeTab === 'categories',
	}));


	const allCategoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'categories', 'all' ],
		queryFn  : async ( ) : Promise< Category[] > => {
			const response = await connectRequest< Category[] >( {
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'No se pudieron cargar todas las categorías.' );
			}

			return response || [];
		},
	}));


    const allCategories = $derived( allCategoriesQuery.data || [] );


    const subcategoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'subcategories', subcategoriesPage, size, debouncedSearch, activeStatus, Array.from( selectedCategories ), order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< SubCategory > > => {
			const params = new URLSearchParams( {
				type            : 'subcategory',
				page            : subcategoriesPage.toString(),
				size            : size.toString(),
				orderBy         : order,
				order           : typeOrder,
				includeCategory : 'true',
			} );

			if ( debouncedSearch.trim() ) {
				params.append( 'name', debouncedSearch.trim() );
			}

			if ( activeStatus !== 'all' ) {
				params.append( 'active', activeStatus );
			}

			Array.from( selectedCategories ).forEach( ( id ) => {
				params.append( 'categoryIds', id );
			} );

			const response = await connectRequest< PaginatedResponse< SubCategory > >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.BASE }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'No se pudieron cargar las subcategorías.' );
			}

			return response;
		},
		enabled  : activeTab === 'subcategories',
	}));


    const deleteMutation = createMutation( ( ) => ( {
		mutationFn : async ( id : string ) : Promise< any > => {
			const isSub    = activeTab === 'subcategories';
			const path     = isSub ? `${ INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.BASE }?type=subcategory` : INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.BASE;
			const response = await connectRequest< any >( {
				endpoint   : `${ path }${ isSub ? '&' : '?' }id=${ id }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( ) => {
			toast.success( 'Registro eliminado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'categories' ] } );
			queryClient.invalidateQueries( { queryKey : [ 'subcategories' ] } );
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al intentar eliminar.' );
		},
	} ) );


    $effect( ( ) => {
		$globalLoadingStore = categoriesQuery.isFetching || subcategoriesQuery.isFetching || deleteMutation.isPending;
		return ( ) => {
			$globalLoadingStore = false;
		};
	});

	function clearFilters( ) : void {
		search             = '';
		debouncedSearch    = '';
		activeStatus       = 'all';
		selectedCategories = new Set< string >();
	}

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal( ) : void {
		isEditing       = false;
		editingId       = '';
		editingCategory = null;
		showModal       = true;
	}

	function openEditModal( item : any ) : void {
		isEditing       = true;
		editingId       = item.id;
		editingCategory = {
			name        : item.name,
			parentCatId : activeTab === 'subcategories' ? ( item.categoryId || '' ) : '',
			active      : item.active,
		};
		showModal       = true;
	}

	function deleteItem( id : string ) : void {
		deletingId = id;
		deleteMutation.mutate( id, {
			onSettled : ( ) => {
				deletingId = '';
			}
		} );
	}

	function toggleSort( field : string ) : void {
		if ( order === field ) {
			typeOrder = typeOrder === 'asc' ? 'desc' : 'asc';
		} else {
			order     = field;
			typeOrder = 'asc';
		}
	}
</script>

<svelte:head>
	<title>Administrar Categorías - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-4 sm:space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<HeaderPage
			title       = "Categorías de Productos"
			description = "Administre las categorías analíticas y subcategorías estructuradas de sus productos científicos."
			breadcrumb  = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Categorías & Subcategorías de Productos'
				}
			] }
			buttonText  = { activeTab === 'categories' ? 'Agregar Categoría' : 'Agregar Subcategoría' }
			onclick     = { openCreateModal }
			bind:view   = { view }
		/>


		<!-- ─── Tab Switcher ────────────────────────────────────────────────────── -->
		<div class="flex rounded-xl bg-input p-1 border border-brand/10 max-w-xs gap-1 text-xs">
			<button
				onclick={ ( ) => { activeTab = 'categories'; } }
				class="flex-1 rounded-lg px-4 py-1 font-bold tracking-wider uppercase transition-all duration-200 { activeTab === 'categories' ? 'bg-brand text-surface-dark shadow-sm' : 'text-text-muted hover:text-text' }"
			>
				Categorías
			</button>
			<button
				onclick={ ( ) => { activeTab = 'subcategories'; } }
				class="flex-1 rounded-lg px-4 py-1 font-bold tracking-wider uppercase transition-all duration-200 { activeTab === 'subcategories' ? 'bg-brand text-surface-dark shadow-sm' : 'text-text-muted hover:text-text' }"
			>
				Subcategorías
			</button>
		</div>

		<!-- ─── Search & Filter Tool ────────────────────────────────────────────── -->
		<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-end bg-card/40 border border-brand/10 p-4 rounded-2xl w-full text-xs">
			<!-- Search -->
			<div class="space-y-1.5 w-full { activeTab === 'categories' ? 'sm:col-span-2 md:col-span-3' : 'sm:col-span-2 md:col-span-2' }">
				<label for="search-input" class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Buscar</label>
				<SearchInput
					bind:value          = { search }
					bind:debouncedValue = { debouncedSearch }
					placeholder         = "Buscar..."
				/>
			</div>

			<!-- Categories Select (only for subcategories) -->
			{#if ( activeTab === 'subcategories' )}
				<div class="space-y-1.5 w-full sm:col-span-1 md:col-span-1">
					<span class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Categorías</span>
					<Select
						options       = { allCategories }
						bind:selected = { selectedCategories }
						multiple      = { true }
						placeholder   = "Categorías"
					/>
				</div>
			{/if}

			<!-- Status Select and Reset -->
			<div class="flex flex-row gap-2 w-full font-semibold text-text-muted items-end sm:col-span-1 md:col-span-1">
				<div class="space-y-1.5 flex-1 w-full">
					<span class="font-bold uppercase tracking-wider block mb-1.5">Estado</span>
					<Select
						bind:value  = { activeStatus }
						options     = { statusOptions }
						multiple    = { false }
						searching   = { false }
						placeholder = "Todos los estados"
					/>
				</div>

				{#if ( activeStatus !== 'all' || selectedCategories.size > 0 || search ) }
					<button
						onclick = { clearFilters }
						class   = "p-2.5 rounded-xl border border-brand/15 bg-brand/10 text-brand hover:bg-brand hover:text-surface-dark transition-all duration-300 shadow-sm h-[46px] aspect-square flex items-center justify-center cursor-pointer"
						title   = "Limpiar Filtros"
					>
						<BrushCleaning class="size-4" />
					</button>
				{/if}
			</div>
		</div>

		<!-- ─── Content Lists ──────────────────────────────────────────────────────── -->
		{#if ( activeTab === 'categories' )}
			{#if ( view === 'cards' )}
				{#if ( categoriesQuery.isPending )}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
						{#each Array.from( { length : size } ) as _}
							<CardSkeleton type="category" />
						{/each}
					</div>
				{:else if ( categoriesQuery.data?.data && categoriesQuery.data.data.length > 0 )}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
						{#each ( categoriesQuery.data.data ) as cat ( cat.id )}
							<CategoryCard
								itemType        = "category"
								item            = { cat }
								openEditModal   = { openEditModal }
								deleteItem      = { ( c ) => deleteItem( c.id ) }
								isDeleteLoading = { deletingId === cat.id }
								confirmTitle    = "¿Eliminar categoría?"
								confirmMessage  = "¿Está seguro de que desea eliminar esta categoría y todas sus subcategorías? Esta acción no se puede deshacer."
							/>
						{/each}
					</div>
				{:else}
					<div class="rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted leading-relaxed">
						No hay categorías registradas.
					</div>
				{/if}
			{:else}
				<!-- Categories View -->
				<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card animate-fade-in space-y-4 pb-4">
					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
									<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'name' ) }>
										Nombre de Categoría { order === 'name' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
									</th>
									<th class="px-6 py-4">Subcategorías Asociadas</th>
									<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'active' ) }>
										Estado { order === 'active' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
									</th>
									<th class="px-6 py-4 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-brand/10 font-semibold">
								{#if ( categoriesQuery.isPending )}
									<ListSkeleton columns={ 4 } rows={ 5 } />
								{:else if ( categoriesQuery.data?.data && categoriesQuery.data.data.length > 0 )}
									{#each ( categoriesQuery.data.data ) as cat ( cat.id )}
										<tr class="hover:bg-brand/5 transition-colors duration-150">
											<td class="px-6 py-4 font-bold text-text">{ cat.name }</td>
											<td class="px-6 py-4">
												<div class="flex flex-wrap gap-1.5">
													{#each ( cat.subCategories || [] ) as sub ( sub.id )}
														<span class="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] text-brand border border-brand/15">
															{ sub.name }
														</span>
													{:else}
														<span class="text-text-muted text-[10px]">Sin subcategorías</span>
													{/each}
												</div>
											</td>
											<td class="px-6 py-4">
												<span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold border { cat.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' : 'bg-rose-500/10 text-rose-500 border-rose-500/15' }">
													{ cat.active ? 'Activo' : 'Inactivo' }
												</span>
											</td>
											<td class="px-6 py-4 text-right">
												<TableActions
													item            = { cat }
													openEditModal   = { openEditModal }
													deleteItem      = { ( c ) => deleteItem( c.id ) }
													isDeleteLoading = { deletingId === cat.id }
													confirmTitle    = "¿Eliminar categoría?"
													confirmMessage  = "¿Está seguro de que desea eliminar esta categoría y todas sus subcategorías? Esta acción no se puede deshacer."
												/>
											</td>
										</tr>
									{/each}
								{:else}
									<tr>
										<td colspan="4" class="px-6 py-12 text-center text-text-muted leading-relaxed">
											No hay categorías registradas.
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</section>
			{/if}

			{#if ( categoriesQuery.data?.meta && categoriesQuery.data.meta.total > 0 )}
				<div class="flex justify-center pt-4">
					<Pagination
						bind:page={ categoriesPage }
						count={ categoriesQuery.data.meta.total }
						bind:perPage={ size }
					/>
				</div>
			{/if}
		{:else}
			{#if ( view === 'cards' )}
				{#if ( subcategoriesQuery.isPending )}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
						{#each Array.from( { length : size } ) as _}
							<CardSkeleton type="category" />
						{/each}
					</div>
				{:else if ( subcategoriesQuery.data?.data && subcategoriesQuery.data.data.length > 0 )}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
						{#each ( subcategoriesQuery.data.data ) as sub ( sub.id )}
							<CategoryCard
								itemType        = "subcategory"
								item            = { sub }
								openEditModal   = { openEditModal }
								deleteItem      = { ( s ) => deleteItem( s.id ) }
								isDeleteLoading = { deletingId === sub.id }
								confirmTitle    = "¿Eliminar subcategoría?"
								confirmMessage  = "¿Está seguro de que desea eliminar esta subcategoría? Esta acción no se puede deshacer."
							/>
						{/each}
					</div>
				{:else}
					<div class="rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted leading-relaxed">
						No hay subcategorías registradas. Cree una categoría padre primero.
					</div>
				{/if}
			{:else}
				<!-- Subcategories View -->
				<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card animate-fade-in space-y-4 pb-4">
					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
									<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'name' ) }>
										Nombre de Subcategoría { order === 'name' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
									</th>
									<th class="px-6 py-4">Categoría Padre</th>
									<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'active' ) }>
										Estado { order === 'active' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
									</th>
									<th class="px-6 py-4 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-brand/10 font-semibold">
								{#if ( subcategoriesQuery.isPending )}
									<ListSkeleton columns={ 4 } rows={ 5 } />
								{:else if ( subcategoriesQuery.data?.data && subcategoriesQuery.data.data.length > 0 )}
									{#each ( subcategoriesQuery.data.data ) as sub ( sub.id )}
										<tr class="hover:bg-brand/5 transition-colors duration-150">
											<td class="px-6 py-4 font-bold text-text">{ sub.name }</td>
											<td class="px-6 py-4 font-bold text-brand uppercase tracking-wider text-[10px]">
												{ sub.category?.name || 'Sin Categoría' }
											</td>
											<td class="px-6 py-4">
												<span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold border { sub.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' : 'bg-rose-500/10 text-rose-500 border-rose-500/15' }">
													{ sub.active ? 'Activo' : 'Inactivo' }
												</span>
											</td>
											<td class="px-6 py-4 text-right">
												<TableActions
													item            = { sub }
													openEditModal   = { openEditModal }
													deleteItem      = { ( s ) => deleteItem( s.id ) }
													isDeleteLoading = { deletingId === sub.id }
													confirmTitle    = "¿Eliminar subcategoría?"
													confirmMessage  = "¿Está seguro de que desea eliminar esta subcategoría? Esta acción no se puede deshacer."
												/>
											</td>
										</tr>
									{/each}
								{:else}
									<tr>
										<td colspan="4" class="px-6 py-12 text-center text-text-muted leading-relaxed">
											No hay subcategorías registradas. Cree una categoría padre primero.
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</section>
			{/if}

			{#if ( subcategoriesQuery.data?.meta && subcategoriesQuery.data.meta.total > 0 )}
				<div class="flex justify-center pt-4">
					<Pagination
						bind:page={ subcategoriesPage }
						count={ subcategoriesQuery.data.meta.total }
						bind:perPage={ size }
					/>
				</div>
			{/if}
		{/if}

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<CategoryFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				context="products"
				{ activeTab }
				categories={ allCategoriesQuery.data || [] }
				initialData={ editingCategory }
				onSave={ ( ) => {
					showModal = false;
				} }
				onCancel={ ( ) => {
					showModal = false;
				} }
			/>
		{/if}
	</div>
</main>
