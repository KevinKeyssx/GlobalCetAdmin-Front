<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { BrushCleaning }                from '@lucide/svelte';
	import { createQuery, useQueryClient }  from '@tanstack/svelte-query';
	import { PUBLIC_NOT_FOUND_IMAGE }       from '$env/static/public';

	import type {
        AdminProduct,
        CategoryInfo
    }                                       from '$lib/types/product';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Status                           from '$lib/components/shared/Status.svelte';
	import Select                           from '$lib/components/shared/Select.svelte';
	import SearchInput                      from '$lib/components/shared/SearchInput.svelte';
	import type { MaterialInfo }            from '$lib/types/material';
	import type { SubCategory }             from '$lib/types/category';
	import ProductFormModal                 from './components/ProductFormModal.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import { stripHtml }                    from '$lib/utils/string';
	import ItemCard                         from '$lib/components/shared/itemCard/ItemCard.svelte';

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	let search                = $state( '' );
	let debouncedSearch       = $state( '' );
	let selectedMaterials     = $state( new Set< string >() );
	let selectedSubcategories = $state( new Set< string >() );
	let activeStatus          = $state( 'all' );
	let view                  = $state< 'cards' | 'list' >( 'cards' );
	let showModal             = $state( false );
	let isEditing             = $state( false );
	let editingId             = $state( '' );
	let deletingId            = $state( '' );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const productsQuery = createQuery( ( ) => ( {
		queryKey : [ 'admin-products', Array.from( selectedMaterials ), Array.from( selectedSubcategories ), activeStatus, debouncedSearch ],
		queryFn  : async ( ) : Promise< AdminProduct[] > => {
			const params = new URLSearchParams( {
				size : '50',
			} );

			selectedMaterials.forEach( ( id ) => params.append( 'materials', id ) );
			selectedSubcategories.forEach( ( id ) => params.append( 'subcategories', id ) );

			if ( activeStatus !== 'all' ) {
				params.append( 'active', activeStatus );
			}

			if ( debouncedSearch ) {
				params.append( 'query', debouncedSearch );
			}

			const prodResponse = await connectRequest<any>( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.FILTERS }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( prodResponse ) ) {
				throw new Error( 'Error al cargar productos.' );
			}

			return prodResponse.data || [];
		},
	} ) );


    const materialsQuery = createQuery( ( ) => ( {
		queryKey : [ 'materials' ],
		queryFn  : async ( ) : Promise<MaterialInfo[]> => {
			const matResponse = await connectRequest<MaterialInfo[]>({
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( matResponse )) {
				throw new Error( 'Error al cargar materiales.' );
			}

			return matResponse;
		},
	}));


    const categoriesQuery = createQuery( ( ) => ({
		queryKey : [ 'categories' ],
		queryFn  : async ( ) : Promise< CategoryInfo[] > => {
			const catResponse = await connectRequest<CategoryInfo[]>({
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL,
				isInternal : true,
			});

			if ( isApiError( catResponse ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}

			return catResponse;
		},
	}));


    const subcategoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'subcategories-all' ],
		queryFn  : async ( ) : Promise< SubCategory[] > => {
			const subResponse = await connectRequest< SubCategory[] >( {
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.SUBCATEGORIES.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( subResponse ) ) {
				throw new Error( 'Error al cargar subcategorías.' );
			}

			return subResponse;
		},
	}));

	const products      = $derived( productsQuery.data || [] );
	const materials     = $derived( materialsQuery.data || [] );
	const categories    = $derived( categoriesQuery.data || [] );
	const subcategories = $derived( subcategoriesQuery.data || [] );

	const editingProduct = $derived.by( ( ) => {
		if ( !isEditing || !editingId ) {
			return null;
		}

		const item = products.find( ( p ) => p.id === editingId );

		if ( !item ) {
			return null;
		}

		return {
			name           : item.name,
			sku            : item.sku,
			description    : item.description,
			materialId     : item.material?.id || '',
			subcategoryId  : item.subcategory?.id || '',
			active         : item.active,
			technicalSpecs : item.technical_specs ? ( typeof item.technical_specs === 'object' ? JSON.stringify( item.technical_specs ) : item.technical_specs ) : '{}',
			files          : ( item.files || [] )
				.filter( ( f ) => f.id !== 'placeholder' )
				.map( ( f, index ) => ( {
					id     : f.id,
					url    : f.url,
					alt    : f.alt || '',
					isMain : f.isMain || false,
					order  : ( f as any ).order ?? index,
				} ) ),
		};
	} );


    const statusOptions = [
		{ id : 'all',   name : 'Todos' },
		{ id : 'true',  name : 'Activos' },
		{ id : 'false', name : 'Inactivos' },
	];

	// ─── Filtered View (client side search) ──────────────────────────────────────────
	const filteredProducts = $derived(
		products.filter( ( p ) =>
			p.name.toLowerCase().includes( search.toLowerCase() ) ||
			p.sku.toLowerCase().includes( search.toLowerCase() ) ||
			( p.description || '' ).toLowerCase().includes( search.toLowerCase() )
		)
	);

	// Sincronizar cargando global con queries
	$effect( ( ) => {
		$globalLoadingStore = productsQuery.isFetching || materialsQuery.isFetching || categoriesQuery.isFetching || subcategoriesQuery.isFetching;

        return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal( ) : void {
		isEditing = false;
		editingId = '';
		showModal = true;
	}


    function openEditModal( item : AdminProduct ) : void {
		isEditing = true;
		editingId = item.id;
		showModal = true;
	}


    async function deleteProduct( id : string ) : Promise< void > {
		deletingId = id;

		try {
			const response = await connectRequest< any >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.BASE }?id=${ id }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al eliminar: ${ response.message }` );
				return;
			}

			toast.success( 'Producto eliminado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-products' ] } );
		} catch ( err ) {
			toast.error( 'Error de red al intentar eliminar.' );
		} finally {
			deletingId = '';
		}
	}


    function getProductImageUrl( files : Array<{ url : string; isMain : boolean }> | undefined ) : string {
		const mainFile = files?.find( ( f ) => f.isMain );

		return mainFile
			? mainFile.url
			: PUBLIC_NOT_FOUND_IMAGE;
	}


	function clearFilters() : void {
		selectedMaterials.clear();
		selectedSubcategories.clear();
		selectedMaterials     = new Set< string >();
		selectedSubcategories = new Set< string >();
		activeStatus          = 'all';
		search                = '';
		debouncedSearch       = '';
	}
</script>


<svelte:head>
	<title>Administración de Productos - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<HeaderPage
			title       = "Catálogo de Productos"
			description = "Administre reactivos cromatográficos, borosilicato, instrumental médico y equipos analíticos."
			breadcrumb  = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Productos'
				}
			] }
			buttonText  = "Agregar Producto"
			onclick     = { openCreateModal }
			bind:view   = { view }
		/>


		<!-- ─── Search & Filters Tool ────────────────────────────────────────────── -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end bg-card/40 border border-brand/10 p-4 rounded-2xl">
			<!-- Search -->
			<div class="space-y-1.5 w-full">
				<label for="search-input" class="text-xs font-bold text-text-muted uppercase tracking-wider">Buscar</label>

				<SearchInput
					bind:value={ search }
					bind:debouncedValue={ debouncedSearch }
					placeholder="Por SKU o Nombre..."
				/>
			</div>

			<!-- Materials Select -->
			<div class="space-y-1.5 w-full font-bold text-xs text-text-muted">
				<label for="materials-select" class="uppercase tracking-wider">Materiales</label>

                <Select
					options={ materials }
					bind:selected={ selectedMaterials }
					multiple={ true }
					placeholder="Todos los materiales"
				/>
			</div>

			<!-- Subcategories Select -->
			<div class="space-y-1.5 w-full font-bold text-xs text-text-muted">
				<label for="subcategories-select" class="uppercase tracking-wider">Subcategorías</label>

                <Select
					bind:selected={ selectedSubcategories }
					options     = { subcategories }
					multiple    = { true }
					placeholder = "Todas las subcategorías"
				/>
			</div>

			<!-- Status and Reset -->
			<div class="flex flex-col sm:flex-row gap-2 w-full font-semibold text-xs text-text-muted items-stretch sm:items-end">
				<div class="space-y-1.5 flex-1 w-full">
					<span class="font-bold uppercase tracking-wider block mb-1.5">Estado</span>

					<Select
						bind:value={ activeStatus }
						options     = { statusOptions }
						multiple    = { false }
						searching   = { false }
						placeholder = "Todos los estados"
					/>
				</div>

				{#if ( selectedMaterials.size > 0 || selectedSubcategories.size > 0 || activeStatus !== 'all' || search )}
					<button
						onclick={ clearFilters }
						class="rounded-xl border border-brand/20 bg-surface/30 px-3 py-2.5 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 hover:text-brand transition-colors h-[42px] flex items-center justify-center w-full sm:w-auto cursor-pointer"
					>
						<BrushCleaning class="size-4" />
					</button>
				{/if}
			</div>
		</div>

		<!-- ─── Table/Grid Content ────────────────────────────────────────────────── -->
		{#if ( view === 'cards' )}
			{#if ( filteredProducts.length > 0 )}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{#each filteredProducts as item ( item.id )}
						<ItemCard
							itemType        = "product"
							{ item }
							openEditModal   = { openEditModal }
							deleteItem      = { ( p ) => deleteProduct( p.id ) }
							isDeleteLoading = { deletingId === item.id }
							confirmTitle    = "¿Eliminar producto?"
							confirmMessage  = "¿Está seguro de que desea eliminar este producto del catálogo? Esta acción no se puede deshacer."
						/>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted leading-relaxed">
					No se encontraron productos en el catálogo de GlobalCET.
				</div>
			{/if}
		{:else}
			<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="border-b border-brand/15 bg-brand/5 text-xs font-black uppercase tracking-widest text-text-muted">
								<th class="px-6 py-4">Imagen</th>
								<th class="px-6 py-4">SKU</th>
								<th class="px-6 py-4">Nombre</th>
								<th class="px-6 py-4">Subcategoría</th>
								<th class="px-6 py-4">Material</th>
								<th class="px-6 py-4">Estado</th>
								<th class="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-brand/10 font-semibold text-sm">
							{#each filteredProducts as prod ( prod.id ) }
								<tr class="hover:bg-brand/5 transition-colors duration-150">
									<td class="px-6 py-3">
										<div class="h-10 w-10 overflow-hidden rounded-lg border border-brand/10 bg-input">
											{#if ( prod.files && prod.files[ 0 ] ) }
												<img 
													src     = { getProductImageUrl( prod.files ) } 
													alt     = { prod.name } 
													class   = "h-full w-full object-cover" 
												/>
											{:else}
												<div class="flex h-full w-full items-center justify-center bg-brand/5 text-[10px] text-brand">🔬</div>
											{/if}
										</div>
									</td>

									<td class="px-6 py-4 font-mono text-brand font-bold">{ prod.sku }</td>

									<td class="px-6 py-4">
										<div class="font-bold text-text">{ prod.name }</div>

										<div class="text-[11px] text-text-muted font-normal max-w-xs truncate">
											{ stripHtml( prod.description ) || 'Sin descripción' }
										</div>
									</td>

									<td class="px-6 py-4 text-text-muted">{ prod.subcategory?.name || 'N/A' }</td>

									<td class="px-6 py-4 font-bold text-emerald-500">{ prod.material?.name || 'N/A' }</td>

									<td class="px-6 py-4">
										<Status status={ prod.active } />
									</td>

									<td class="px-6 py-4 text-right">
										<TableActions
											item            = { prod }
											openEditModal   = { openEditModal }
											deleteItem      = { ( p ) => deleteProduct( p.id ) }
											isDeleteLoading = { deletingId === prod.id }
											confirmTitle    = "¿Eliminar producto?"
											confirmMessage  = "¿Está seguro de que desea eliminar este producto del catálogo? Esta acción no se puede deshacer."
										/>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="7" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No se encontraron productos en el catálogo de GlobalCET.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<ProductFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				initialData={ editingProduct }
				{ materials }
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
