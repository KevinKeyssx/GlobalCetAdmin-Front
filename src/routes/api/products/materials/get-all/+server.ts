import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest            from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }    from '$lib/utils/endpoints';
import { ENV }                   from '$lib/utils/env.server';

export const GET: RequestHandler = async ( { fetch } ) => {
	const params = new URLSearchParams( {
		size       : '1000',
		orderBy    : 'name',
		order      : 'asc',
	});

	const response = await connectRequest< any >( {
		endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.GET_ALL }?${ params.toString() }`,
		isInternal : false,
		headers    : {
			'x-secret' : ENV.INTERNAL_SECRET_KEY,
		},
		fetch      : fetch,
	} );

	if ( response && response.data ) {
		return json( response.data );
	}

	return json( response );
};
