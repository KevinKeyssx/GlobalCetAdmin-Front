import { json, type RequestHandler } from '@sveltejs/kit';
import { ENV }                       from '$lib/utils/env.server';

// ─── POST Handler: Create a lab category ──────────────────────────────────────
export const POST: RequestHandler = async ( { request } ) => {
	try {
		const body     = await request.json();
		const response = await fetch( `${ ENV.BACKEND_URL }/lab-categories`, {
			method  : 'POST',
			headers : {
				'Content-Type' : 'application/json',
				'x-secret'     : ENV.INTERNAL_SECRET_KEY,
			},
			body    : JSON.stringify( body ),
		} );

		if ( !response.ok ) {
			const err = await response.json().catch( ( ) => ( { message : 'Backend error' } ) );
			return json( { error : err.message || 'Request to backend failed' }, { status : response.status } );
		}

		const result = await response.json();
		return json( result, { status : 201 } );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};

// ─── PUT Handler: Modify a lab category ───────────────────────────────────────
export const PUT: RequestHandler = async ( { request, url } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing category ID' }, { status : 400 } );
		}

		const body     = await request.json();
		const response = await fetch( `${ ENV.BACKEND_URL }/lab-categories/${ id }`, {
			method  : 'PUT',
			headers : {
				'Content-Type' : 'application/json',
				'x-secret'     : ENV.INTERNAL_SECRET_KEY,
			},
			body    : JSON.stringify( body ),
		} );

		if ( !response.ok ) {
			const err = await response.json().catch( ( ) => ( { message : 'Backend error' } ) );
			return json( { error : err.message || 'Request to backend failed' }, { status : response.status } );
		}

		const result = await response.json();
		return json( result );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};

// ─── DELETE Handler: Remove a lab category ────────────────────────────────────
export const DELETE: RequestHandler = async ( { url } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing category ID' }, { status : 400 } );
		}

		const response = await fetch( `${ ENV.BACKEND_URL }/lab-categories/${ id }`, {
			method  : 'DELETE',
			headers : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
		} );

		if ( !response.ok ) {
			const err = await response.json().catch( ( ) => ( { message : 'Backend error' } ) );
			return json( { error : err.message || 'Request to backend failed' }, { status : response.status } );
		}

		return json( { success : true } );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};
