<script lang="ts">
	import { untrack } from 'svelte';

    import { createQuery } from '@tanstack/svelte-query';

    import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import RelationManager                  from './RelationManager.svelte';


	interface LabRelation {
		mobileLabId : string;
		quantity    : number;
		mobileLab?  : { id : string; name : string; sku : string };
	}


    interface CatalogLab {
		id   : string;
		name : string;
		sku  : string;
	}


    interface Props {
		items                : LabRelation[];
		isEditing            : boolean;
		initialDataRelations : Array<{ mobileLabId : string }> | null | undefined;
		onRemove             : ( id : string, name : string ) => void;
	}

	let {
		items = $bindable( [ ] ),
		isEditing,
		initialDataRelations,
		onRemove,
	} : Props = $props();

	let catalogLabs = $state< CatalogLab[] >( [ ] );
	let page        = $state( 1 );
	let search      = $state( '' );

	const labsQuery = createQuery( ( ) => ( {
		queryKey : [ 'catalog-labs-select', page, search ],
		queryFn  : async ( ) : Promise< CatalogLab[] > => {
			const params = new URLSearchParams( {
				page : page.toString( ),
				size : '96',
			} );

			if ( search ) {
				params.append( 'query', search );
			}

			const response = await connectRequest< { data : CatalogLab[] } >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.LABS.FILTERS }?${ params.toString( ) }`,
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
		const newItems = labsQuery.data || [ ];
		untrack( ( ) => {
			if ( page === 1 ) {
				catalogLabs = newItems;
			} else {
				const existingIds = new Set( catalogLabs.map( ( item ) => item.id ) );
				const uniqueNew   = newItems.filter( ( item ) => !existingIds.has( item.id ) );
				catalogLabs       = [ ...catalogLabs, ...uniqueNew ];
			}
		} );
	} );

	const hasMore   = $derived( ( labsQuery.data?.length || 0 ) === 96 );
	const isLoading = $derived( labsQuery.isFetching );

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
	catalogItems         = { catalogLabs }
	title                = "Laboratorios Móviles"
	placeholder          = "Seleccionar laboratorio..."
	idKey                = "mobileLabId"
	metaKey              = "mobileLab"
	isEditing            = { isEditing }
	initialDataRelations = { initialDataRelations }
	duplicateMessage     = "Este laboratorio móvil ya está agregado."
	onRemove             = { onRemove }
	onLoadMore           = { handleLoadMore }
	hasMore              = { hasMore }
	isLoading            = { isLoading }
	onSearchChange       = { handleSearch }
/>
