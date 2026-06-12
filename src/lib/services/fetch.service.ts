import { METHOD }  from './http-codes';
import { resolve } from '$app/paths';

import { PUBLIC_BACKEND_URL } from '$env/static/public';


type Connect = {
	endpoint    : string;
	method?     : METHOD;
	body?       : object | FormData;
	isInternal? : boolean;
	headers?    : Record<string, string>;
	fetch?      : typeof fetch;
}


export type ApiError = {
	message : string;
	code    : string;
	status? : number;
	data?   : unknown;
}


export const isApiError = ( error: any ): error is ApiError => 
	typeof error === 'object' && error !== null && 'message' in error && 'code' in error;


export default async function connectRequest<T>( {
	method = METHOD.GET,
	body,
	endpoint,
	headers,
	isInternal = true,
	fetch: customFetch = fetch,
}: Connect ): Promise<T | ApiError> {
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
			Accept         : 'application/json',
			...headers
		}
	});

	if ( !response.ok ) {
		const errorData = await response.json().catch( ( ) => ( {} ) );
		throw {
			message : errorData.message || 'Request failed',
			code    : `HTTP_${ response.status }`,
			status  : response.status,
			data    : errorData,
		} as ApiError;
	}

	return response.status === 204 ? ( true as T ) : ( await response.json() as T );
}
