<script lang="ts">
	import { untrack } from 'svelte';

    import { createQuery } from '@tanstack/svelte-query';

    import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import RelationManager                  from './RelationManager.svelte';


    interface KitRelation {
		kitId    : string;
		quantity : number;
		kit?     : { id : string; name : string; sku : string };
	}


    interface CatalogKit {
		id   : string;
		name : string;
		sku  : string;
	}


    interface Props {
		items                : KitRelation[];
		isEditing            : boolean;
		initialDataRelations : Array<{ kitId : string }> | null | undefined;
		onRemove             : ( id : string, name : string ) => void;
	}


    let {
		items = $bindable( [ ] ),
		isEditing,
		initialDataRelations,
		onRemove,
	} : Props = $props();

	let catalogKits = $state< CatalogKit[] >( [ ] );
	let page        = $state( 1 );
	let search      = $state( '' );

	const kitsQuery = createQuery( ( ) => ( {
		queryKey : [ 'catalog-kits-select', page, search ],
		queryFn  : async ( ) : Promise< CatalogKit[] > => {
			const params = new URLSearchParams( {
				page : page.toString( ),
				size : '96',
			} );

			if ( search ) {
				params.append( 'query', search );
			}

			const response = await connectRequest< { data : CatalogKit[] } >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.KITS.FILTERS }?${ params.toString( ) }`,
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
		const newItems = kitsQuery.data || [ ];
		untrack( ( ) => {
			if ( page === 1 ) {
				catalogKits = newItems;
			} else {
				const existingIds = new Set( catalogKits.map( ( item ) => item.id ) );
				const uniqueNew   = newItems.filter( ( item ) => !existingIds.has( item.id ) );
				catalogKits       = [ ...catalogKits, ...uniqueNew ];
			}
		} );
	} );

	const hasMore   = $derived( ( kitsQuery.data?.length || 0 ) === 96 );
	const isLoading = $derived( kitsQuery.isFetching );

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
	catalogItems         = { catalogKits }
	title                = "Kits Pedagógicos Integrados"
	placeholder          = "Seleccionar kit..."
	idKey                = "kitId"
	metaKey              = "kit"
	isEditing            = { isEditing }
	initialDataRelations = { initialDataRelations }
	duplicateMessage     = "Este kit ya está agregado."
	onRemove             = { onRemove }
	onLoadMore           = { handleLoadMore }
	hasMore              = { hasMore }
	isLoading            = { isLoading }
	onSearchChange       = { handleSearch }
/>
