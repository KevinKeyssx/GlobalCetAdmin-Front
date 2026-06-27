import { json }                         from '@sveltejs/kit';

import { EXTERNAL_ENDPOINTS }            from '$lib/utils/endpoints';
import { ENV }                           from '$lib/utils/env.server';
import type { RequestHandler }           from './$types';


export const GET: RequestHandler = async ( { url, fetch } ) => {
	const backendUrl = `${ ENV.BACKEND_URL.replace( /\/+$/, '' ) }${ EXTERNAL_ENDPOINTS.PRODUCTS.EXPORT }${ url.search }`;

	try {
		const response = await fetch( backendUrl, {
			method  : 'GET',
			headers : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
		} );

		if ( !response.ok ) {
			const errorData = await response.json().catch( ( ) => ( { message : 'Error al exportar desde el servidor' } ) );
			return json( { error : errorData.message || errorData.error || 'Error al exportar' }, { status : response.status } );
		}

		const headers = new Headers();
		const contentType = response.headers.get( 'content-type' );
		const contentDisposition = response.headers.get( 'content-disposition' );

		if ( contentType ) {
			headers.set( 'content-type', contentType );
		}
		if ( contentDisposition ) {
			headers.set( 'content-disposition', contentDisposition );
		}

		return new Response( response.body, {
			status : 200,
			headers,
		} );
	} catch ( err : any ) {
		return json( { error : err.message || 'Error interno del servidor proxy' }, { status : 500 } );
	}
};
