import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError } from '$lib/services/fetch.service';
import { ENV }                       from '$lib/utils/env.server';
import type { LabCategory }          from '$lib/types/category';
import { METHOD }                    from '$lib/services/http-codes';

// ─── POST Handler: Create a lab category ──────────────────────────────────────
export const POST: RequestHandler = async ( { request, fetch } ) => {
	try {
		const body     = await request.json();
		const response = await connectRequest< LabCategory >( {
			endpoint   : 'lab-categories',
			method     : METHOD.POST,
			isInternal : false,
			body       : body,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( response ) ) {
			return json( { error : response.message }, { status : response.status || 500 } );
		}

		return json( response, { status : 201 } );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};

// ─── PUT Handler: Modify a lab category ───────────────────────────────────────
export const PUT: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing category ID' }, { status : 400 } );
		}

		const body     = await request.json();
		const response = await connectRequest< LabCategory >( {
			endpoint   : `lab-categories/${ id }`,
			method     : METHOD.PUT,
			isInternal : false,
			body       : body,
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

// ─── DELETE Handler: Remove a lab category ────────────────────────────────────
export const DELETE: RequestHandler = async ( { url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing category ID' }, { status : 400 } );
		}

		const response = await connectRequest< any >( {
			endpoint   : `lab-categories/${ id }`,
			method     : METHOD.DELETE,
			isInternal : false,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( response ) ) {
			return json( { error : response.message }, { status : response.status || 500 } );
		}

		return json( { success : true } );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};
