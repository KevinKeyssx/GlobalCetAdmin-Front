import { json }                         from '@sveltejs/kit';

import { mapLabs }                      from '$lib/utils/entityFiles';
import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
import { ENV }                          from '$lib/utils/env.server';
import type { RequestHandler }          from './$types';
import type { GlobalSearchMobileLab }   from '$lib/types/search';

// ─── GET Handler: Fetch a single mobile lab by ID ──────────────────────────────
export const GET: RequestHandler = async ( { url, fetch } ) => {
	const id = url.searchParams.get( 'id' ) || '';

	if ( !id ) {
		return json( { error : 'Missing mobile lab ID' }, { status : 400 } );
	}

	const response = await connectRequest< GlobalSearchMobileLab >( {
		endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }?includeFiles=true&includeProducts=true&includeKits=true`,
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
	const [ mappedLab ] = mapLabs( [ response ] );

	return json( mappedLab );
};
