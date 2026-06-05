import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { ENV }                          from '$lib/utils/env.server';
import type { GlobalSearchMobileLab }   from '$lib/types/search';
import { METHOD }                       from '$lib/services/http-codes';

// ─── POST Handler: Create a new mobile lab ────────────────────────────────────
export const POST: RequestHandler = async ( { request, fetch } ) => {
	try {
		const clientData  = await request.formData();
		const backendData = new FormData();

		for ( const [ key, value ] of clientData.entries() ) {
			backendData.append( key, value );
		}

		const response = await connectRequest< GlobalSearchMobileLab >( {
			endpoint   : 'mobile-labs',
			method     : METHOD.POST,
			isInternal : false,
			body       : backendData,
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

// ─── PUT Handler: Modify an existing mobile lab ───────────────────────────────
export const PUT: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing lab ID' }, { status : 400 } );
		}

		const clientData        = await request.formData();
		const filesInfoStr      = clientData.get( 'filesInfo' ) as string || '[]';
		const clientFiles       = JSON.parse( filesInfoStr );
		const filesToUpload     = clientData.getAll( 'files' ) as File[];
		const productsStr       = clientData.get( 'products' ) as string || '[]';
		const clientProducts    = JSON.parse( productsStr );
		const kitsStr           = clientData.get( 'kits' ) as string || '[]';
		const clientKits        = JSON.parse( kitsStr );

		// 1. Fetch existing lab with files to compare
		const existingLab = await connectRequest< GlobalSearchMobileLab >( {
			endpoint   : `mobile-labs/${ id }?includeFiles=true&includeProducts=true&includeKits=true`,
			isInternal : false,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( existingLab ) ) {
			return json( { error : existingLab.message }, { status : existingLab.status || 500 } );
		}

		const existingFiles    = existingLab.files || [];
		const existingFileIds  = new Set( existingFiles.map( ( f : any ) => f.id ) );

		// 2. Determine deleted files
		const clientFileIds  = new Set( clientFiles.map( ( f : any ) => f.id ) );
		const deletedFileIds = existingFiles
			.filter( ( f : any ) => !clientFileIds.has( f.id ) )
			.map( ( f : any ) => f.id );

		if ( deletedFileIds.length > 0 ) {
			const deleteRes = await connectRequest< any >( {
				endpoint   : `mobile-labs/${ id }/files/delete`,
				method     : METHOD.POST,
				isInternal : false,
				body       : { files : deletedFileIds },
				headers    : {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch      : fetch,
			} );

			if ( isApiError( deleteRes ) ) {
				return json( { error : deleteRes.message }, { status : deleteRes.status || 500 } );
			}
		}

		// 3. Handle new file uploads
		const finalFilesInfo = clientFiles.filter( ( f : any ) => existingFileIds.has( f.id ) );

		if ( filesToUpload.length > 0 ) {
			const newFilesInfo  = clientFiles.filter( ( f : any ) => !existingFileIds.has( f.id ) );
			const uploadFormData = new FormData();

			filesToUpload.forEach( ( file ) => {
				uploadFormData.append( 'files', file );
			} );

			uploadFormData.append( 'filesInfo', JSON.stringify( newFilesInfo.map( ( f : any ) => ( {
				alt    : f.alt,
				isMain : f.isMain,
				order  : f.order,
			} ) ) ) );

			const uploadRes = await connectRequest< any >( {
				endpoint   : `mobile-labs/${ id }/files`,
				method     : METHOD.POST,
				isInternal : false,
				body       : uploadFormData,
				headers    : {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch      : fetch,
			} );

			if ( isApiError( uploadRes ) ) {
				return json( { error : uploadRes.message }, { status : uploadRes.status || 500 } );
			}

			const updatedFiles         = uploadRes.files || [];
			const newFilesFromResponse = updatedFiles.filter( ( f : any ) => !existingFileIds.has( f.id ) );

			// Map client temp IDs to server IDs
			newFilesInfo.forEach( ( f : any, index : number ) => {
				const serverFile = newFilesFromResponse[ index ];
				if ( serverFile ) {
					finalFilesInfo.push( {
						id     : serverFile.id,
						alt    : f.alt,
						isMain : f.isMain,
						order  : f.order,
					} );
				}
			} );
		}

		// 4. Update info for all remaining/new files
		if ( finalFilesInfo.length > 0 ) {
			const updateInfoRes = await connectRequest< any >( {
				endpoint   : `mobile-labs/${ id }/files/info`,
				method     : METHOD.PATCH,
				isInternal : false,
				body       : { filesInfo : finalFilesInfo },
				headers    : {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch      : fetch,
			} );

			if ( isApiError( updateInfoRes ) ) {
				return json( { error : updateInfoRes.message }, { status : updateInfoRes.status || 500 } );
			}
		}

		// 5. Update products relations
		if ( clientProducts.length > 0 ) {
			const updateProductsRes = await connectRequest< any >( {
				endpoint   : `mobile-labs/${ id }/products`,
				method     : METHOD.POST,
				isInternal : false,
				body       : { products : clientProducts },
				headers    : {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch      : fetch,
			} );

			if ( isApiError( updateProductsRes ) ) {
				return json( { error : updateProductsRes.message }, { status : updateProductsRes.status || 500 } );
			}
		}

		// 6. Update kits relations
		if ( clientKits.length > 0 ) {
			const updateKitsRes = await connectRequest< any >( {
				endpoint   : `mobile-labs/${ id }/kits`,
				method     : METHOD.POST,
				isInternal : false,
				body       : { kits : clientKits },
				headers    : {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch      : fetch,
			} );

			if ( isApiError( updateKitsRes ) ) {
				return json( { error : updateKitsRes.message }, { status : updateKitsRes.status || 500 } );
			}
		}

		// 7. Update basic lab data
		const basicData : any = {};
		const fieldsToSync    = [ 'name', 'sku', 'description', 'dimensions', 'categoryId', 'active' ];

		for ( const key of fieldsToSync ) {
			if ( clientData.has( key ) ) {
				const val = clientData.get( key );
				if ( key === 'active' ) {
					basicData[ key ] = val === 'true';
				} else {
					basicData[ key ] = val;
				}
			}
		}

		const updateLabRes = await connectRequest< GlobalSearchMobileLab >( {
			endpoint   : `mobile-labs/${ id }`,
			method     : METHOD.PATCH,
			isInternal : false,
			body       : basicData,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( updateLabRes ) ) {
			return json( { error : updateLabRes.message }, { status : updateLabRes.status || 500 } );
		}

		return json( updateLabRes );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};

// ─── DELETE Handler: Remove a mobile lab ──────────────────────────────────────
export const DELETE: RequestHandler = async ( { url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing lab ID' }, { status : 400 } );
		}

		const response = await connectRequest< any >( {
			endpoint   : `mobile-labs/${ id }`,
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
