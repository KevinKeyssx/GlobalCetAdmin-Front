import { json }                         from '@sveltejs/kit';

import connectRequest, { isApiError }    from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }            from '$lib/utils/endpoints';
import { ENV }                           from '$lib/utils/env.server';
import type { RequestHandler }           from './$types';


export const GET: RequestHandler = async ( { url, fetch } ) => {
	const id = url.searchParams.get( 'id' ) || '';
	const typeInput = url.searchParams.get( 'type' ) || '';

	if ( !id || !typeInput ) {
		return json( { error : 'Missing id or type parameter' }, { status : 400 } );
	}

	let type = typeInput;
	if ( typeInput === 'lab' ) {
		type = 'mobileLab';
	}

	const params = new URLSearchParams( {
		type,
	} );

	try {
		const response = await connectRequest< any >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.PRICE_HISTORY.BASE }/${ id }?${ params.toString() }`,
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
	} catch ( err : any ) {
		return json( { error : err.message || 'Internal Server Error' }, { status : err.status || 500 } );
	}
};
