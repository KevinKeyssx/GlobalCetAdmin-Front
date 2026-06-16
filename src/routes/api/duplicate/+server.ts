import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError, formatServerError } from '$lib/services/fetch.service';
import { ENV }                          from '$lib/utils/env.server';
import { METHOD }                       from '$lib/services/http-codes';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';

export const POST: RequestHandler = async ( { url, fetch } ) => {
	try {
		const type = url.searchParams.get( 'type' ) || '';
		const id   = url.searchParams.get( 'id' ) || '';

		if ( !type || !id ) {
			return json( { error : 'Missing type or id parameters' }, { status : 400 } );
		}

		let endpoint = '';

		if ( type === 'product' ) {
			endpoint = `${ EXTERNAL_ENDPOINTS.DUPLICATES.PRODUCT }/${ id }`;
		} else if ( type === 'kit' ) {
			endpoint = `${ EXTERNAL_ENDPOINTS.DUPLICATES.KIT }/${ id }`;
		} else if ( type === 'mobile-lab' ) {
			endpoint = `${ EXTERNAL_ENDPOINTS.DUPLICATES.MOBILE_LAB }/${ id }`;
		} else {
			return json( { error : 'Invalid type parameter' }, { status : 400 } );
		}

		const response = await connectRequest< any >( {
			endpoint,
			method		: METHOD.POST,
			isInternal	: false,
			body		: {},
			headers		: {
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
