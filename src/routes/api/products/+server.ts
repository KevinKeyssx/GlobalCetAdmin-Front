import { json, type RequestHandler } from '@sveltejs/kit';
import { ENV }                       from '$lib/utils/env.server';

// ─── POST Handler: Create a new product ───────────────────────────────────────
export const POST: RequestHandler = async ( { request } ) => {
	try {
		const clientData  = await request.formData();
		const backendData = new FormData();

		for ( const [ key, value ] of clientData.entries() ) {
			backendData.append( key, value );
		}

		const response = await fetch( `${ ENV.BACKEND_URL }/products`, {
			method  : 'POST',
			headers : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			body    : backendData,
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

// ─── PUT Handler: Modify an existing product ──────────────────────────────────
export const PUT: RequestHandler = async ( { request, url } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing product ID' }, { status : 400 } );
		}

		const clientData  = await request.formData();
		const backendData = new FormData();

		for ( const [ key, value ] of clientData.entries() ) {
			backendData.append( key, value );
		}

		const response = await fetch( `${ ENV.BACKEND_URL }/products/${ id }`, {
			method  : 'PUT',
			headers : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			body    : backendData,
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

// ─── DELETE Handler: Remove a product ─────────────────────────────────────────
export const DELETE: RequestHandler = async ( { url } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing product ID' }, { status : 400 } );
		}

		const response = await fetch( `${ ENV.BACKEND_URL }/products/${ id }`, {
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
