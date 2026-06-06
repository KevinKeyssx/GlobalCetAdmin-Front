<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { Plus }                         from '@lucide/svelte';
	import { createQuery, useQueryClient }  from '@tanstack/svelte-query';
	import { PUBLIC_NOT_FOUND_IMAGE }       from '$env/static/public';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Status                           from '$lib/components/shared/Status.svelte';
	import ProductFormModal                 from './components/ProductFormModal.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface Product {
		id          : string;
		sku         : string;
		name        : string;
		description : string;
		active      : boolean;
		files       : Array<{ id : string; url : string; alt : string; isMain : boolean }>;
		subcategory : {
			id       : string;
			name     : string;
			// category : { id : string; name : string };
		};
		material    : {
			id   : string;
			name : string;
			slug : string;
		};
	}

	interface MaterialInfo {
		id   : string;
		name : string;
	}

	interface CategoryInfo {
		id            : string;
		name          : string;
		subCategories : Array<{ id : string; name : string }>;
	}

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const productsQuery = createQuery( () => ( {
		queryKey	: [ 'admin-products' ],
		queryFn		: async () : Promise<Product[]> => {
			const prodResponse = await connectRequest<any>({
				endpoint	: `${ INTERNAL_ENDPOINTS.PRODUCTS.FILTERS }?size=50`,
				isInternal	: true,
			});

			if ( isApiError( prodResponse )) {
				throw new Error( 'Error al cargar productos.' );
			}

            return prodResponse.data || [];
		},
	}));


    const materialsQuery = createQuery( () => ({
		queryKey	: [ 'materials' ],
		queryFn		: async () : Promise<MaterialInfo[]> => {
			const matResponse = await connectRequest<MaterialInfo[]>({
				endpoint	: INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.GET_ALL,
				isInternal	: true,
			});

            if ( isApiError( matResponse )) {
				throw new Error( 'Error al cargar materiales.' );
			}

            return matResponse;
		},
	}));


    const categoriesQuery = createQuery( () => ( {
		queryKey	: [ 'categories' ],
		queryFn		: async () : Promise<CategoryInfo[]> => {
			const catResponse = await connectRequest<CategoryInfo[]>({
				endpoint	: INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL,
				isInternal	: true,
			});

            if ( isApiError( catResponse )) {
				throw new Error( 'Error al cargar categorías.' );
			}

            return catResponse;
		},
	}));

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	const products   = $derived( productsQuery.data   || [] );
	const materials  = $derived( materialsQuery.data  || [] );
	const categories = $derived( categoriesQuery.data || [] );

	let search    = $state( '' );
	let showModal = $state( false );
	let isEditing = $state( false );
	let editingId = $state( '' );

	const editingProduct = $derived.by( () => {
		if ( !isEditing || !editingId ) {
			return null;
		}

		const item = products.find( ( p ) => p.id === editingId );

		if ( !item ) {
			return null;
		}

		return {
			name			: item.name,
			sku				: item.sku,
			description		: item.description,
			materialId		: item.material?.id || '',
			subcategoryId	: item.subcategory?.id || '',
			active			: item.active,
			technicalSpecs	: '{"color":"verde"}',
			files			: ( item.files || [] )
				.filter( ( f ) => f.id !== 'placeholder' )
				.map( ( f, index ) => ( {
					id		: f.id,
					url		: f.url,
					alt		: f.alt || '',
					isMain	: f.isMain || false,
					order	: ( f as any ).order ?? index,
				} ) ),
		};
	} );

	// ─── Filtered View ────────────────────────────────────────────────────────────
	const filteredProducts = $derived(
		products.filter( ( p ) =>
			p.name.toLowerCase().includes( search.toLowerCase() ) ||
			p.sku.toLowerCase().includes( search.toLowerCase() ) ||
			( p.description || '' ).toLowerCase().includes( search.toLowerCase() )
		)
	);

	// Sincronizar cargando global con queries
	$effect( () => {
		$globalLoadingStore = productsQuery.isFetching || materialsQuery.isFetching || categoriesQuery.isFetching;
		return () => {
			$globalLoadingStore = false;
		};
	});

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal() : void {
		isEditing = false;
		editingId = '';
		showModal = true;
	}

	function openEditModal( item : Product ) : void {
		isEditing = true;
		editingId = item.id;
		showModal = true;
	}

	async function deleteProduct( id : string ) : Promise<void> {
		if ( !confirm( '¿Está seguro de que desea eliminar este producto del catálogo?' ) ) return;

		$globalLoadingStore = true;

        try {
			const response = await connectRequest< any >( {
				endpoint	: `products?id=${ id }`,
				method		: METHOD.DELETE,
				isInternal	: true,
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
			$globalLoadingStore = false;
		}
	}


    function getProductImageUrl( files : Array<{ url : string; isMain : boolean }> | undefined ) : string {
		const mainFile = files?.find( ( f ) => f.isMain );

		return mainFile
			? mainFile.url
			: PUBLIC_NOT_FOUND_IMAGE;
	}
</script>


<svelte:head>
	<title>Administración de Productos - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>

                    <span>/</span>

                    <span class="text-brand font-bold">Productos</span>
				</div>

                <h1 class="font-display text-xl md:text-3xl font-black text-text uppercase tracking-wide">
					Catálogo de Productos
				</h1>

                <p class="text-text-muted">
					Administre reactivos cromatográficos, borosilicato, instrumental médico y equipos analíticos.
				</p>
			</div>

			<button
				onclick={ openCreateModal }
				class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright"
			>
                <Plus class="size-4"/>

                <span class="hidden sm:flex">
                    Agregar Producto
                </span>
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
				placeholder="Buscar por SKU, Nombre o Descripción..."
				bind:value={ search }
				class="w-full rounded-xl border border-brand/15 bg-input py-2.5 pl-10 pr-4 text-sm text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10"
			/>
		</div>

		<!-- ─── Table Content ────────────────────────────────────────────────────── -->
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
									<div class="text-xs text-text-muted font-normal max-w-xs truncate">{ prod.description || 'Sin descripción' }</div>
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
