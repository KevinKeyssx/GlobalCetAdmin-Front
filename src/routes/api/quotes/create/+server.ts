import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, {
    isApiError,
    formatServerError
}                               from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
import { ENV }                  from '$lib/utils/env.server';
import { METHOD }               from '$lib/services/http-codes';
import type { Quote }           from '$lib/types/quotes';


export const POST : RequestHandler = async ( { request, fetch } ) => {
	try {
		const body = await request.json();

		const response = await connectRequest< Quote >( {
			endpoint   : EXTERNAL_ENDPOINTS.QUOTES.BASE,
			method     : METHOD.POST,
			isInternal : false,
			body,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch,
		} );

		if ( isApiError( response ) ) {
			return json( { error : response.message }, { status : response.status || 500 } );
		}

		return json( response, { status : 201 } );
	} catch ( e : any ) {
		const { status, error } = formatServerError( e );
		return json( { error }, { status } );
	}
};
