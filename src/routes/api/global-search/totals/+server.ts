import { json } from '@sveltejs/kit';

import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
import { ENV }                          from '$lib/utils/env.server';
import type { RequestHandler }          from './$types';
import type { GlobalSearchTotalsResponse } from '$lib/types/search';

export const GET : RequestHandler = async ( { fetch } ) => {
	const response = await connectRequest< GlobalSearchTotalsResponse >( {
		endpoint   : EXTERNAL_ENDPOINTS.GLOBAL_SEARCH.TOTALS,
		isInternal : false,
		headers    : {
			'x-secret' : ENV.INTERNAL_SECRET_KEY,
		},
		fetch,
	} );

	if ( isApiError( response ) ) {
		return json( { error : response.message }, { status : response.status || 500 } );
	}

	return json( response );
};
