<script lang="ts">
	import toast                                            from 'svelte-french-toast';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

	import connectRequest, { isApiError }                   from '$lib/services/fetch.service';
	import { METHOD }                                       from '$lib/services/http-codes';
	import { globalLoadingStore }                           from '$lib/state/loading';
	import CategoryFormModal                                from '$lib/components/shared/CategoryFormModal.svelte';
	import TableActions                                     from '$lib/components/shared/TableActions.svelte';
	import Pagination                                       from '$lib/components/shared/Pagination.svelte';

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
	let activeStatus    = $state( 'all' ); // 'all' | 'true' | 'false'
	let order           = $state( 'name' );
	let typeOrder       = $state( 'asc' );
	let page            = $state( 1 );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingCategory = $state< KitCategory | null >( null );

	// Reset to page 1 on filter changes
	$effect( ( ) => {
		page = 1;
	} );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const categoriesQuery = createQuery( ( ) => ( {
		queryKey : [ 'kit-categories', page, search, activeStatus, order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< KitCategory > > => {
			const params = new URLSearchParams( {
				page      : page.toString(),
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

			const response = await connectRequest< PaginatedResponse< KitCategory > >( {
				endpoint   : `kits/categories?${ params.toString() }`,
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
				endpoint   : `kits/categories?id=${ id }`,
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
		if ( !confirm( '¿Está seguro de que desea eliminar esta categoría de kits? Los kits en esta categoría podrían quedar huérfanos.' ) ) return;

		deleteMutation.mutate( id );
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
	<div class="mx-auto max-w-5xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>
					<span>/</span>
					<span>Kits</span>
					<span>/</span>
					<span class="text-brand font-bold">Categorías</span>
				</div>
				<h1 class="font-display text-3xl font-black text-text uppercase tracking-wide">
					Categorías de Kits
				</h1>
				<p class="text-text-muted">
					Gestione las áreas científicas de los Kits de laboratorio pedagógicos (Física, Bioquímica, Robótica).
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
				Agregar Categoría
			</button>
		</div>

		<!-- ─── Search Tool ──────────────────────────────────────────────────────── -->
		<div class="flex flex-col sm:flex-row items-center gap-2 max-w-xl w-full">
			<select
				bind:value={ activeStatus }
				class="w-full sm:w-auto rounded-xl border border-brand/15 bg-input py-2.5 px-3 text-sm text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10 font-bold"
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
					placeholder="Buscar categoría de kits..."
					bind:value={ search }
					class="w-full rounded-xl border border-brand/15 bg-input py-2.5 pl-10 pr-4 text-sm text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10"
				/>
			</div>
		</div>

		<!-- ─── Table Content ────────────────────────────────────────────────────── -->
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
										openEditModal={ openEditModal }
										deleteItem={ ( c ) => deleteCategory( c.id ) }
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

			{#if ( categoriesQuery.data?.meta && categoriesQuery.data.meta.totalPages > 1 )}
				<div class="flex justify-center pt-2">
					<Pagination
						count={ categoriesQuery.data.meta.total }
						perPage={ categoriesQuery.data.meta.size }
						bind:page={ page }
					/>
				</div>
			{/if}
		</section>

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
