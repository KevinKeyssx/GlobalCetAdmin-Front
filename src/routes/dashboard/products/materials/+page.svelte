<script lang="ts">
	import {
        createQuery,
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import toast                            from 'svelte-french-toast';
	import { BrushCleaning }                from '@lucide/svelte';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Status                           from '$lib/components/shared/Status.svelte';
	import Pagination                       from '$lib/components/shared/Pagination.svelte';
	import MaterialFormModal                from './components/MaterialFormModal.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import Select                           from '$lib/components/shared/Select.svelte';
	import SearchInput                      from '$lib/components/shared/SearchInput.svelte';
	import MaterialCard                     from '$lib/components/shared/itemCard/MaterialCard.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface Material {
		id                 : string;
		name               : string;
		slug               : string;
		description?       : string;
		autoclavable?      : boolean;
		maxTemperature?    : number;
		chemicalResistance : {
			acid     : string;
			alkaline : string;
		};
		active             : boolean;
		createdAt          : string;
		updatedAt          : string;
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
	let activeStatus       = $state( 'all' ); // 'all' | 'true' | 'false'
	let autoclavableStatus = $state( 'all' ); // 'all' | 'true' | 'false'
	let order              = $state( 'name' );
	let typeOrder          = $state( 'asc' );
	let page               = $state( 1 );
	let view               = $state< 'cards' | 'list' >( 'cards' );
	let showModal          = $state( false );
	let isEditing          = $state( false );
	let editingId          = $state( '' );
	let editingMaterial    = $state< Material | null >( null );
	let deletingId         = $state( '' );

	const statusOptions = [
		{ id : 'all',   name : 'Todos los estados' },
		{ id : 'true',  name : 'Activos' },
		{ id : 'false', name : 'Inactivos' }
	];

	const autoclavableOptions = [
		{ id : 'all',   name : 'Todos (Autoclavable)' },
		{ id : 'true',  name : 'Autoclavable' },
		{ id : 'false', name : 'No Autoclavable' }
	];

	function clearFilters( ) : void {
		search             = '';
		debouncedSearch    = '';
		activeStatus       = 'all';
		autoclavableStatus = 'all';
	}

	// Reset to page 1 on filter changes
	$effect( ( ) => {
		const _ = [ debouncedSearch, activeStatus, autoclavableStatus ];
		page = 1;
	} );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const materialsQuery = createQuery( ( ) => ( {
		queryKey : [ 'materials', page, debouncedSearch, activeStatus, autoclavableStatus, order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< Material > > => {
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

			if ( autoclavableStatus !== 'all' ) {
				params.append( 'autoclavable', autoclavableStatus );
			}

			const response = await connectRequest< PaginatedResponse< Material > >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.BASE }?${ params.toString() }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'No se pudieron cargar los materiales.' );
			}

			return response;
		},
	} ) );

	const deleteMutation = createMutation( ( ) => ( {
		mutationFn : async ( id : string ) : Promise< any > => {
			const response = await connectRequest< any >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.BASE }?id=${ id }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( ) => {
			toast.success( 'Material eliminado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'materials' ] } );
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al intentar eliminar el material.' );
		},
	} ) );

	$effect( ( ) => {
		$globalLoadingStore = materialsQuery.isFetching || deleteMutation.isPending;
		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal( ) : void {
		isEditing       = false;
		editingId       = '';
		editingMaterial = null;
		showModal       = true;
	}

	function openEditModal( item : Material ) : void {
		isEditing       = true;
		editingId       = item.id;
		editingMaterial = item;
		showModal       = true;
	}

	function deleteMaterial( id : string ) : void {
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
	<title>Administrar Materiales - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<HeaderPage
			title       = "Administración de Materiales"
			description = "Gestione las propiedades mecánicas y térmicas de los materiales de catálogo (vidrio, metales, plásticos)."
			breadcrumb  = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Materiales de Productos'
				}
			] }
			buttonText  = "Agregar Material"
			onclick     = { openCreateModal }
			bind:view   = { view }
		/>


		<!-- ─── Search & Filter Tool ────────────────────────────────────────────── -->
		<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-end bg-card/40 border border-brand/10 p-4 rounded-2xl w-full text-xs">
			<!-- Search -->
			<div class="space-y-1.5 w-full sm:col-span-2 md:col-span-2">
				<label for="search-input" class="text-xs font-bold text-text-muted uppercase tracking-wider">Buscar</label>

				<SearchInput
					bind:value          = { search }
					bind:debouncedValue = { debouncedSearch }
					placeholder         = "Buscar material..."
				/>
			</div>

			<!-- Autoclavable Select -->
			<div class="space-y-1.5 w-full sm:col-span-1 md:col-span-1">
				<label for="autoclavable-select" class="uppercase tracking-wider">Autoclavable</label>

				<Select
					bind:value  = { autoclavableStatus }
					options     = { autoclavableOptions }
					multiple    = { false }
					searching   = { false }
					placeholder = "Todos"
				/>
			</div>

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

				{#if ( activeStatus !== 'all' || autoclavableStatus !== 'all' || search ) }
					<button
						onclick = { clearFilters }
						class   = "rounded-xl border border-brand/20 bg-surface/30 h-[46px] aspect-square flex items-center justify-center cursor-pointer text-text-muted hover:bg-brand/10 hover:text-brand transition-colors"
					>
						<BrushCleaning class="size-4" />
					</button>
				{/if}
			</div>
		</div>



		<!-- ─── Content ────────────────────────────────────────────────────── -->
		{#if ( view === 'cards' )}
			{#if ( materialsQuery.data?.data && materialsQuery.data.data.length > 0 )}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{#each ( materialsQuery.data.data ) as item ( item.id )}
						<MaterialCard
							{ item }
							openEditModal   = { openEditModal }
							deleteItem      = { ( m ) => deleteMaterial( m.id ) }
							isDeleteLoading = { deletingId === item.id }
							confirmTitle    = "¿Eliminar material?"
							confirmMessage  = "¿Está seguro de que desea eliminar este material? Esta acción no se puede deshacer."
						/>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted leading-relaxed">
					No se encontraron materiales registrados.
				</div>
			{/if}
		{:else}
			<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card space-y-4 pb-4">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="border-b border-brand/15 bg-brand/5 text-xs font-black uppercase tracking-widest text-text-muted">
								<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'name' ) }>
									Nombre { order === 'name' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
								</th>
								<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'slug' ) }>
									Slug { order === 'slug' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
								</th>
								<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'autoclavable' ) }>
									Autoclavable { order === 'autoclavable' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
								</th>
								<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'maxTemperature' ) }>
									Temp. Máx { order === 'maxTemperature' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
								</th>
								<th class="px-6 py-4">Resist. Química (Ácido / Alcalino)</th>
								<th class="px-6 py-4 cursor-pointer hover:text-brand select-none" onclick={ ( ) => toggleSort( 'active' ) }>
									Estado { order === 'active' ? ( typeOrder === 'asc' ? '▲' : '▼' ) : '' }
								</th>
								<th class="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-brand/10 font-semibold text-sm">
							{#each ( materialsQuery.data?.data || [] ) as item ( item.id )}
								<tr class="hover:bg-brand/5 transition-colors duration-150">
									<td class="px-6 py-4 font-bold text-text">{ item.name }</td>

									<td class="px-6 py-4 font-mono text-text-muted">{ item.slug }</td>

									<td class="px-6 py-4">
										<Status
											status      = { item.autoclavable || false }
											textTrue    = "Si"
											textFalse   = "No"
										/>
									</td>

									<td class="px-6 py-4 font-mono">{ item.maxTemperature || 0 } °C</td>

									<td class="px-6 py-4 uppercase font-bold text-[10px] text-brand">
										{ item.chemicalResistance?.acid || 'N/A' } / { item.chemicalResistance?.alkaline || 'N/A' }
									</td>

									<td class="px-6 py-4">
										<Status status={ item.active } />
									</td>

									<td class="px-6 py-4 text-right">
										<TableActions
											{ item }
											openEditModal   = { openEditModal }
											deleteItem      = { ( m ) => deleteMaterial( m.id ) }
											isDeleteLoading = { deletingId === item.id }
											confirmTitle    = "¿Eliminar material?"
											confirmMessage  = "¿Está seguro de que desea eliminar este material? Esta acción no se puede deshacer."
										/>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="7" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No se encontraron materiales registrados.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		{#if ( materialsQuery.data?.meta && materialsQuery.data.meta.totalPages > 1 )}
			<div class="flex justify-center pt-2">
				<Pagination
					count={ materialsQuery.data.meta.total }
					perPage={ materialsQuery.data.meta.size }
					bind:page={ page }
				/>
			</div>
		{/if}

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<MaterialFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				initialData={ editingMaterial ? {
					name               : editingMaterial.name,
					slug               : editingMaterial.slug,
					description        : editingMaterial.description || '',
					autoclavable       : editingMaterial.autoclavable || false,
					maxTemperature     : editingMaterial.maxTemperature || null,
					acidResistance     : editingMaterial.chemicalResistance?.acid || 'excellent',
					alkalineResistance : editingMaterial.chemicalResistance?.alkaline || 'good',
					active             : editingMaterial.active,
				} : null }
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
