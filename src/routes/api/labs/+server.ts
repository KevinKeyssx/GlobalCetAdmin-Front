import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError, formatServerError }   from '$lib/services/fetch.service';
import { ENV }                          from '$lib/utils/env.server';
import type { GlobalSearchMobileLab }   from '$lib/types/search';
import { METHOD }                       from '$lib/services/http-codes';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';

// ─── POST Handler: Create a new mobile lab ────────────────────────────────────
export const POST: RequestHandler = async ( { request, fetch } ) => {
	try {
		const clientData  = await request.formData();
		const backendData = new FormData();

		for ( const [ key, value ] of clientData.entries() ) {
			backendData.append( key, value );
		}

		const response = await connectRequest< GlobalSearchMobileLab >( {
			endpoint   : EXTERNAL_ENDPOINTS.LABS.BASE,
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
		const { status, error } = formatServerError( e, 'Mobile Lab' );
		return json( { error }, { status } );
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

		// 1. Update basic lab data (PATCH) to get existing/latest data
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

		const existingLab = await connectRequest< GlobalSearchMobileLab >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }`,
			method     : METHOD.PATCH,
			isInternal : false,
			body       : basicData,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( existingLab ) ) {
			return json( { error : existingLab.message }, { status : existingLab.status || 500 } );
		}

		let latestLab : GlobalSearchMobileLab = existingLab;

		const existingFiles    = existingLab.files || [];
		const existingFileIds  = new Set( existingFiles.map( ( f : any ) => f.id ) );

		// 2. Determine deleted files
		const clientFileIds  = new Set( clientFiles.map( ( f : any ) => f.id ) );
		const deletedFileIds = existingFiles
			.filter( ( f : any ) => !clientFileIds.has( f.id ) )
			.map( ( f : any ) => f.id );

		if ( deletedFileIds.length > 0 ) {
			const deleteRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }/files/delete`,
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
				name           : f.name,
				alt            : f.alt,
				isMain         : f.isMain,
				order          : f.order,
				attachmentType : f.attachmentType,
			} ) ) ) );

			const uploadRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }/files`,
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

			latestLab = uploadRes;

			const updatedFiles         = uploadRes.files || [];
			const newFilesFromResponse = updatedFiles.filter( ( f : any ) => !existingFileIds.has( f.id ) );

			// Map client temp IDs to server IDs
			newFilesInfo.forEach( ( f : any, index : number ) => {
				const serverFile = newFilesFromResponse.find( ( sf : any ) => {
					if ( !f.name ) return false;
					const decodedUrl = decodeURIComponent( sf.url.toLowerCase() );
					const clientNameLower = f.name.toLowerCase();
					const clientBase = clientNameLower.substring( 0, clientNameLower.lastIndexOf( '.' ) ) || clientNameLower;
					const serverBase = decodedUrl.substring( 0, decodedUrl.lastIndexOf( '.' ) ) || decodedUrl;
					return serverBase.includes( clientBase ) || clientBase.includes( serverBase );
				} ) || newFilesFromResponse[ index ];

				if ( serverFile ) {
					finalFilesInfo.push( {
						id             : serverFile.id,
						alt            : f.alt,
						isMain         : f.isMain,
						order          : f.order,
						attachmentType : f.attachmentType,
					} );
				}
			} );
		}

		// 4. Update info for all remaining/new files
		if ( finalFilesInfo.length > 0 ) {
			const updateInfoRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }/files/info`,
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

			latestLab = updateInfoRes;
		}

		// 5. Update products relations
		if ( clientProducts.length > 0 ) {
			const updateProductsRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }/products`,
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

			latestLab = updateProductsRes;
		}

		// 6. Update kits relations
		if ( clientKits.length > 0 ) {
			const updateKitsRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }/kits`,
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

			latestLab = updateKitsRes;
		}

		return json( latestLab );
	} catch ( e : any ) {
		const { status, error } = formatServerError( e, 'Mobile Lab' );
		return json( { error }, { status } );
	}
};

// ─── DELETE Handler: Remove a mobile lab or a product/kit relation from it ───
export const DELETE: RequestHandler = async ( { url, fetch } ) => {
	try {
		const id        = url.searchParams.get( 'id' ) || '';
		const productId = url.searchParams.get( 'productId' ) || '';
		const kitId     = url.searchParams.get( 'kitId' ) || '';

		if ( !id ) {
			return json( { error : 'Missing lab ID' }, { status : 400 } );
		}

		if ( productId ) {
			const response = await connectRequest< any >( {
				endpoint	: `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }/products/${ productId }`,
				method		: METHOD.DELETE,
				isInternal	: false,
				headers		: {
					'x-secret'	: ENV.INTERNAL_SECRET_KEY,
				},
				fetch		: fetch,
			} );

			if ( isApiError( response ) ) {
				return json( { error : response.message }, { status : response.status || 500 } );
			}

			return json( response );
		}

		if ( kitId ) {
			const response = await connectRequest< any >( {
				endpoint	: `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }/kits/${ kitId }`,
				method		: METHOD.DELETE,
				isInternal	: false,
				headers		: {
					'x-secret'	: ENV.INTERNAL_SECRET_KEY,
				},
				fetch		: fetch,
			} );

			if ( isApiError( response ) ) {
				return json( { error : response.message }, { status : response.status || 500 } );
			}

			return json( response );
		}

		const response = await connectRequest< any >( {
			endpoint	: `${ EXTERNAL_ENDPOINTS.LABS.BASE }/${ id }`,
			method		: METHOD.DELETE,
			isInternal	: false,
			headers		: {
				'x-secret'	: ENV.INTERNAL_SECRET_KEY,
			},
			fetch		: fetch,
		} );

		if ( isApiError( response ) ) {
			return json( { error : response.message }, { status : response.status || 500 } );
		}

		return json( { success : true } );
	} catch ( e : any ) {
		const { status, error } = formatServerError( e, 'Mobile Lab' );
		return json( { error }, { status } );
	}
};

