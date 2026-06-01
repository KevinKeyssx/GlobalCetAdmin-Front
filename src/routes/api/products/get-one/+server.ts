import { json }                         from '@sveltejs/kit';

import { mapProducts }                  from '$lib/utils/entityFiles';
import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
import { ENV }                          from '$lib/utils/env.server';
import type { RequestHandler }          from './$types';
import type { GlobalSearchProduct }     from '$lib/types/search';

// ─── GET Handler: Fetch a single product by ID ─────────────────────────────────
export const GET: RequestHandler = async ( { url, fetch } ) => {
	const id = url.searchParams.get( 'id' ) || '';

	if ( !id ) {
		return json({ error : 'Missing product ID' }, { status : 400 });
	}

	const response = await connectRequest< GlobalSearchProduct >({
		endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }?includeImages=true&includeKits=true&includeMobileLabs=true`,
		isInternal : false,
		headers    : {
			'x-secret' : ENV.INTERNAL_SECRET_KEY,
		},
		fetch,
	});

	if ( isApiError( response )) {
		return json({ error : response.message }, { status : response.status || 500 });
	}

	// Reconstruct media attachments URLs using the entityFiles helper
	const [ mappedProduct ] = mapProducts([ response ]);

	return json( mappedProduct );
};
