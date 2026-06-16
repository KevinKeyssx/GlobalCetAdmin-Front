import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError, formatServerError } from '$lib/services/fetch.service';
import { ENV }                       from '$lib/utils/env.server';
import type { Material }             from '$lib/types/material';
import { METHOD }                    from '$lib/services/http-codes';
import { EXTERNAL_ENDPOINTS }        from '$lib/utils/endpoints';

// ─── GET Handler: Fetch paginated materials ───────────────────────────────────
export const GET: RequestHandler = async ( { url, fetch } ) => {
	try {
		const response = await connectRequest< any >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.GET_ALL }?${ url.searchParams.toString() }`,
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
		const { status, error } = formatServerError( e, 'Material' );
		return json( { error }, { status } );
	}
};

// ─── POST Handler: Create a material ──────────────────────────────────────────
export const POST: RequestHandler = async ( { request, fetch } ) => {
	try {
		const body     = await request.json();
		const response = await connectRequest< Material >( {
			endpoint   : EXTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.BASE,
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
		const { status, error } = formatServerError( e, 'Material' );
		return json( { error }, { status } );
	}
};

// ─── PUT Handler: Modify a material ───────────────────────────────────────────
export const PUT: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing material ID' }, { status : 400 } );
		}

		const body     = await request.json();
		const response = await connectRequest< Material >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.BASE }/${ id }`,
			method     : METHOD.PATCH,
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
		const { status, error } = formatServerError( e, 'Material' );
		return json( { error }, { status } );
	}
};

// ─── DELETE Handler: Remove a material ────────────────────────────────────────
export const DELETE: RequestHandler = async ( { url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing material ID' }, { status : 400 } );
		}

		const response = await connectRequest< any >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.BASE }/${ id }`,
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
		const { status, error } = formatServerError( e, 'Material' );
		return json( { error }, { status } );
	}
};
