import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest, { isApiError }   from '$lib/services/fetch.service';
import { ENV }                          from '$lib/utils/env.server';
import { METHOD }                       from '$lib/services/http-codes';
import { EXTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';

export const PUT: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id = url.searchParams.get( 'id' ) || '';

		if ( !id ) {
			return json( { error : 'Missing product ID' }, { status : 400 } );
		}

		const formData      = await request.formData();
		const imagesInfoStr = formData.get( 'imagesInfo' ) as string || '[]';
		const clientImages  = JSON.parse( imagesInfoStr );
		const filesToUpload = formData.getAll( 'files' ) as File[];

		// 1. Upload new files if any
		let uploadedFilesResponse : any[] = [];

		if ( filesToUpload.length > 0 ) {
			const newImagesInfo  = clientImages.filter( ( img : any ) => !img.id || img.id.startsWith( 'temp-' ) );
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
				endpoint	: `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }/images`,
				method		: METHOD.POST,
				isInternal	: false,
				body		: uploadFormData,
				headers		: {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch		: fetch,
			} );

			if ( isApiError( uploadRes ) ) {
				return json( { error : uploadRes.message }, { status : uploadRes.status || 500 } );
			}

			uploadedFilesResponse = uploadRes.files || [];
		}

		// 2. Update info for all remaining/new images
		const existingImagesInfo = clientImages.filter( ( img : any ) => img.id && !img.id.startsWith( 'temp-' ) );
		const newImagesInfo      = clientImages.filter( ( img : any ) => !img.id || img.id.startsWith( 'temp-' ) );
		const finalImagesInfo    = [ ...existingImagesInfo ];

		if ( uploadedFilesResponse.length > 0 ) {
			const newFilesFromResponse = uploadedFilesResponse.filter( ( f : any ) => !existingImagesInfo.some( ( ext : any ) => ext.id === f.id ) );

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

		if ( finalImagesInfo.length > 0 ) {
			const updateInfoRes = await connectRequest< any >( {
				endpoint	: `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }/images/info`,
				method		: METHOD.PATCH,
				isInternal	: false,
				body		: { imagesInfo : finalImagesInfo },
				headers		: {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch		: fetch,
			} );

			if ( isApiError( updateInfoRes ) ) {
				return json( { error : updateInfoRes.message }, { status : updateInfoRes.status || 500 } );
			}
		}

		return json( { success : true } );
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};

export const DELETE: RequestHandler = async ( { request, url, fetch } ) => {
	try {
		const id     = url.searchParams.get( 'id' ) || '';
		const fileId = url.searchParams.get( 'fileId' ) || '';

		if ( !id ) {
			return json( { error : 'Missing product ID' }, { status : 400 } );
		}

		if ( fileId ) {
			// Single file deletion
			const response = await connectRequest< any >( {
				endpoint	: `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }/image/${ fileId }`,
				method		: METHOD.DELETE,
				isInternal	: false,
				headers		: {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch		: fetch,
			} );

			if ( isApiError( response ) ) {
				return json( { error : response.message }, { status : response.status || 500 } );
			}

			return json( response );
		} else {
			// Bulk file deletion (deleteProductFiles)
			const { fileIds } = await request.json();

			const response = await connectRequest< any >( {
				endpoint	: `${ EXTERNAL_ENDPOINTS.PRODUCTS.BASE }/${ id }/images/delete`,
				method		: METHOD.POST,
				isInternal	: false,
				body		: { fileIds },
				headers		: {
					'x-secret' : ENV.INTERNAL_SECRET_KEY,
				},
				fetch		: fetch,
			} );

			if ( isApiError( response ) ) {
				return json( { error : response.message }, { status : response.status || 500 } );
			}

			return json( response );
		}
	} catch ( e : any ) {
		return json( { error : e.message || 'Internal Server Error' }, { status : 500 } );
	}
};
