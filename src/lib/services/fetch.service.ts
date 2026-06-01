import { METHOD } from './http-codes';

import { PUBLIC_BACKEND_URL } from '$env/static/public';


type Connect = {
	endpoint    : string;
	method?     : METHOD;
	body?       : object;
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
	const baseUrl   = isInternal ? '/' : PUBLIC_BACKEND_URL;
	const path      = isInternal ? `api/${endpoint}` : endpoint;
	const cleanBase = baseUrl.replace( /\/+$/, '' );
	const cleanPath = path.replace( /^\/+/, '' );
	const finalURL  = isInternal ? `/${cleanPath}` : `${cleanBase}/${cleanPath}`;

	const response = await customFetch( finalURL, {
		method,
		body    : body ? JSON.stringify( body ) : undefined,
		cache   : 'no-cache',
		headers : {
			'Content-Type' : 'application/json',
			Accept         : 'application/json',
			...headers
		}
	} );

	if ( !response.ok ) {
		const errorData = await response.json().catch( () => ({}) );
		throw {
			message : errorData.message || 'Request failed',
			code    : `HTTP_${response.status}`,
			status  : response.status,
			data    : errorData,
		} as ApiError;
	}

	return response.status === 204 ? ( true as T ) : ( await response.json() as T );
}
