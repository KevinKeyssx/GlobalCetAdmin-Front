import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, {
	isApiError,
	formatServerError
}                               from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
import { ENV }                  from '$lib/utils/env.server';
import type { QuoteStockInfo }  from '$lib/types/quotes';


export const GET : RequestHandler = async ( { url, fetch } ) => {
	try {
		const id     = url.searchParams.get( 'id' ) || '';
		const status = url.searchParams.get( 'status' ) || '';

		if ( !id ) {
			return json( { error : 'Missing quote ID' }, { status : 400 } );
		}

		if ( !status ) {
			return json( { error : 'Missing status parameter' }, { status : 400 } );
		}

		const response = await connectRequest< QuoteStockInfo[] >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.QUOTES.STOCKS( id ) }?status=${ status }`,
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
