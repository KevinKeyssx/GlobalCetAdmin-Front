<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { createQuery, useQueryClient }  from '@tanstack/svelte-query';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import KitFormModal                     from './components/KitFormModal.svelte';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Status                           from '$lib/components/shared/Status.svelte';

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
		id          : string;
		sku         : string;
		name        : string;
		description : string;
		active      : boolean;
		files       : Array<{ id : string; url : string; alt : string; isMain : boolean }>;
		category    : { id : string; name : string };
		products    : KitProduct[];
	}

	interface KitCategory {
		id   : string;
		name : string;
	}

	interface CatalogProduct {
		id   : string;
		name : string;
		sku  : string;
	}

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const kitsQuery = createQuery( () => ( {
		queryKey	: [ 'admin-kits' ],
		queryFn		: async () : Promise< Kit[] > => {
			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.KITS.FILTERS }?size=50`,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar kits.' );
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

	const categoriesQuery = createQuery( () => ( {
		queryKey	: [ 'kit-categories' ],
		queryFn		: async () : Promise< KitCategory[] > => {
			const response = await connectRequest< KitCategory[] >( {
				endpoint	: 'kits/categories/get-all',
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}
			return response;
		},
	} ) );

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	const kits            = $derived( kitsQuery.data            || [] );
	const catalogProducts = $derived( catalogProductsQuery.data || [] );
	const categories      = $derived( categoriesQuery.data      || [] );

	let search          = $state( '' );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingKit      = $state< any >( null );

	// ─── Filtered View ────────────────────────────────────────────────────────────
	const filteredKits = $derived(
		kits.filter( ( k ) =>
			k.name.toLowerCase().includes( search.toLowerCase() ) ||
			k.sku.toLowerCase().includes( search.toLowerCase() ) ||
			( k.description || '' ).toLowerCase().includes( search.toLowerCase() )
		)
	);

	// Sincronizar cargando global con queries
	$effect( () => {
		$globalLoadingStore = kitsQuery.isFetching || catalogProductsQuery.isFetching || categoriesQuery.isFetching;
		return () => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal() : void {
		isEditing  = false;
		editingId  = '';
		editingKit = null;
		showModal  = true;
	}

	function openEditModal( item : Kit ) : void {
		isEditing  = true;
		editingId  = item.id;
		editingKit = {
			name		: item.name,
			sku			: item.sku,
			description	: item.description,
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
			files		: ( item.files || [] ).filter( ( f ) => f.id !== 'placeholder' ),
		};
		showModal  = true;
	}

	async function deleteKit( id : string ) : Promise<void> {
		if ( !confirm( '¿Está seguro de que desea eliminar este kit?' ) ) return;

		$globalLoadingStore = true;
		try {
			const response = await connectRequest< any >( {
				endpoint	: `kits?id=${ id }`,
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
			$globalLoadingStore = false;
		}
	}
</script>

<svelte:head>
	<title>Administración de Kits - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>
					<span>/</span>
					<span class="text-brand font-bold">Kits</span>
				</div>
				<h1 class="font-display text-3xl font-black text-text uppercase tracking-wide">
					Gestión de Kits Pedagógicos
				</h1>
				<p class="text-text-muted">
					Administre sets pedagógicos y kits de laboratorio combinando reactivos, borosilicato e instrumentos.
				</p>
			</div>

			<button
				onclick={ openCreateModal }
				class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				Agregar Kit
			</button>
		</div>

		<!-- ─── Search Tool ──────────────────────────────────────────────────────── -->
		<div class="flex items-center max-w-md relative">
			<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.35-4.35" />
			</svg>
			<input
				type="search"
				placeholder="Buscar kit por SKU o Nombre..."
				bind:value={ search }
				class="w-full rounded-xl border border-brand/15 bg-input py-2.5 pl-10 pr-4 text-sm text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10"
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
							<th class="px-6 py-4">Categoría de Kit</th>
							<th class="px-6 py-4">Insumos Incluidos</th>
							<th class="px-6 py-4">Estado</th>
							<th class="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-brand/10 font-semibold">
						{#each filteredKits as item ( item.id ) }
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
									<div class="text-[10px] text-text-muted font-normal max-w-xs truncate">{ item.description || 'Sin descripción' }</div>
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
										item={ item }
										openEditModal={ openEditModal }
										deleteItem={ ( k ) => deleteKit( k.id ) }
									/>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="px-6 py-12 text-center text-text-muted leading-relaxed">
									No se encontraron kits registrados.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<KitFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				initialData={ editingKit }
				{ categories }
				{ catalogProducts }
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
