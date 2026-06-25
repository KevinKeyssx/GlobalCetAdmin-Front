import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, {
	isApiError,
	formatServerError
}                               from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
import { ENV }                  from '$lib/utils/env.server';
import type { Quote }           from '$lib/types/quotes';


export const GET : RequestHandler = async ( { url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing quote ID' }, { status : 400 } );
		}

		const response = await connectRequest< Quote >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.QUOTES.BASE }/${ id }`,
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
	} catch ( e : any ) {
		const { status, error } = formatServerError( e );
		return json( { error }, { status } );
	}
};
