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
	import SearchInput                      from '$lib/components/shared/SearchInput.svelte';


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
		id          : string;
		sku         : string;
		name        : string;
		description : string;
		dimensions  : string;
		active      : boolean;
		files       : Array<{ id : string; url : string; alt : string; isMain : boolean }>;
		category    : { id : string; name : string };
		products    : LabProduct[];
		kits        : LabKit[];
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

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const labsQuery = createQuery( () => ( {
		queryKey	: [ 'admin-labs' ],
		queryFn		: async () : Promise< MobileLab[] > => {
			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.LABS.FILTERS }?size=50`,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar laboratorios.' );
			}
			return response.data || [];
		},
	} ) );

	const catalogProductsQuery = createQuery( () => ( {
		queryKey	: [ 'catalog-products' ],
		queryFn		: async () : Promise< CatalogProduct[] > => {
			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.PRODUCTS.FILTERS }?size=100`,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar productos del catálogo.' );
			}
			return response.data || [];
		},
	} ) );

	const catalogKitsQuery = createQuery( () => ( {
		queryKey	: [ 'catalog-kits' ],
		queryFn		: async () : Promise< CatalogKit[] > => {
			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.KITS.FILTERS }?size=100`,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar kits del catálogo.' );
			}
			return response.data || [];
		},
	} ) );

	const categoriesQuery = createQuery( () => ( {
		queryKey	: [ 'lab-categories' ],
		queryFn		: async () : Promise< LabCategory[] > => {
			const response = await connectRequest< LabCategory[] >( {
				endpoint	: 'labs/categories/get-all',
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}
			return response;
		},
	} ) );

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	const labs            = $derived( labsQuery.data            || [] );
	const catalogProducts = $derived( catalogProductsQuery.data || [] );
	const catalogKits     = $derived( catalogKitsQuery.data     || [] );
	const categories      = $derived( categoriesQuery.data      || [] );

	let search          = $state( '' );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingLab      = $state< any >( null );

	// ─── Filtered View ────────────────────────────────────────────────────────────
	const filteredLabs = $derived(
		labs.filter( ( l ) =>
			l.name.toLowerCase().includes( search.toLowerCase() ) ||
			l.sku.toLowerCase().includes( search.toLowerCase() ) ||
			( l.description || '' ).toLowerCase().includes( search.toLowerCase() )
		)
	);

	// Sincronizar cargando global con queries
	$effect( () => {
		$globalLoadingStore = labsQuery.isFetching || catalogProductsQuery.isFetching || catalogKitsQuery.isFetching || categoriesQuery.isFetching;
		return () => {
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
			name		: item.name,
			sku			: item.sku,
			description	: item.description,
			dimensions	: item.dimensions,
			categoryId	: item.category?.id || '',
			active		: item.active,
			products	: ( item.products || [] ).map( ( p ) => ( {
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
			kits		: ( item.kits || [] ).map( ( k ) => ( {
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
			files		: ( item.files || [] ).filter( ( f ) => f.id !== 'placeholder' ),
		};
		showModal  = true;
	}

	async function deleteLab( id : string ) : Promise<void> {
		if ( !confirm( '¿Está seguro de que desea eliminar este laboratorio móvil?' ) ) return;

		$globalLoadingStore = true;
		try {
			const response = await connectRequest< any >( {
				endpoint	: `labs?id=${ id }`,
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
			$globalLoadingStore = false;
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
			title       = "Gestión de Laboratorios Móviles"
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
		/>


		<div class="flex items-center max-w-md relative">
			<SearchInput
				bind:value={ search }
				placeholder="Buscar laboratorio por SKU o Nombre..."
			/>
		</div>

		<!-- ─── Table Content ────────────────────────────────────────────────────── -->
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
						{#each filteredLabs as item ( item.id ) }
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
									<div class="text-[10px] text-text-muted font-normal max-w-xs truncate">{ item.description || 'Sin descripción' }</div>
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
										item={ item }
										openEditModal={ openEditModal }
										deleteItem={ ( l ) => deleteLab( l.id ) }
									/>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="8" class="px-6 py-12 text-center text-text-muted leading-relaxed">
									No se encontraron laboratorios móviles registrados en el sistema.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<LabFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				initialData={ editingLab }
				{ categories }
				{ catalogProducts }
				{ catalogKits }
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
