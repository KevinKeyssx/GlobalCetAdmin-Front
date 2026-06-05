import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { ENV }                          from '$lib/utils/env.server';
import type { GlobalSearchProduct }     from '$lib/types/search';
import { METHOD }                       from '$lib/services/http-codes';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';

// ─── POST Handler: Create a new product ───────────────────────────────────────
export const POST: RequestHandler = async ( { request, fetch } ) => {
	try {
		const clientData  = await request.formData();
		const backendData = new FormData();

		for ( const [ key, value ] of clientData.entries() ) {
			backendData.append( key, value );
		}

		const response = await connectRequest< GlobalSearchProduct >( {
			endpoint   : EXTERNAL_ENDPOINTS.PRODUCTS.BASE,
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

// ─── PUT Handler: Modify an existing product ──────────────────────────────────
export const PUT: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing product ID' }, { status : 400 } );
		}

		const clientData    = await request.formData();
		const imagesInfoStr = clientData.get( 'imagesInfo' ) as string || '[]';
		const clientImages  = JSON.parse( imagesInfoStr );
		const filesToUpload = clientData.getAll( 'files' ) as File[];

		// 1. Fetch existing product with images to compare
		const existingProduct = await connectRequest< GlobalSearchProduct >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }?includeImages=true`,
			isInternal : false,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( existingProduct ) ) {
			return json( { error : existingProduct.message }, { status : existingProduct.status || 500 } );
		}

		const existingImages   = existingProduct.files || [];
		const existingImageIds = new Set( existingImages.map( ( img : any ) => img.id ) );

		// 2. Determine deleted images
		const clientImageIds  = new Set( clientImages.map( ( img : any ) => img.id ) );
		const deletedImageIds = existingImages
			.filter( ( img : any ) => !clientImageIds.has( img.id ) )
			.map( ( img : any ) => img.id );

		if ( deletedImageIds.length > 0 ) {
			const deleteRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }/images/delete`,
				method     : METHOD.POST,
				isInternal : false,
				body       : { imageIds : deletedImageIds },
				headers    : {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch      : fetch,
			} );

			if ( isApiError( deleteRes ) ) {
				return json( { error : deleteRes.message }, { status : deleteRes.status || 500 } );
			}
		}

		// 3. Handle new image uploads
		const finalImagesInfo = clientImages.filter( ( img : any ) => existingImageIds.has( img.id ) );

		if ( filesToUpload.length > 0 ) {
			const newImagesInfo  = clientImages.filter( ( img : any ) => !existingImageIds.has( img.id ) );
			const uploadFormData = new FormData();

			filesToUpload.forEach( ( file ) => {
				uploadFormData.append( 'files', file );
			} );

			uploadFormData.append( 'imagesInfo', JSON.stringify( newImagesInfo.map( ( img : any ) => ( {
				alt    : img.alt,
				isMain : img.isMain,
				order  : img.order,
			} ) ) ) );

			const uploadRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }/images`,
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
			const newFilesFromResponse = updatedFiles.filter( ( f : any ) => !existingImageIds.has( f.id ) );

			// Map client temp IDs to server IDs
			newImagesInfo.forEach( ( img : any, index : number ) => {
				const serverFile = newFilesFromResponse[ index ];
				if ( serverFile ) {
					finalImagesInfo.push( {
						id     : serverFile.id,
						alt    : img.alt,
						isMain : img.isMain,
						order  : img.order,
					} );
				}
			} );
		}

		// 4. Update info for all remaining/new images
		if ( finalImagesInfo.length > 0 ) {
			const updateInfoRes = await connectRequest< any >( {
				endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }/images/info`,
				method     : METHOD.PATCH,
				isInternal : false,
				body       : { imagesInfo : finalImagesInfo },
				headers    : {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch      : fetch,
			} );

			if ( isApiError( updateInfoRes ) ) {
				return json( { error : updateInfoRes.message }, { status : updateInfoRes.status || 500 } );
			}
		}

		// 5. Update basic product data
		const basicData : any = {};
		const fieldsToSync    = [ 'name', 'sku', 'description', 'materialId', 'subcategoryId', 'active', 'technical_specs' ];

		for ( const key of fieldsToSync ) {
			if ( clientData.has( key ) ) {
				const val = clientData.get( key );
				if ( key === 'active' ) {
					basicData[ key ] = val === 'true';
				} else if ( key === 'technical_specs' ) {
					basicData[ key ] = JSON.parse( val as string || '{}' );
				} else {
					basicData[ key ] = val;
				}
			}
		}

		const updateProductRes = await connectRequest< GlobalSearchProduct >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }`,
			method     : METHOD.PATCH,
			isInternal : false,
			body       : basicData,
			headers    : {
				'x-secret' : ENV.INTERNAL_SECRET_KEY,
			},
			fetch      : fetch,
		} );

		if ( isApiError( updateProductRes ) ) {
			return json( { error : updateProductRes.message }, { status : updateProductRes.status || 500 } );
		}

		return json( updateProductRes );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};

// ─── DELETE Handler: Remove a product ─────────────────────────────────────────
export const DELETE: RequestHandler = async ( { url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing product ID' }, { status : 400 } );
		}

		const response = await connectRequest< any >( {
			endpoint   : `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }`,
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
