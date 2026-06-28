<script lang="ts">
	import { resolve }  from '$app/paths';
	import { goto }     from '$app/navigation';

	import {
        createQuery,
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

    import connectRequest, {
        isApiError
    }                               from '$lib/services/fetch.service';
	import type {
		Quote,
		QuoteStatus,
		QuoteResponseItem,
		QuoteStockInfo,
	}                               from '$lib/types/quotes';
	import { METHOD }               from '$lib/services/http-codes';
	import { globalLoadingStore }   from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
	import HeaderPage               from '$lib/components/shared/HeaderPage.svelte';
	import PageContainer            from '$lib/components/shared/PageContainer.svelte';
	import Pagination               from '$lib/components/shared/Pagination.svelte';
	import ConfirmationModal        from '$lib/components/shared/ConfirmationModal.svelte';
	import QuoteFilters             from './components/QuoteFilters.svelte';
	import QuoteCard                from './components/QuoteCard.svelte';
	import QuoteListTable           from './components/QuoteListTable.svelte';


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

	let statusChangeTarget = $state<{ quote : Quote; newStatus : QuoteStatus } | null>( null );

	let quoteStocks   = $state< QuoteStockInfo[] | null >( null );
	let loadingStocks = $state( false );
	let stocksError   = $state( '' );

	$effect( ( ) => {
		if ( statusChangeTarget && ( statusChangeTarget.newStatus === 'COMPLETED' || statusChangeTarget.quote.status === 'COMPLETED' ) ) {
			const quoteId   = statusChangeTarget.quote.id;
			const newStatus = statusChangeTarget.newStatus;
			loadingStocks   = true;
			quoteStocks     = null;
			stocksError     = '';

			connectRequest< QuoteStockInfo[] >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.QUOTES.GET_STOCK }?id=${ quoteId }&status=${ newStatus }`,
				isInternal : true,
			} ).then( ( res ) => {
				if ( isApiError( res ) ) {
					stocksError = res.message;
				} else {
					quoteStocks = res;
				}
				loadingStocks = false;
			} ).catch( ( err ) => {
				stocksError   = err.message || 'Error al obtener stocks';
				loadingStocks = false;
			} );
		} else {
			quoteStocks   = null;
			loadingStocks = false;
			stocksError   = '';
		}
	} );

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
	}));

	const quotesResponse = $derived( quotesQuery.data );
	const quotes         = $derived( quotesResponse?.data || [ ] );

	// ─── Sync Loading State ────────────────────────────────────────────────────────
	$effect( ( ) => {
		$globalLoadingStore = quotesQuery.isFetching || statusMutation.isPending;
		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	function invalidateQuoteItemsCache( items : QuoteResponseItem[] ) : void {
		items.forEach( ( item : QuoteResponseItem ) => {
			if ( item.type === 'product' ) {
				queryClient.refetchQueries( { queryKey : [ 'edit-product', item.id ] } );
			} else if ( item.type === 'kit' ) {
				queryClient.refetchQueries( { queryKey : [ 'edit-kit', item.id ] } );
			} else if ( item.type === 'mobileLab' ) {
				queryClient.refetchQueries( { queryKey : [ 'edit-lab', item.id ] } );
			}
		} );
	}

	function getStockStatus( projectedStock : number, minStock : number ) : { color : string; label : string; bg : string } {
		const redLimit = minStock * 1.05;
		const greenLimit = minStock * 1.10;

		if ( projectedStock < redLimit ) {
			return {
				color : 'text-red-400',
				bg    : 'bg-red-500/10 border-red-500/20',
				label : 'Bajo Stock Mínimo',
			};
		}

		if ( projectedStock >= greenLimit ) {
			return {
				color : 'text-green-400',
				bg    : 'bg-green-500/10 border-green-500/20',
				label : 'Stock Seguro',
			};
		}

		return {
			color : 'text-amber-400',
			bg    : 'bg-amber-500/10 border-amber-500/20',
			label : 'Cerca de Stock Mínimo',
		};
	}

	const statusMutation = createMutation( () => ( {
		mutationFn : async ( { id, status, previousStatus } : { id : string; status : QuoteStatus; previousStatus : QuoteStatus } ) : Promise< Quote > => {
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
		onSuccess  : ( data, variables ) => {
			toast.success( 'Estado de cotización actualizado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-quotes' ] } );

			const transitionedToCompleted   = data.status === 'COMPLETED';
			const transitionedFromCompleted = variables.previousStatus === 'COMPLETED' && data.status !== 'COMPLETED';

			if ( ( transitionedToCompleted || transitionedFromCompleted ) && data.items ) {
				invalidateQuoteItemsCache( data.items );
			}
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al actualizar el estado.' );
		},
	} ) );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal() : void {
		goto( resolve( '/dashboard/quotes/form' ) );
	}

	function openEditModal( quote : Quote ) : void {
		goto( resolve( `/dashboard/quotes/form?id=${ quote.id }` ) );
	}

	function handleStatusChange( quote : Quote, newStatus : QuoteStatus ) : void {
		statusChangeTarget = { quote, newStatus };
	}

	function confirmStatusChange() : void {
		if ( !statusChangeTarget ) return;

		const { quote, newStatus } = statusChangeTarget;
		statusMutation.mutate( { id : quote.id, status : newStatus, previousStatus : quote.status } );
		statusChangeTarget = null;
	}
	let absoluteTotal = $state( 0 );

	$effect( ( ) => {
		if ( quotesResponse?.meta?.total !== undefined ) {
			if ( !search && selectedStatuses.size === 0 ) {
				absoluteTotal = quotesResponse.meta.total;
			}
		}
	} );

	$effect( ( ) => {
		if ( absoluteTotal === 0 && quotesResponse?.meta?.total !== undefined ) {
			absoluteTotal = quotesResponse.meta.total;
		}
	} );
</script>

<svelte:head>
	<title>Administrar Cotizaciones - GlobalCET</title>
</svelte:head>

<PageContainer>
		<!-- Header -->
		<HeaderPage
			title         = "Administración de Cotizaciones"
			description   = "Cree, modifique y gestione las cotizaciones de clientes y sus respectivos estados."
			breadcrumb    = { [
				{
					label : 'Dashboard',
					href  : '/dashboard'
				},
				{
					label : 'Cotizaciones'
				}
			] }
			buttonText    = "Nueva Cotización"
			onclick       = { openCreateModal }
			bind:view     = { view }
			totalCount    = { absoluteTotal }
			filteredCount = { quotesResponse?.meta?.total ?? 0 }
		/>

		<!-- Filters -->
		<QuoteFilters
			bind:search           = { search }
			bind:debouncedSearch  = { debouncedSearch }
			bind:selectedStatuses = { selectedStatuses }
			bind:orderBy          = { orderBy }
			bind:order            = { order }
			class                 = "sm:-mt-3"
		/>

		<!-- Content -->
		{#if ( view === 'cards' )}
			{#if ( quotesQuery.isPending )}
				<!-- Shimmer grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
					{#each Array.from( { length : size } ) as _}
						<div class="h-60 w-full animate-pulse rounded-2xl border border-brand/5 bg-card/45"></div>
					{/each}
				</div>
			{:else if ( quotes.length > 0 )}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
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
</PageContainer>

<!-- Status Change Confirmation Modal -->
<ConfirmationModal
	show        = { !!statusChangeTarget }
	title       = "Confirmar Cambio de Estado"
	message     = "Cambiar el estado de la cotización notificará al cliente por correo electrónico con la actualización. ¿Desea confirmar el cambio?"
	confirmText = "Confirmar"
	cancelText  = "Cancelar"
	pendingText = { loadingStocks ? 'Obteniendo stocks...' : 'Confirmando...' }
	isPending   = { statusMutation.isPending || loadingStocks }
	onConfirm   = { confirmStatusChange }
	onCancel    = { ( ) => statusChangeTarget = null }
>
	{#if ( loadingStocks )}
		<div class="flex flex-col items-center justify-center py-6 gap-3">
			<div class="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
			<span class="text-text-muted text-xs">Calculando proyección de stock...</span>
		</div>
	{:else if ( stocksError )}
		<div class="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
			<strong>Error al cargar proyección de stock:</strong> { stocksError }
		</div>
	{:else if ( quoteStocks && quoteStocks.length > 0 )}
		<div class="mt-4 space-y-3">
			<h4 class="font-display font-bold text-text-muted text-xs uppercase tracking-wider">
				Proyección de Stock
			</h4>
			<div class="max-h-96 overflow-y-auto pr-1 space-y-2.5 text-xs">
				{#each quoteStocks as item}
					{@const status = getStockStatus( item.projectedStock, item.minStock )}
					{@const quoteItem = statusChangeTarget?.quote.items.find( ( i ) => i.id === item.id )}
					{@const qty = quoteItem?.quantity || 0}
					{@const isTransitioningToCompleted = statusChangeTarget?.newStatus === 'COMPLETED' && statusChangeTarget?.quote.status !== 'COMPLETED'}
					<div class="flex flex-col gap-1.5 p-3 rounded-xl border bg-surface/20 { status.bg }">
						<div class="flex items-start justify-between gap-2">
							<div class="flex flex-col">
								<span class="font-display font-bold text-text text-sm">
									{ item.name || item.sku }
								</span>
								<span class="text-text-muted text-xs">
									SKU: { item.sku } • { item.type === 'product' ? 'Producto' : item.type === 'kit' ? 'Kit' : 'Laboratorio' }
								</span>
							</div>
							<span class="text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider { status.color } bg-black/20">
								{ status.label }
							</span>
						</div>
						<div class="grid grid-cols-3 gap-2 mt-1 pt-1.5 border-t border-brand/5 text-xs text-text-muted">
							<div>
								Stock Actual: <strong class="text-text font-bold">{ item.currentStock }</strong>
							</div>
							<div>
								Proyectado: <strong class="text-text font-bold { status.color }">
									{ item.projectedStock }
									{#if ( qty > 0 )}
										<span class="text-[10px] font-medium ml-0.5">
											({ isTransitioningToCompleted ? '-' : '+' }{ qty })
										</span>
									{/if}
								</strong>
							</div>
							<div>
								Mínimo: <strong class="text-text font-bold">{ item.minStock }</strong>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</ConfirmationModal>
