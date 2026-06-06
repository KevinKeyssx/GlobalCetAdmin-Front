<script lang="ts">
	import {
        createQuery,
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import { Plus } from '@lucide/svelte';
    import toast    from 'svelte-french-toast';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import TableActions                     from '$lib/components/shared/TableActions.svelte';
	import Status                           from '$lib/components/shared/Status.svelte';
	import Pagination                       from '$lib/components/shared/Pagination.svelte';
	import MaterialFormModal                from './components/MaterialFormModal.svelte';

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
	let search          = $state( '' );
	let activeStatus    = $state( 'all' ); // 'all' | 'true' | 'false'
	let order           = $state( 'name' );
	let typeOrder       = $state( 'asc' );
	let page            = $state( 1 );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingMaterial = $state< Material | null >( null );

	// Reset to page 1 on filter changes
	$effect( ( ) => {
		page = 1;
	} );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const materialsQuery = createQuery( ( ) => ( {
		queryKey : [ 'materials', page, search, activeStatus, order, typeOrder ],
		queryFn  : async ( ) : Promise< PaginatedResponse< Material > > => {
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

			const response = await connectRequest< PaginatedResponse< Material > >( {
				endpoint   : `products/materials?${ params.toString() }`,
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
				endpoint   : `products/materials?id=${ id }`,
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
		if ( !confirm( '¿Está seguro de que desea eliminar este material?' ) ) return;

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
	<title>Administrar Materiales - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>
					<span>/</span>
					<span>Productos</span>
					<span>/</span>
					<span class="text-brand font-bold">Materiales</span>
				</div>

                <h1 class="font-display text-3xl font-black text-text uppercase tracking-wide">
					Administración de Materiales
				</h1>

                <p class="text-text-muted">
					Gestione las propiedades mecánicas y térmicas de los materiales de catálogo (vidrio, metales, plásticos).
				</p>
			</div>

			<button
				onclick={ openCreateModal }
				class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-xs uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright"
			>
				<Plus class="size-4" />

                <span class="hidden sm:flex">
                    Agregar Material
                </span>
			</button>
		</header>

		<!-- ─── Search & Filter Tool ────────────────────────────────────────────── -->
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
					placeholder="Buscar material..."
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

			{#if ( materialsQuery.data?.meta && materialsQuery.data.meta.totalPages > 1 )}
				<div class="flex justify-center pt-2">
					<Pagination
						count={ materialsQuery.data.meta.total }
						perPage={ materialsQuery.data.meta.size }
						bind:page={ page }
					/>
				</div>
			{/if}
		</section>

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
					maxTemperature     : editingMaterial.maxTemperature || 120,
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
