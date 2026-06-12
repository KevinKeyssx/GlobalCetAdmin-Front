<script lang="ts">
	import toast                                            from 'svelte-french-toast';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

	import connectRequest, { isApiError }                   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }                           from '$lib/utils/endpoints';
	import { METHOD }                                       from '$lib/services/http-codes';
	import { globalLoadingStore }                           from '$lib/state/loading';
	import CategoryFormModal                                from '$lib/components/shared/CategoryFormModal.svelte';
	import TableActions                                     from '$lib/components/shared/TableActions.svelte';
	import Pagination                                       from '$lib/components/shared/Pagination.svelte';
	import HeaderPage                                       from '$lib/components/shared/HeaderPage.svelte';
	import CategoryFilters                                  from '$lib/components/shared/CategoryFilters.svelte';
	import CategoryCard                                     from '$lib/components/shared/itemCard/CategoryCard.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface KitCategory {
		id      : string;
		name    : string;
		active? : boolean;
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
	let search          = $state( '' );
	let debouncedSearch = $state( '' );
	let activeStatus    = $state( 'all' ); // 'all' | 'true' | 'false'
	let order           = $state( 'name' );
	let typeOrder       = $state( 'asc' );
	let page            = $state( 1 );
	let view            = $state< 'cards' | 'list' >( 'cards' );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingCategory = $state< KitCategory | null >( null );
	let deletingId      = $state( '' );

	// Reset to page 1 on filter changes
	$effect( ( ) => {
		const _ = [ debouncedSearch, activeStatus ];
		page = 1;
	} );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const categoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'kit-categories', page, debouncedSearch, activeStatus, order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< KitCategory > > => {
			const params = new URLSearchParams( {
				page    : page.toString(),
				size    : '10',
				orderBy : order,
				order   : typeOrder,
			} );

			if ( debouncedSearch.trim() ) {
				params.append( 'name', debouncedSearch.trim() );
			}

			if ( activeStatus !== 'all' ) {
				params.append( 'active', activeStatus );
			}

			const response = await connectRequest< PaginatedResponse< KitCategory > >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.KITS.CATEGORIES.BASE }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'No se pudieron cargar las categorías de kits.' );
			}

			return response;
		},
	} ) );

	const deleteMutation = createMutation( ( ) => ( {
		mutationFn : async ( id : string ) : Promise< any > => {
			const response = await connectRequest< any >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.KITS.CATEGORIES.BASE }?id=${ id }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( ) => {
			toast.success( 'Categoría de kits eliminada con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'kit-categories' ] } );
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al intentar eliminar.' );
		},
	} ) );

	$effect( ( ) => {
		$globalLoadingStore = categoriesQuery.isFetching || deleteMutation.isPending;
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

	function openEditModal( item : KitCategory ) : void {
		isEditing       = true;
		editingId       = item.id;
		editingCategory = item;
		showModal       = true;
	}

	function deleteCategory( id : string ) : void {
		deletingId = id;
		deleteMutation.mutate( id, {
			onSettled : ( ) => {
				deletingId = '';
			}
		} );
	}

	// ─── Sorting Helper ───────────────────────────────────────────────────────────
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
	<title>Categorías de Kits - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<HeaderPage
			title       = "Categorías de Kits"
			description = "Gestione las áreas científicas de los Kits de laboratorio pedagógicos (Física, Bioquímica, Robótica)."
			breadcrumb  = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Categorías de Kits'
				}
			] }
			buttonText  = "Agregar Categoría"
			onclick     = { openCreateModal }
			bind:view   = { view }
		/>


		<!-- ─── Search & Filters Tool ────────────────────────────────────────────── -->
		<CategoryFilters
			bind:search          = { search }
			bind:debouncedSearch = { debouncedSearch }
			bind:activeStatus    = { activeStatus }
			placeholder          = "Buscar categoría de kits..."
		/>

		<!-- ─── Content ────────────────────────────────────────────────────── -->
		{#if ( view === 'cards' )}
			{#if ( categoriesQuery.data?.data && categoriesQuery.data.data.length > 0 )}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{#each ( categoriesQuery.data.data ) as item ( item.id )}
						<CategoryCard
							itemType        = "kit-category"
							{ item }
							openEditModal   = { openEditModal }
							deleteItem      = { ( c ) => deleteCategory( c.id ) }
							isDeleteLoading = { deletingId === item.id }
							confirmTitle    = "¿Eliminar categoría?"
							confirmMessage  = "¿Está seguro de que desea eliminar esta categoría de kits? Los kits en esta categoría podrían quedar huérfanos. Esta acción no se puede deshacer."
						/>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted leading-relaxed">
					No se encontraron categorías de kits registradas.
				</div>
			{/if}
		{:else}
			<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card space-y-4 pb-4">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
								<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'name' ) }>
									Nombre de la Categoría { order === 'name' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
								</th>
								<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'active' ) }>
									Estado { order === 'active' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
								</th>
								<th class="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-brand/10 font-semibold">
							{#each ( categoriesQuery.data?.data || [] ) as item ( item.id )}
								<tr class="hover:bg-brand/5 transition-colors duration-150">
									<td class="px-6 py-4 font-bold text-text">{ item.name }</td>
									<td class="px-6 py-4">
										<span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold border { item.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' : 'bg-rose-500/10 text-rose-500 border-rose-500/15' }">
											{ item.active ? 'Activo' : 'Inactivo' }
										</span>
									</td>
									<td class="px-6 py-4 text-right">
										<TableActions
											{ item }
											openEditModal   = { openEditModal }
											deleteItem      = { ( c ) => deleteCategory( c.id ) }
											isDeleteLoading = { deletingId === item.id }
											confirmTitle    = "¿Eliminar categoría?"
											confirmMessage  = "¿Está seguro de que desea eliminar esta categoría de kits? Los kits en esta categoría podrían quedar huérfanos. Esta acción no se puede deshacer."
										/>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No se encontraron categorías de kits registradas.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		{#if ( categoriesQuery.data?.meta && categoriesQuery.data.meta.totalPages > 1 )}
			<div class="flex justify-center pt-2">
				<Pagination
					count={ categoriesQuery.data.meta.total }
					perPage={ categoriesQuery.data.meta.size }
					bind:page={ page }
				/>
			</div>
		{/if}

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<CategoryFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				context="kits"
				initialData={ editingCategory }
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
