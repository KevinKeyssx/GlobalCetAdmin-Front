import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError, formatServerError } from '$lib/services/fetch.service';
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
			if ( [ 'currentPrice', 'currentStock', 'minStock', 'maxStock' ].includes( key ) && ( value === '' || value === null ) ) {
				continue;
			}
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
		const { status, error } = formatServerError( e, 'Producto' );
		return json( { error }, { status } );
	}
};

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

		// 1. Update basic product data
		const basicData : any = {};
		const fieldsToSync    = [
			'name', 'sku', 'description', 'materialId', 'subcategoryId', 'active', 'technical_specs',
			'currentPrice', 'currentStock', 'minStock', 'maxStock'
		];

		for ( const key of fieldsToSync ) {
			if ( clientData.has( key ) ) {
				const val = clientData.get( key );
				if ( key === 'active' ) {
					basicData[ key ] = val === 'true';
				} else if ( key === 'technical_specs' ) {
					basicData[ key ] = JSON.parse( val as string || '{}' );
				} else if ( [ 'currentPrice', 'currentStock', 'minStock', 'maxStock' ].includes( key ) ) {
					const numVal = val !== '' && val !== null ? Number( val ) : null;
					if ( numVal !== null && !isNaN( numVal ) ) {
						basicData[ key ] = numVal;
					}
				} else {
					basicData[ key ] = val;
				}
			}
		}

		basicData[ 'includeFiles' ] = true;

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

		let latestProduct : GlobalSearchProduct = updateProductRes;

		const existingImages   = updateProductRes.files || [];
		const existingImageIds = new Set( existingImages.map( ( img : any ) => img.id ) );
		const finalImagesInfo  = clientImages.filter( ( img : any ) => existingImageIds.has( img.id ) );

		// 2. Upload new files if any
		if ( filesToUpload.length > 0 ) {
			const newImagesInfo  = clientImages.filter( ( img : any ) => !existingImageIds.has( img.id ) );
			const uploadFormData = new FormData();

			filesToUpload.forEach( ( file ) => {
				uploadFormData.append( 'files', file );
			} );

			uploadFormData.append( 'imagesInfo', JSON.stringify( newImagesInfo.map( ( img : any ) => ( {
				name           : img.name,
				alt            : img.alt,
				isMain         : img.isMain,
				order          : img.order,
				attachmentType : img.attachmentType,
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

			latestProduct = uploadRes;

			const updatedFiles         = uploadRes.files || [];
			const newFilesFromResponse = updatedFiles.filter( ( f : any ) => !existingImageIds.has( f.id ) );

			newImagesInfo.forEach( ( img : any, index : number ) => {
				const serverFile = newFilesFromResponse.find( ( sf : any ) => {
					if ( !img.name ) return false;
					const decodedUrl = decodeURIComponent( sf.url.toLowerCase() );
					const clientNameLower = img.name.toLowerCase();
					const clientBase = clientNameLower.substring( 0, clientNameLower.lastIndexOf( '.' ) ) || clientNameLower;
					const serverBase = decodedUrl.substring( 0, decodedUrl.lastIndexOf( '.' ) ) || decodedUrl;
					return serverBase.includes( clientBase ) || clientBase.includes( serverBase );
				} ) || newFilesFromResponse[ index ];

				if ( serverFile ) {
					finalImagesInfo.push( {
						id             : serverFile.id,
						alt            : img.alt,
						isMain         : img.isMain,
						order          : img.order,
						attachmentType : img.attachmentType,
					} );
				}
			} );
		}

		// 3. Update metadata info for all remaining/new images
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

			latestProduct = updateInfoRes;
		}

		return json( latestProduct );
	} catch ( e : any ) {
		const { status, error } = formatServerError( e, 'Producto' );
		return json( { error }, { status } );
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
		const { status, error } = formatServerError( e, 'Producto' );
		return json( { error }, { status } );
	}
};
