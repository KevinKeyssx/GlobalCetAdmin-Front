<script lang="ts">
	import {
        createQuery,
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Pagination                       from '$lib/components/shared/Pagination.svelte';
	import type { Category, SubCategory }   from '$lib/types/category';

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
	let activeStatus      = $state( 'all' ); // 'all' | 'true' | 'false'
	let order             = $state( 'name' );
	let typeOrder         = $state( 'asc' );
	let categoriesPage    = $state( 1 );
	let subcategoriesPage = $state( 1 );
	let showModal         = $state( false );
	let isEditing         = $state( false );
	let editingId         = $state( '' );
	let editingCategory   = $state<{ name : string; parentCatId? : string; } | null>( null );

	// Reset to page 1 on filter changes
	$effect( ( ) => {
		categoriesPage    = 1;
		subcategoriesPage = 1;
	});

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const categoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'categories', categoriesPage, search, activeStatus, order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< Category > > => {
			const params = new URLSearchParams( {
				type      : 'category',
				page      : categoriesPage.toString(),
				size      : '10',
				order     : order,
				typeOrder : typeOrder,
			} );

			if ( search.trim() ) {
				params.append( 'name', search.trim() );
			}

			if ( activeStatus !== 'all' ) {
				params.append( 'active', activeStatus );
			}

			const response = await connectRequest< PaginatedResponse< Category > >( {
				endpoint   : `products/categories?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'No se pudieron cargar las categorías.' );
			}

			return response;
		},
		enabled  : activeTab === 'categories',
	} ) );

	const allCategoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'categories', 'all' ],
		queryFn  : async ( ) : Promise< Category[] > => {
			const response = await connectRequest< Category[] >( {
				endpoint   : 'products/categories/get-all',
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'No se pudieron cargar todas las categorías.' );
			}

			return response || [];
		},
	} ) );

	const subcategoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'subcategories', subcategoriesPage, search, activeStatus, order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< SubCategory > > => {
			const params = new URLSearchParams( {
				type            : 'subcategory',
				page            : subcategoriesPage.toString(),
				size            : '10',
				order           : order,
				typeOrder       : typeOrder,
				includeCategory : 'true',
			} );

			if ( search.trim() ) {
				params.append( 'name', search.trim() );
			}

			if ( activeStatus !== 'all' ) {
				params.append( 'active', activeStatus );
			}

			const response = await connectRequest< PaginatedResponse< SubCategory > >( {
				endpoint   : `products/categories?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'No se pudieron cargar las subcategorías.' );
			}

			return response;
		},
		enabled  : activeTab === 'subcategories',
	} ) );

	const deleteMutation = createMutation( ( ) => ( {
		mutationFn : async ( id : string ) : Promise< any > => {
			const isSub    = activeTab === 'subcategories';
			const path     = isSub ? 'products/categories?type=subcategory' : 'products/categories';
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
	} );

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
		};
		showModal       = true;
	}

	function deleteItem( id : string ) : void {
		const label = activeTab === 'subcategories' ? 'esta subcategoría' : 'esta categoría y todas sus subcategorías';
		if ( !confirm( `¿Está seguro de que desea eliminar ${ label }?` ) ) return;

		deleteMutation.mutate( id );
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
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-3 sm:pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>

                    <span>/</span>

                    <span>Productos</span>

                    <span>/</span>

                    <span class="text-brand font-bold">Categorías & Subcategorías</span>
				</div>

                <h1 class="font-display text-3xl font-black text-text uppercase tracking-wide">
					Categorías de Productos
				</h1>

                <p class="text-text-muted">
					Administre las categorías analíticas y subcategorías estructuradas de sus productos científicos.
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

                Agregar { activeTab === 'categories' ? 'Categoría' : 'Subcategoría' }
			</button>
		</div>

		<!-- ─── Tab Switcher & Search Bar ───────────────────────────────────────── -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs">
			<!-- Tabs -->
			<div class="grid sm:flex rounded-xl bg-input p-1 border border-brand/10 max-w-xs gap-1">
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

			<!-- Filters -->
			<div class="flex flex-col sm:flex-row items-center gap-2 max-w-md w-full">
				<select
					bind:value={ activeStatus }
					class="w-full sm:w-auto rounded-xl border border-brand/15 bg-input py-2 px-3 text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10 font-bold"
				>
					<option value="all">Todos los estados</option>
					<option value="true">Activos</option>
					<option value="false">Inactivos</option>
				</select>

				<div class="flex items-center relative w-full">
					<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					<input
						type="search"
						placeholder="Buscar..."
						bind:value={ search }
						class="w-full rounded-xl border border-brand/15 bg-input py-2 pl-10 pr-4 text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10"
					/>
				</div>
			</div>
		</div>

		<!-- ─── Table Lists ──────────────────────────────────────────────────────── -->
		{#if ( activeTab === 'categories' )}
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
							{#each ( categoriesQuery.data?.data || [] ) as cat ( cat.id )}
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
											item={ cat }
											openEditModal={ openEditModal }
											deleteItem={ ( c ) => deleteItem( c.id ) }
										/>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="4" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No hay categorías registradas.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if ( categoriesQuery.data?.meta && categoriesQuery.data.meta.totalPages > 1 )}
					<div class="flex justify-center pt-2">
						<Pagination
							count={ categoriesQuery.data.meta.total }
							perPage={ categoriesQuery.data.meta.size }
							bind:page={ categoriesPage }
						/>
					</div>
				{/if}
			</section>
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
							{#each ( subcategoriesQuery.data?.data || [] ) as sub ( sub.id )}
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
											item={ sub }
											openEditModal={ openEditModal }
											deleteItem={ ( s ) => deleteItem( s.id ) }
										/>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No hay subcategorías registradas. Cree una categoría padre primero.
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
