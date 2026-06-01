import { json } from '@sveltejs/kit';

import { mapProducts, mapKits, mapLabs }    from '$lib/utils/entityFiles';
import type { GlobalSearchResponse }        from '$lib/types/search';
import connectRequest, { isApiError }       from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }               from '$lib/utils/endpoints';
import { ENV }                              from '$lib/utils/env.server';
import type { RequestHandler }              from './$types';

// ─── GET Handler ─────────────────────────────────────────────────────────────
export const GET: RequestHandler = async ( { url, fetch } ) => {
	const query          = url.searchParams.get( 'query' ) || '';
	const limitPerEntity = url.searchParams.get( 'limitPerEntity' ) || '10';
	const suggestion     = url.searchParams.get( 'suggestion' ) || 'false';
	const sortBy         = url.searchParams.get( 'sortBy' ) || '';
	const sortOrder      = url.searchParams.get( 'sortOrder' ) || '';

	const params = new URLSearchParams( {
		limitPerEntity,
		suggestion,
	});

	if ( query ) {
		params.set( 'query', query );
	}

    if ( sortBy ) {
		params.set( 'sortBy', sortBy );
	}

    if ( sortOrder ) {
		params.set( 'sortOrder', sortOrder );
	}

	const response = await connectRequest<GlobalSearchResponse>( {
		endpoint   : `${ EXTERNAL_ENDPOINTS.GLOBAL_SEARCH.BASE }?${ params.toString() }`,
		isInternal : false,
		headers    : {
			'x-secret' : ENV.INTERNAL_SECRET_KEY,
		},
		fetch,
	});

	if ( isApiError( response )) {
		return json({ error : response.message }, { status : response.status || 500 });
	}

	// Reconstruct media attachment URLs dynamically using shared list mappers
	const mappedResponse: GlobalSearchResponse = {
		products   : mapProducts( response.products || [] ),
		kits       : mapKits( response.kits || [] ),
		mobileLabs : mapLabs( response.mobileLabs || [] ),
		meta       : response.meta,
	};

	return json( mappedResponse );
};
