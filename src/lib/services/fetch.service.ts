import { METHOD }  from './http-codes';
import { resolve } from '$app/paths';

import { PUBLIC_BACKEND_URL } from '$env/static/public';


type Connect = {
	endpoint     : string;
	method?      : METHOD;
	body?        : object | FormData;
	isInternal?  : boolean;
	headers?     : Record< string, string >;
	fetch?       : typeof fetch;
	responseType? : 'json' | 'blob';
}


export type ApiError = {
	message : string;
	code    : string;
	status? : number;
	data?   : unknown;
}


export const isApiError = ( error : any ) : error is ApiError => 
	typeof error === 'object' && error !== null && 'message' in error && 'code' in error;


export default async function connectRequest< T >( {
	method = METHOD.GET,
	body,
	endpoint,
	headers,
	isInternal = true,
	fetch : customFetch = fetch,
	responseType,
} : Connect ) : Promise< T | ApiError > {
	const finalURL = isInternal
		? resolve( `/api/${ endpoint.replace( /^\/+/, '' ) }` as any )
		: `${ PUBLIC_BACKEND_URL.replace( /\/+$/, '' ) }/${ endpoint.replace( /^\/+/, '' ) }`;
	const isFormData    = body instanceof FormData;

	const response = await customFetch( finalURL, {
		method,
		body    : isFormData ? body : ( body ? JSON.stringify( body ) : undefined ),
		cache   : 'no-cache',
		headers : {
			...( isFormData ? {} : { 'Content-Type' : 'application/json' } ),
			Accept         : responseType === 'blob' ? '*/*' : 'application/json',
			...headers
		}
	} );

	if ( !response.ok ) {
		const errorData = await response.json().catch( ( ) => ( {} ) );
		throw {
			message	: errorData.message || errorData.error || 'Request failed',
			code	: `HTTP_${ response.status }`,
			status	: response.status,
			data	: errorData,
		} as ApiError;
	}

	if ( responseType === 'blob' ) {
		const blob = await response.blob();
		const contentDisposition = response.headers.get( 'content-disposition' );
		return { blob, contentDisposition } as unknown as T;
	}

	return response.status === 204 ? ( true as T ) : ( await response.json() as T );
}

export function formatServerError( e : any, service? : 'Producto' | 'Mobile Lab' | 'Kits' | 'Categoría' | 'Subcategoría' | 'Material' ) : { status : number; error : string } {
	let message = e.message || 'Internal Server Error';

	if ( ( message === 'Request failed' || message === 'Unknown error' ) && e.data ) {
		message = e.data.message || e.data.error || message;
	}

	if ( typeof message === 'string' && message.toLowerCase().includes( 'already exists' ) ) {
		const msgLower = message.toLowerCase();

		if ( msgLower.includes( 'subcategory' ) || msgLower.includes( 'sub_category' ) ) {
			message = 'El nombre de la subcategoría ya existe.';
		} else if ( msgLower.includes( 'category' ) ) {
			message = 'El nombre de la categoría ya existe.';
		} else if ( msgLower.includes( 'product' ) ) {
			message = 'El nombre del producto ya existe.';
		} else if ( msgLower.includes( 'mobile' ) || msgLower.includes( 'lab' ) ) {
			message = 'El nombre del laboratorio móvil ya existe.';
		} else if ( msgLower.includes( 'kit' ) ) {
			message = 'El nombre del kit ya existe.';
		} else if ( msgLower.includes( 'material' ) ) {
			message = 'El nombre del material ya existe.';
		} else if ( service ) {
			if ( service === 'Producto' ) {
				message = 'El nombre del producto ya existe.';
			} else if ( service === 'Mobile Lab' ) {
				message = 'El nombre del laboratorio móvil ya existe.';
			} else if ( service === 'Kits' ) {
				message = 'El nombre del kit ya existe.';
			} else if ( service === 'Categoría' ) {
				message = 'El nombre de la categoría ya existe.';
			} else if ( service === 'Subcategoría' ) {
				message = 'El nombre de la subcategoría ya existe.';
			} else if ( service === 'Material' ) {
				message = 'El nombre del material ya existe.';
			}
		}
	}

	return {
		status	: e.status || 500,
		error	: message,
	};
}
