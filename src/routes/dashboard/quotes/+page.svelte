<script lang="ts">
	import {
        createQuery,
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

    import connectRequest, {
        isApiError
    }           from '$lib/services/fetch.service';
	import type {
        Quote,
        QuoteStatus,
        QuoteSavePayload
    }                               from '$lib/types/quotes';
	import { METHOD }               from '$lib/services/http-codes';
	import { globalLoadingStore }   from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
	import HeaderPage               from '$lib/components/shared/HeaderPage.svelte';
	import Pagination               from '$lib/components/shared/Pagination.svelte';
	import ConfirmationModal        from '$lib/components/shared/ConfirmationModal.svelte';
	import QuoteFilters             from './components/QuoteFilters.svelte';
	import QuoteCard                from './components/QuoteCard.svelte';
	import QuoteListTable           from './components/QuoteListTable.svelte';
	import QuoteFormModal           from './components/QuoteFormModal.svelte';


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
	let search           = $state( '' );
	let debouncedSearch  = $state( '' );
	let selectedStatuses = $state( new Set< string >() );
	let orderBy          = $state( 'createdAt' );
	let order            = $state( 'desc' );
	let page             = $state( 1 );
	let size             = $state( 12 );
	let view             = $state< 'cards' | 'list' >( 'cards' );

	// Modals controls
	let showFormModal      = $state( false );
	let isEditing          = $state( false );
	let editingQuote       = $state< Quote | null >( null );
	let statusChangeTarget = $state<{ quote : Quote; newStatus : QuoteStatus } | null>( null );

	// Reset page when filters change
	$effect( ( ) => {
		const _ = [ debouncedSearch, Array.from( selectedStatuses ), orderBy, order, size ];
		page = 1;
	} );

	// ─── TanStack Query Client & Queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const quotesQuery = createQuery( ( ) => ( {
		queryKey : [ 'admin-quotes', page, size, debouncedSearch, Array.from( selectedStatuses ), orderBy, order ],
		queryFn  : async ( ) : Promise< PaginatedResponse< Quote > > => {
			const params = new URLSearchParams( {
				page    : page.toString( ),
				size    : size.toString( ),
				orderBy : orderBy,
				order   : order,
			} );

			if ( debouncedSearch.trim( ) ) {
				params.append( 'query', debouncedSearch.trim( ) );
			}

			Array.from( selectedStatuses ).forEach( ( st ) => {
				params.append( 'status', st );
			} );

			const response = await connectRequest< PaginatedResponse< Quote > >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.QUOTES.GET_ALL }?${ params.toString( ) }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message || 'Error al cargar cotizaciones.' );
			}
			return response;
		},
	} ) );

	const quotesResponse = $derived( quotesQuery.data );
	const quotes         = $derived( quotesResponse?.data || [ ] );

	// ─── Sync Loading State ────────────────────────────────────────────────────────
	$effect( ( ) => {
		$globalLoadingStore = quotesQuery.isFetching || saveMutation.isPending || statusMutation.isPending;
		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Mutations ────────────────────────────────────────────────────────────────
	const saveMutation = createMutation( ( ) => ( {
		mutationFn : async ( { isEditing, id, payload } : { isEditing : boolean; id : string; payload : QuoteSavePayload } ) : Promise< Quote > => {
			const endpoint = isEditing
				? `${ INTERNAL_ENDPOINTS.QUOTES.UPDATE }?id=${ id }`
				: `${ INTERNAL_ENDPOINTS.QUOTES.CREATE }`;

			const response = await connectRequest< Quote >( {
				endpoint,
				method     : isEditing ? METHOD.PATCH : METHOD.POST,
				body       : payload,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message || 'Error al guardar la cotización.' );
			}
			return response;
		},
		onSuccess : ( ) => {
			toast.success( isEditing ? 'Cotización actualizada correctamente.' : 'Cotización creada correctamente.' );
			showFormModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'admin-quotes' ] } );
		},
		onError : ( error : any ) => {
			toast.error( error.message || 'Error al guardar la cotización.' );
		},
	} ) );

	const statusMutation = createMutation( ( ) => ( {
		mutationFn : async ( { id, status } : { id : string; status : QuoteStatus } ) : Promise< Quote > => {
			const response = await connectRequest< Quote >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.QUOTES.UPDATE }?id=${ id }&status=true`,
				method     : METHOD.PATCH,
				body       : { status },
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message || 'Error al actualizar el estado.' );
			}
			return response;
		},
		onSuccess : ( ) => {
			toast.success( 'Estado de cotización actualizado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-quotes' ] } );
		},
		onError : ( error : any ) => {
			toast.error( error.message || 'Error al actualizar el estado.' );
		},
	} ) );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal( ) : void {
		isEditing     = false;
		editingQuote  = null;
		showFormModal = true;
	}

	function openEditModal( quote : Quote ) : void {
		isEditing     = true;
		editingQuote  = quote;
		showFormModal = true;
	}

	function handleStatusChange( quote : Quote, newStatus : QuoteStatus ) : void {
		statusChangeTarget = { quote, newStatus };
	}

	function confirmStatusChange( ) : void {
		if ( !statusChangeTarget ) return;

		const { quote, newStatus } = statusChangeTarget;
		statusMutation.mutate( { id : quote.id, status : newStatus } );
		statusChangeTarget = null;
	}

	function handleFormSave( payload : QuoteSavePayload ) : void {
		saveMutation.mutate( {
			isEditing,
			id : editingQuote?.id || '',
			payload,
		} );
	}
</script>

<svelte:head>
	<title>Administrar Cotizaciones - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12 select-none">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- Header -->
		<HeaderPage
			title       = "Administración de Cotizaciones"
			description = "Cree, modifique y gestione las cotizaciones de clientes y sus respectivos estados."
			breadcrumb  = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Cotizaciones'
				}
			] }
			buttonText  = "Nueva Cotización"
			onclick     = { openCreateModal }
			bind:view   = { view }
		/>

		<!-- Filters -->
		<QuoteFilters
			bind:search           = { search }
			bind:debouncedSearch  = { debouncedSearch }
			bind:selectedStatuses = { selectedStatuses }
			bind:orderBy          = { orderBy }
			bind:order            = { order }
		/>

		<!-- Content -->
		{#if ( view === 'cards' )}
			{#if ( quotesQuery.isPending )}
				<!-- Shimmer grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each Array.from( { length : size } ) as _}
						<div class="h-60 w-full animate-pulse rounded-2xl border border-brand/5 bg-card/45"></div>
					{/each}
				</div>
			{:else if ( quotes.length > 0 )}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each quotes as quote ( quote.id )}
						<QuoteCard
							{ quote }
							onEdit         = { openEditModal }
							onStatusChange = { handleStatusChange }
						/>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-brand/10 bg-card/30 p-12 text-center text-text-muted italic">
					No se encontraron cotizaciones asociadas a los filtros.
				</div>
			{/if}
		{:else}
			{#if ( quotesQuery.isPending )}
				<!-- Shimmer list -->
				<div class="flex flex-col gap-2.5">
					{#each Array.from( { length : 6 } ) as _}
						<div class="h-14 w-full animate-pulse rounded-xl bg-card/45 border border-brand/5"></div>
					{/each}
				</div>
			{:else}
				<QuoteListTable
					{ quotes }
					onEdit         = { openEditModal }
					onStatusChange = { handleStatusChange }
				/>
			{/if}
		{/if}

		<!-- Pagination -->
		{#if ( quotesResponse?.meta )}
			<Pagination
				count        = { quotesResponse.meta.total }
				bind:perPage = { size }
				bind:page    = { page }
			/>
		{/if}
	</div>
</main>

<!-- Create/Edit Form Modal -->
<QuoteFormModal
	show        = { showFormModal }
	{ isEditing }
	initialData = { editingQuote }
	onSave      = { handleFormSave }
	onCancel    = { ( ) => showFormModal = false }
/>

<!-- Status Change Confirmation Modal -->
<ConfirmationModal
	show        = { !!statusChangeTarget }
	title       = "Confirmar Cambio de Estado"
	message     = "Cambiar el estado de la cotización notificará al cliente por correo electrónico con la actualización. ¿Desea confirmar el cambio?"
	confirmText = "Confirmar"
	cancelText  = "Cancelar"
	onConfirm   = { confirmStatusChange }
	onCancel    = { ( ) => statusChangeTarget = null }
/>
