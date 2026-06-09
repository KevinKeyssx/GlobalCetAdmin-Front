import { json, type RequestHandler } from '@sveltejs/kit';

import type { GlobalSearchProduct }     from '$lib/types/search';
import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
import { ENV }                          from '$lib/utils/env.server';
import { mapProducts }                  from '$lib/utils/entityFiles';

interface PaginatedProductsResponse {
	data : GlobalSearchProduct[];
	meta : {
		total      : number;
		page       : number;
		size       : number;
		totalPages : number;
	};
}

// ─── GET Handler ─────────────────────────────────────────────────────────────
export const GET : RequestHandler = async ( { url, fetch } ) => {
	const page          = url.searchParams.get( 'page' ) || '1';
	const size          = url.searchParams.get( 'size' ) || '10';
	const subcategories = url.searchParams.getAll( 'subcategories' );
	const materials     = url.searchParams.getAll( 'materials' );
	const active        = url.searchParams.get( 'active' );
	const query         = url.searchParams.get( 'query' );

	const params = new URLSearchParams( {
		page,
		size,
		includeFiles : 'true',
	} );

	if ( query ) {
		params.append( 'query', query );
	}

	subcategories.forEach( ( id ) => params.append( 'subcategories', id ) );
	materials.forEach( ( id ) => params.append( 'materials', id ) );

	if ( active !== null && active !== 'all' ) {
		params.append( 'active', active );
	}

	const response = await connectRequest<PaginatedProductsResponse>( {
		endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }?${ params.toString() }`,
		isInternal : false,
		headers    : {
			'x-secret' : ENV.INTERNAL_SECRET_KEY,
		},
		fetch,
	} );

	if ( isApiError( response ) ) {
		return json( { error : response.message }, { status : response.status || 500 } );
	}

	return json( {
		data : mapProducts( response.data || [] ),
		meta : response.meta,
	} );
};
