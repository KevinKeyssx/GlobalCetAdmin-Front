<script lang="ts">
	import { untrack } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS } from '$lib/utils/endpoints';
	import RelationManager from './RelationManager.svelte';

	interface ProductRelation {
		productId : string;
		quantity  : number;
		product?  : { id : string; name : string; sku : string };
	}

	interface CatalogProduct {
		id   : string;
		name : string;
		sku  : string;
	}

	interface Props {
		items                : ProductRelation[];
		isEditing            : boolean;
		initialDataRelations : Array<{ productId : string }> | null | undefined;
		onRemove             : ( id : string, name : string ) => void;
	}

	let {
		items = $bindable( [ ] ),
		isEditing,
		initialDataRelations,
		onRemove,
	} : Props = $props();

	let catalogProducts = $state< CatalogProduct[] >( [ ] );
	let page            = $state( 1 );
	let search          = $state( '' );

	const productsQuery = createQuery( ( ) => ( {
		queryKey : [ 'catalog-products-select', page, search ],
		queryFn  : async ( ) : Promise< CatalogProduct[] > => {
			const params = new URLSearchParams( {
				page : page.toString( ),
				size : '96',
			} );

			if ( search ) {
				params.append( 'query', search );
			}

			const response = await connectRequest< { data : CatalogProduct[] } >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.FILTERS }?${ params.toString( ) }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response.data || [ ];
		},
		refetchOnWindowFocus : false,
	} ) );

	$effect( ( ) => {
		const newItems = productsQuery.data || [ ];
		untrack( ( ) => {
			if ( page === 1 ) {
				catalogProducts = newItems;
			} else {
				const existingIds = new Set( catalogProducts.map( ( item ) => item.id ) );
				const uniqueNew   = newItems.filter( ( item ) => !existingIds.has( item.id ) );
				catalogProducts   = [ ...catalogProducts, ...uniqueNew ];
			}
		} );
	} );

	const hasMore   = $derived( ( productsQuery.data?.length || 0 ) === 96 );
	const isLoading = $derived( productsQuery.isFetching );

	function handleLoadMore( ) : void {
		if ( !hasMore || isLoading ) return;
		page += 1;
	}

	function handleSearch( query : string ) : void {
		search = query;
		page   = 1;
	}
</script>

<RelationManager
	bind:items           = { items }
	catalogItems         = { catalogProducts }
	title                = "Productos / Insumos Individuales"
	placeholder          = "Seleccionar producto..."
	idKey                = "productId"
	metaKey              = "product"
	isEditing            = { isEditing }
	initialDataRelations = { initialDataRelations }
	duplicateMessage     = "Este producto ya está agregado."
	onRemove             = { onRemove }
	onLoadMore           = { handleLoadMore }
	hasMore              = { hasMore }
	isLoading            = { isLoading }
	onSearchChange       = { handleSearch }
/>
