/**
 * Utility to manage localStorage safely with SvelteKit SSR support.
 */

export function getStorageItem< T >( key : string, defaultValue : T ) : T {
	if ( typeof window === 'undefined' ) {
		return defaultValue;
	}

	try {
		const item = localStorage.getItem( key );
		return item ? ( JSON.parse( item ) as T ) : defaultValue;
	} catch ( error ) {
		console.error( `Error getting item from localStorage with key: ${ key }`, error );
		return defaultValue;
	}
}

export function setStorageItem< T >( key : string, value : T ) : void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	try {
		localStorage.setItem( key, JSON.stringify( value ) );
	} catch ( error ) {
		console.error( `Error setting item in localStorage with key: ${ key }`, error );
	}
}

export function removeStorageItem( key : string ) : void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	try {
		localStorage.removeItem( key );
	} catch ( error ) {
		console.error( `Error removing item from localStorage with key: ${ key }`, error );
	}
}
