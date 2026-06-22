import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, {
    isApiError,
    formatServerError
}                               from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
import { ENV }                  from '$lib/utils/env.server';
import { METHOD }               from '$lib/services/http-codes';
import type { Quote }           from '$lib/types/quotes';


export const PATCH : RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id     = url.searchParams.get( 'id' ) || '';
		const status = url.searchParams.get( 'status' ) === 'true';

		if ( !id ) {
			return json( { error : 'Missing quote ID' }, { status : 400 } );
		}

		const body = await request.json();

		const endpoint = status
			? `${ EXTERNAL_ENDPOINTS.QUOTES.BASE }/${ id }/status`
			: `${ EXTERNAL_ENDPOINTS.QUOTES.BASE }/${ id }`;

		const response = await connectRequest< Quote >( {
			endpoint,
			method     : METHOD.PATCH,
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

		return json( response );
	} catch ( e : any ) {
		const { status, error } = formatServerError( e );
		return json( { error }, { status } );
	}
};
