<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { createQuery, useQueryClient }  from '@tanstack/svelte-query';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import LabFormModal                     from './components/LabFormModal.svelte';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Status                           from '$lib/components/shared/Status.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import CatalogFilters                   from '$lib/components/shared/CatalogFilters.svelte';
	import Pagination                       from '$lib/components/shared/Pagination.svelte';
	import { stripHtml }                    from '$lib/utils/string';
	import ItemCard                         from '$lib/components/shared/itemCard/ItemCard.svelte';
	import CardSkeleton                     from '$lib/components/shared/CardSkeleton.svelte';
	import ListSkeleton                     from '$lib/components/shared/ListSkeleton.svelte';


	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface ProductRelation {
		id   : string;
		name : string;
		sku  : string;
	}

	interface KitRelation {
		id   : string;
		name : string;
		sku  : string;
	}

	interface LabProduct {
		productId : string;
		quantity  : number;
		product?  : ProductRelation;
	}

	interface LabKit {
		kitId    : string;
		quantity : number;
		kit?     : KitRelation;
	}

	interface MobileLab {
		id           : string;
		sku          : string;
		name         : string;
		description  : string;
		dimensions   : string;
		active       : boolean;
		files        : Array<{ id : string; url : string; alt : string; isMain : boolean }>;
		category     : { id : string; name : string };
		products     : LabProduct[];
		kits         : LabKit[];
		currentPrice?: number;
		currentStock?: number;
		minStock?    : number;
		maxStock?    : number;
	}

	interface LabCategory {
		id   : string;
		name : string;
	}

	interface CatalogProduct {
		id   : string;
		name : string;
		sku  : string;
	}

	interface CatalogKit {
		id   : string;
		name : string;
		sku  : string;
	}

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
	let search             = $state( '' );
	let debouncedSearch    = $state( '' );
	let activeStatus       = $state( 'all' );
	let selectedCategories = $state( new Set< string >() );
	let page               = $state( 1 );
	let size               = $state( 12 );
	let view               = $state< 'cards' | 'list' >( 'cards' );
	let showModal          = $state( false );
	let isEditing          = $state( false );
	let editingId          = $state( '' );
	let editingLab         = $state< any >( null );
	let deletingId         = $state( '' );
	let duplicatingId      = $state( '' );


	// Reset to page 1 on filter changes
	$effect( ( ) => {
		const _ = [ debouncedSearch, activeStatus, Array.from( selectedCategories ), size ];
		page = 1;
	} );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const labsQuery = createQuery( ( ) => ( {
		queryKey : [ 'admin-labs', page, size, debouncedSearch, activeStatus, Array.from( selectedCategories ) ],
		queryFn  : async ( ) : Promise< PaginatedResponse< MobileLab > > => {
			const params = new URLSearchParams( {
				page : page.toString(),
				size : size.toString(),
			} );

			if ( debouncedSearch.trim() ) {
				params.append( 'query', debouncedSearch.trim() );
			}

			if ( activeStatus !== 'all' ) {
				params.append( 'active', activeStatus );
			}

			Array.from( selectedCategories ).forEach( ( catId ) => {
				params.append( 'categories', catId );
			} );

			const response = await connectRequest< PaginatedResponse< MobileLab > >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.LABS.FILTERS }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar laboratorios.' );
			}
			return response;
		},
	} ) );

	const categoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'lab-categories' ],
		queryFn  : async ( ) : Promise< LabCategory[] > => {
			const response = await connectRequest< LabCategory[] >( {
				endpoint   : INTERNAL_ENDPOINTS.LABS.CATEGORIES.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}
			return response;
		},
	} ) );

	// ─── Reactive derived states ──────────────────────────────────────────────────
	const labsResponse = $derived( labsQuery.data );
	const labs         = $derived( labsResponse?.data || [ ] );
	const categories   = $derived( categoriesQuery.data || [ ] );

	// Debounce Search
	$effect( ( ) => {
		const currentSearch = search;

		const handler = setTimeout( ( ) => {
			debouncedSearch = currentSearch;
		}, 500 );

		return ( ) => clearTimeout( handler );
	} );

	// Sincronizar cargando global con queries
	$effect( ( ) => {
		$globalLoadingStore = labsQuery.isFetching || categoriesQuery.isFetching;
		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal() : void {
		isEditing  = false;
		editingId  = '';
		editingLab = null;
		showModal  = true;
	}

	function openEditModal( item : MobileLab ) : void {
		isEditing  = true;
		editingId  = item.id;
		editingLab = {
			name        : item.name,
			sku         : item.sku,
			description : item.description,
			dimensions  : item.dimensions,
			categoryId  : item.category?.id || '',
			active      : item.active,
			currentPrice: item.currentPrice ? Number( item.currentPrice ) : null,
			currentStock: item.currentStock ? Number( item.currentStock ) : null,
			minStock    : item.minStock ? Number( item.minStock ) : null,
			maxStock    : item.maxStock ? Number( item.maxStock ) : null,
			products    : ( item.products || [] ).map( ( p ) => ( {
				productId : p.productId,
				quantity  : p.quantity,
				product   : p.product ? {
					id   : p.product.id,
					name : p.product.name,
					sku  : p.product.sku,
				} : {
					id   : p.productId,
					name : 'Producto registrado',
					sku  : 'PROD',
				},
			} ) ),
			kits        : ( item.kits || [] ).map( ( k ) => ( {
				kitId    : k.kitId,
				quantity : k.quantity,
				kit      : k.kit ? {
					id   : k.kit.id,
					name : k.kit.name,
					sku  : k.kit.sku,
				} : {
					id   : k.kitId,
					name : 'Kit registrado',
					sku  : 'KIT',
				},
			} ) ),
			files       : ( item.files || [] ).filter( ( f ) => f.id !== 'placeholder' ),
		};
		showModal  = true;
	}

	async function deleteLab( id : string ) : Promise< void > {
		deletingId = id;

		try {
			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.LABS.BASE }?id=${ id }`,
				method		: METHOD.DELETE,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al eliminar: ${ response.message }` );
				return;
			}

			toast.success( 'Laboratorio eliminado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-labs' ] } );
		} catch ( err ) {
			toast.error( 'Error de red al intentar eliminar.' );
		} finally {
			deletingId = '';
		}
	}

	async function duplicateLab( lab : MobileLab ) : Promise< void > {
		duplicatingId = lab.id;

		try {
			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.DUPLICATE.BASE }?type=mobile-lab&id=${ lab.id }`,
				method		: METHOD.POST,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al duplicar: ${ response.message }` );
				return;
			}

			toast.success( 'Laboratorio móvil duplicado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-labs' ] } );
		} catch ( err ) {
			toast.error( 'Error de red al intentar duplicar.' );
		} finally {
			duplicatingId = '';
		}
	}
</script>

<svelte:head>
	<title>Administrar Laboratorios Móviles - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<HeaderPage
			title       = "Catálogo de Laboratorios Móviles"
			description = "Administre estaciones de ciencias móviles, nodolabs e infraestructuras pedagógicas autónomas."
			breadcrumb  = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Laboratorios Móviles'
				}
			] }
			buttonText  = "Agregar Laboratorio"
			onclick     = { openCreateModal }
			bind:view   = { view }
		/>

		<!-- ─── Search & Filters Tool ────────────────────────────────────────────── -->
		<CatalogFilters
			bind:search             = { search }
			bind:debouncedSearch    = { debouncedSearch }
			bind:activeStatus       = { activeStatus }
			bind:selectedCategories = { selectedCategories }
			categories              = { categories }
			searchPlaceholder       = "Buscar laboratorio por SKU o Nombre..."
			categoriesLabel         = "Categorías de Laboratorios"
		/>

		<!-- ─── Content ────────────────────────────────────────────────────── -->
		{#if ( view === 'cards' )}
			{#if ( labsQuery.isPending )}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{#each Array.from( { length : size } ) as _}
						<CardSkeleton type="item" />
					{/each}
				</div>
			{:else if ( labs.length > 0 )}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{#each labs as item ( item.id )}
						<ItemCard
							itemType           = "lab"
							{ item }
							openEditModal      = { openEditModal }
							deleteItem         = { ( l ) => deleteLab( l.id ) }
							isDeleteLoading    = { deletingId === item.id }
							duplicateItem      = { duplicateLab }
							isDuplicateLoading = { duplicatingId === item.id }
							confirmTitle       = "¿Eliminar laboratorio móvil?"
							confirmMessage     = "¿Está seguro de que desea eliminar este laboratorio móvil? Esta acción no se puede deshacer."
						/>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted leading-relaxed">
					No se encontraron laboratorios móviles registrados en el sistema.
				</div>
			{/if}
		{:else}
			<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
								<th class="px-6 py-4">Imagen</th>
								<th class="px-6 py-4">SKU</th>
								<th class="px-6 py-4">Nombre</th>
								<th class="px-6 py-4">Dimensiones</th>
								<th class="px-6 py-4">Categoría</th>
								<th class="px-6 py-4">Kits & Insumos Integrados</th>
								<th class="px-6 py-4">Estado</th>
								<th class="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-brand/10 font-semibold">
							{#if ( labsQuery.isPending )}
								<ListSkeleton columns={ 8 } rows={ 5 } />
							{:else if ( labs.length > 0 )}
								{#each labs as item ( item.id ) }
									<tr class="hover:bg-brand/5 transition-colors duration-150">
										<td class="px-6 py-3">
											<div class="h-10 w-10 overflow-hidden rounded-lg border border-brand/10 bg-input">
												{#if ( item.files && item.files[ 0 ] ) }
													<img 
														src={ item.files[ 0 ].url.startsWith( 'http' ) ? item.files[ 0 ].url : `https://res.cloudinary.com/dbgzsikcs/image/upload/v1779666295/globalcet/${ item.files[ 0 ].url }` } 
														alt={ item.name } 
														class="h-full w-full object-cover" 
													/>
												{:else}
													<div class="flex h-full w-full items-center justify-center bg-brand/5 text-[10px] text-brand">🚛</div>
												{/if}
											</div>
										</td>
										<td class="px-6 py-4 font-mono text-brand font-bold">{ item.sku }</td>
										<td class="px-6 py-4">
											<div class="font-bold text-text">{ item.name }</div>
											<div class="text-[11px] text-text-muted font-normal max-w-xs truncate">
												{ stripHtml( item.description ) || 'Sin descripción' }
											</div>
										</td>
										<td class="px-6 py-4 font-mono">{ item.dimensions || 'N/A' }</td>
										<td class="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-wide">
											{ item.category?.name || 'N/A' }
										</td>
										<td class="px-6 py-4">
											<div class="flex flex-col gap-1">
												<!-- Kits -->
												{#each ( item.kits || [] ) as k }
													<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] text-brand font-bold border border-brand/15 w-max">
														📦 { k.kit?.name || 'Kit' } ({ k.quantity } uds.)
													</span>
												{/each}

												<!-- Products -->
												{#each ( item.products || [] ) as p }
													<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-400 font-bold border border-emerald-500/15 w-max">
														🔬 { p.product?.name || 'Insumo' } ({ p.quantity } uds.)
													</span>
												{/each}
											</div>
										</td>
										<td class="px-6 py-4">
											<Status status={ item.active } />
										</td>
										<td class="px-6 py-4 text-right">
											<TableActions
												item            = { item }
												openEditModal   = { openEditModal }
												deleteItem      = { ( l ) => deleteLab( l.id ) }
												isDeleteLoading = { deletingId === item.id }
												confirmTitle    = "¿Eliminar laboratorio móvil?"
												confirmMessage  = "¿Está seguro de que desea eliminar este laboratorio móvil? Esta acción no se puede deshacer."
											/>
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="8" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No se encontraron laboratorios móviles registrados en el sistema.
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		{#if ( labsResponse && labsResponse.meta && labsResponse.meta.total > 0 ) }
            <Pagination
                bind:page = { page }
                count     = { labsResponse.meta.total }
                bind:perPage = { size }
            />
		{/if}

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<LabFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				initialData={ editingLab }
				{ categories }
				onSave={ () => {
					showModal = false;
				} }
				onCancel={ () => {
					showModal = false;
				} }
			/>
		{/if}
	</div>
</main>
