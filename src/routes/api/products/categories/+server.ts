import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { ENV }                          from '$lib/utils/env.server';
import type { Category, SubCategory }   from '$lib/types/category';
import { METHOD }                       from '$lib/services/http-codes';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';

// ─── POST Handler: Create a category or subcategory ───────────────────────────
export const POST: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const type     = url.searchParams.get( 'type' ) || 'category';
		const path     = type === 'subcategory' ? EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.SUBCATEGORIES : EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL;
		const body     = await request.json();
		const response = await connectRequest< Category | SubCategory >( {
			endpoint   : path,
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

// ─── PUT Handler: Modify a category or subcategory ────────────────────────────
export const PUT: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';
		if ( !id ) {
			return json( { error : 'Missing ID' }, { status : 400 } );
		}

		const type     = url.searchParams.get( 'type' ) || 'category';
		const path     = type === 'subcategory' ? EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.SUBCATEGORIES : EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL;
		const body     = await request.json();
		const response = await connectRequest< Category | SubCategory >( {
			endpoint   : `${ path }/${ id }`,
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

// ─── DELETE Handler: Remove a category or subcategory ─────────────────────────
export const DELETE: RequestHandler = async ( { url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';
		if ( !id ) {
			return json( { error : 'Missing ID' }, { status : 400 } );
		}

		const type     = url.searchParams.get( 'type' ) || 'category';
		const path     = type === 'subcategory' ? EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.SUBCATEGORIES : EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL;
		const response = await connectRequest< any >( {
			endpoint   : `${ path }/${ id }`,
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
