import { json }                         from '@sveltejs/kit';

import { mapKits }                      from '$lib/utils/entityFiles';
import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
import { ENV }                          from '$lib/utils/env.server';
import type { RequestHandler }          from './$types';
import type { GlobalSearchKit }         from '$lib/types/search';

// ─── GET Handler: Fetch a single kit by ID ─────────────────────────────────────
export const GET: RequestHandler = async ( { url, fetch } ) => {
	const id = url.searchParams.get( 'id' ) || '';

	if ( !id ) {
		return json( { error : 'Missing kit ID' }, { status : 400 } );
	}

	const response = await connectRequest< GlobalSearchKit >( {
		endpoint   : `${ EXTERNAL_ENDPOINTS.KITS.BASE }/${ id }?includeFiles=true&includeProducts=true`,
		isInternal : false,
		headers    : {
			'x-secret' : ENV.INTERNAL_SECRET_KEY,
		},
		fetch,
	} );

	if ( isApiError( response ) ) {
		return json( { error : response.message }, { status : response.status || 500 } );
	}

	// Reconstruct media attachments URLs using the entityFiles helper
	const [ mappedKit ] = mapKits( [ response ] );

	return json( mappedKit );
};
