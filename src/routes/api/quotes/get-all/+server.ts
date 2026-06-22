import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, {
    isApiError,
    formatServerError
}                               from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
import { ENV }                  from '$lib/utils/env.server';
import type { Quote }           from '$lib/types/quotes';


interface PaginatedQuotesResponse {
	data : Quote[];
	meta : {
		total      : number;
		page       : number;
		size       : number;
		totalPages : number;
	};
}


export const GET : RequestHandler = async ( { url, fetch } ) => {
	try {
		const page     = url.searchParams.get( 'page' ) || '1';
		const size     = url.searchParams.get( 'size' ) || '10';
		const order    = url.searchParams.get( 'order' ) || 'desc';
		const orderBy  = url.searchParams.get( 'orderBy' ) || 'createdAt';
		const query    = url.searchParams.get( 'query' );
		const statuses = url.searchParams.getAll( 'status' );

		const params = new URLSearchParams( {
			page,
			size,
			order,
			orderBy,
		});

		if ( query && query.trim() ) {
			params.append( 'query', query.trim() );
		}

		statuses.forEach( ( status ) => {
			params.append( 'status', status );
		});

		const response = await connectRequest< PaginatedQuotesResponse >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.QUOTES.BASE }?${ params.toString() }`,
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
