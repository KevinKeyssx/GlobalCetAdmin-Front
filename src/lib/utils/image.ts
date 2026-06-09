import { PUBLIC_NOT_FOUND_IMAGE } from '$env/static/public';
import type { FileAttachment }    from '$lib/types/search';

export interface GetImageUrlsParams {
	files? : Array< FileAttachment >;
	image? : string | null;
}

export function getItemImages( item : GetImageUrlsParams | null | undefined ): Array< string > {
	if ( !item ) {
		return [ PUBLIC_NOT_FOUND_IMAGE ];
	}

	if ( item.files && item.files.length > 0 ) {
		const filtered = item.files.filter( ( f : FileAttachment ) => {
			const typeUpper = ( f.attachmentType || '' ).toUpperCase().trim();
			return !typeUpper.startsWith( 'DOCUMENT' );
		} );

		if ( filtered.length > 0 ) {
			return filtered.map( ( f : FileAttachment ) => {
				return f.url;
			} );
		}
	}

	if ( item.image ) {
		return [ item.image ];
	}

	return [ PUBLIC_NOT_FOUND_IMAGE ];
}
