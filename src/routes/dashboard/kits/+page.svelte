<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { createQuery, useQueryClient }  from '@tanstack/svelte-query';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { resolve }                      from '$app/paths';
	import { goto }                         from '$app/navigation';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Status                           from '$lib/components/shared/Status.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import PageContainer                     from '$lib/components/shared/PageContainer.svelte';
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

	interface KitProduct {
		productId : string;
		quantity  : number;
		product?  : ProductRelation;
	}

	interface Kit {
		id           : string;
		sku          : string;
		name         : string;
		description  : string;
		active       : boolean;
		files        : Array<{ id : string; url : string; alt : string; isMain : boolean }>;
		category     : { id : string; name : string };
		products     : KitProduct[];
		currentPrice?: number;
		currentStock?: number;
		minStock?    : number;
		maxStock?    : number;
	}

	interface KitCategory {
		id   : string;
		name : string;
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

	let deletingId         = $state( '' );


	// Reset to page 1 on filter changes
	$effect( ( ) => {
		const _ = [ debouncedSearch, activeStatus, Array.from( selectedCategories ), size ];
		page = 1;
	} );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const kitsQuery = createQuery( ( ) => ( {
		queryKey : [ 'admin-kits', page, size, debouncedSearch, activeStatus, Array.from( selectedCategories ) ],
		queryFn  : async ( ) : Promise< PaginatedResponse< Kit > > => {
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

			const response = await connectRequest< PaginatedResponse< Kit > >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.KITS.FILTERS }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar kits.' );
			}
			return response;
		},
	} ) );



	const categoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'kit-categories' ],
		queryFn  : async ( ) : Promise< KitCategory[] > => {
			const response = await connectRequest< KitCategory[] >( {
				endpoint   : INTERNAL_ENDPOINTS.KITS.CATEGORIES.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}
			return response;
		},
	} ) );

	// ─── Reactive derived states ──────────────────────────────────────────────────
	const kitsResponse = $derived( kitsQuery.data );
	const kits         = $derived( kitsResponse?.data || [ ] );
	const categories   = $derived( categoriesQuery.data || [ ] );

	// Sincronizar cargando global con queries
	$effect( ( ) => {
		$globalLoadingStore = kitsQuery.isFetching || categoriesQuery.isFetching;
		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal() : void {
		goto( resolve( '/dashboard/kits/form' ) );
	}

	function openEditModal( item : Kit ) : void {
		goto( resolve( `/dashboard/kits/form?id=${ item.id }` ) );
	}

	async function deleteKit( id : string ) : Promise< void > {
		deletingId = id;

		try {
			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.KITS.BASE }?id=${ id }`,
				method		: METHOD.DELETE,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al eliminar: ${ response.message }` );
				return;
			}

			toast.success( 'Kit eliminado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-kits' ] } );
		} catch ( err ) {
			toast.error( 'Error de red al intentar eliminar.' );
		} finally {
			deletingId = '';
		}
	}
</script>

<svelte:head>
	<title>Administración de Kits - GlobalCET</title>
</svelte:head>

<PageContainer>
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<HeaderPage
			title       = "Catálogo de Kits"
			description = "Administre sets pedagógicos y kits de laboratorio combinando reactivos, borosilicato e instrumentos."
			breadcrumb  = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Kits'
				}
			] }
			buttonText  = "Agregar Kit"
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
			searchPlaceholder       = "Buscar kit por SKU o Nombre..."
			categoriesLabel         = "Categorías de Kits"
		/>

		<!-- ─── Content ────────────────────────────────────────────────────── -->
		{#if ( view === 'cards' )}
			{#if ( kitsQuery.isPending )}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{#each Array.from( { length : size } ) as _}
						<CardSkeleton type="item" />
					{/each}
				</div>
			{:else if ( kits.length > 0 )}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{#each kits as item ( item.id )}
						<ItemCard
							itemType        = "kit"
							{ item }
							openEditModal   = { openEditModal }
							deleteItem      = { ( k ) => deleteKit( k.id ) }
							isDeleteLoading = { deletingId === item.id }
							confirmTitle    = "¿Eliminar kit?"
							confirmMessage  = "¿Está seguro de que desea eliminar este kit? Esta acción no se puede deshacer."
						/>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted leading-relaxed">
					No se encontraron kits registrados.
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
								<th class="px-6 py-4">Categoría de Kit</th>
								<th class="px-6 py-4">Insumos Incluidos</th>
								<th class="px-6 py-4">Estado</th>
								<th class="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-brand/10 font-semibold">
							{#if ( kitsQuery.isPending )}
								<ListSkeleton columns={ 7 } rows={ 5 } />
							{:else if ( kits.length > 0 )}
								{#each kits as item ( item.id ) }
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
													<div class="flex h-full w-full items-center justify-center bg-brand/5 text-[10px] text-brand">📦</div>
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
										<td class="px-6 py-4 text-text-muted font-bold text-[10px] uppercase tracking-wide">
											{ item.category?.name || 'N/A' }
										</td>
										<td class="px-6 py-4">
											<div class="flex flex-col gap-0.5">
												{#each ( item.products || [] ) as p }
													<span class="text-[10px] text-brand">
														• { p.product?.name || 'Insumo' } ({ p.quantity } uds.)
													</span>
												{:else}
													<span class="text-text-muted text-[10px]">Sin productos asociados</span>
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
												deleteItem      = { ( k ) => deleteKit( k.id ) }
												isDeleteLoading = { deletingId === item.id }
												confirmTitle    = "¿Eliminar kit?"
												confirmMessage  = "¿Está seguro de que desea eliminar este kit? Esta acción no se puede deshacer."
												itemType        = "kit"
												showDuplicate   = { true }
											/>
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="7" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No se encontraron kits registrados.
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		{#if ( kitsResponse && kitsResponse.meta && kitsResponse.meta.total > 0 )}
            <Pagination
                bind:page = { page }
                count     = { kitsResponse.meta.total }
                bind:perPage = { size }
            />
		{/if}


</PageContainer>
