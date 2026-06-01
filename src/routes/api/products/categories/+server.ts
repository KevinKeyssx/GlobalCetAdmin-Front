import { json, type RequestHandler } from '@sveltejs/kit';
import { ENV }                       from '$lib/utils/env.server';

// ─── POST Handler: Create a category or subcategory ───────────────────────────
export const POST: RequestHandler = async ( { request, url } ) => {
	try {
		const type     = url.searchParams.get( 'type' ) || 'category';
		const path     = type === 'subcategory' ? 'subcategories' : 'categories';
		const body     = await request.json();
		const response = await fetch( `${ ENV.BACKEND_URL }/${ path }`, {
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

// ─── PUT Handler: Modify a category or subcategory ────────────────────────────
export const PUT: RequestHandler = async ( { request, url } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';
		if ( !id ) {
			return json( { error : 'Missing ID' }, { status : 400 } );
		}

		const type     = url.searchParams.get( 'type' ) || 'category';
		const path     = type === 'subcategory' ? 'subcategories' : 'categories';
		const body     = await request.json();
		const response = await fetch( `${ ENV.BACKEND_URL }/${ path }/${ id }`, {
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

// ─── DELETE Handler: Remove a category or subcategory ─────────────────────────
export const DELETE: RequestHandler = async ( { url } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';
		if ( !id ) {
			return json( { error : 'Missing ID' }, { status : 400 } );
		}

		const type     = url.searchParams.get( 'type' ) || 'category';
		const path     = type === 'subcategory' ? 'subcategories' : 'categories';
		const response = await fetch( `${ ENV.BACKEND_URL }/${ path }/${ id }`, {
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
