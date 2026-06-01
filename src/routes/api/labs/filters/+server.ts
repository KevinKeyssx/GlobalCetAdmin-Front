import { json, type RequestHandler } from '@sveltejs/kit';

import type { GlobalSearchMobileLab }  from '$lib/types/search';
import connectRequest, { isApiError } from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }         from '$lib/utils/endpoints';
import { ENV }                        from '$lib/utils/env.server';
import { mapLabs }                    from '$lib/utils/entityFiles';


interface PaginatedLabsResponse {
	data : GlobalSearchMobileLab[];
	meta : {
		total      : number;
		page       : number;
		size       : number;
		totalPages : number;
	};
}

// ─── GET Handler ─────────────────────────────────────────────────────────────
export const GET: RequestHandler = async ( { url, fetch } ) => {
	const page       = url.searchParams.get( 'page' ) || '1';
	const size       = url.searchParams.get( 'size' ) || '10';
	const categories = url.searchParams.getAll( 'categories' );

	const params = new URLSearchParams( {
		page,
		size,
		includeImages : 'true',
	} );

	categories.forEach( ( id ) => params.append( 'categories', id ) );

	const response = await connectRequest<PaginatedLabsResponse>( {
		endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }?${ params.toString() }`,
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
		data : mapLabs( response.data || [] ),
		meta : response.meta,
	} );
};
