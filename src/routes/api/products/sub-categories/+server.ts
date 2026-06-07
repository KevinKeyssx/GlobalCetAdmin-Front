import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError } from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }         from '$lib/utils/endpoints';
import { ENV }                        from '$lib/utils/env.server';
import { METHOD }                     from '$lib/services/http-codes';

export const GET: RequestHandler = async ( { fetch } ) => {
	try {
		const response = await connectRequest< any >( {
			endpoint   : EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.SUB_BASE,
			method     : METHOD.GET,
			isInternal : false,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( response ) ) {
			return json( { error : response.message }, { status : response.status || 500 } );
		}

		return json( response );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};
