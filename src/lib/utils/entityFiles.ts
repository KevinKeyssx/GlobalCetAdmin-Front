import type {
	GlobalSearchProduct,
	GlobalSearchKit,
	GlobalSearchMobileLab,
	FileAttachment,
}               from '$lib/types/search';
import { ENV }  from '$lib/utils/env.server';


// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface MapFileParams {
	file      : FileAttachment;
	entityId  : string;
	subfolder : 'products' | 'kits' | 'labs';
}


export interface EntityWithFiles {
	id    : string;
	name  : string;
	files : FileAttachment[];
}


export interface MapEntityParams {
	entity         : EntityWithFiles;
	subfolder      : 'products' | 'kits' | 'labs';
	placeholderUrl : string;
}


export const getMediaTypeFolder = ( type?: string ): string => {
    const normalized = type?.toUpperCase().trim() ?? 'IMAGE';

    return {
        VIDEO     : 'video',
        DOCUMENT  : 'raw',
        IMAGE     : 'image',
    }[normalized] || 'image';
};


export function mapAttachment({ file, entityId, subfolder }: MapFileParams ): FileAttachment {
	if ( file.url.startsWith( 'http://' ) || file.url.startsWith( 'https://' )) {
		return file;
	}

	const typeFolder = getMediaTypeFolder( file.attachmentType );
	const baseUrl    = ENV.FILE_MANAGER.URL.replace( '***', typeFolder );
	const fileName   = file.url.split( '/' ).pop() || '';

	return {
		id             : file.id,
		url            : `${ baseUrl }${ subfolder }/${ entityId }/${ fileName }`,
		alt            : file.alt,
		isMain         : file.isMain,
		order          : file.order,
		attachmentType : file.attachmentType,
	};
}


export function mapEntityFiles<T extends EntityWithFiles>({
	entity,
	subfolder,
	placeholderUrl,
}: MapEntityParams ): T {
	const filesMapped = entity.files.map(( f ) =>
		mapAttachment({ file : f, entityId : entity.id, subfolder })
	);

	if ( filesMapped.length === 0 ) {
		filesMapped.push( {
			id             : 'placeholder',
			url            : placeholderUrl,
			alt            : entity.name,
			isMain         : true,
			order          : 0,
			attachmentType : 'IMAGE',
		});
	}

	return {
		...entity,
		files : filesMapped,
	} as unknown as T;
}

// ─── Shared Entity List Mappers ───────────────────────────────────────────────
export function mapProducts( products: GlobalSearchProduct[] ): GlobalSearchProduct[] {
	return products.map(( p ) =>
		mapEntityFiles<GlobalSearchProduct>({
			entity         : p,
			subfolder      : 'products',
			placeholderUrl : 'https://res.cloudinary.com/dbgzsikcs/image/upload/v1779666295/globalcet/13665029439565267830.jpg',
		})
	);
}


export function mapKits( kits: GlobalSearchKit[] ): GlobalSearchKit[] {
	return kits.map(( k ) =>
		mapEntityFiles<GlobalSearchKit>({
			entity         : k,
			subfolder      : 'kits',
			placeholderUrl : 'https://res.cloudinary.com/dbgzsikcs/image/upload/v1779666295/globalcet/13665029439565267830.jpg',
		})
	);
}


export function mapLabs( labs: GlobalSearchMobileLab[] ): GlobalSearchMobileLab[] {
	return labs.map(( l ) =>
		mapEntityFiles<GlobalSearchMobileLab>({
			entity         : l,
			subfolder      : 'labs',
			placeholderUrl : 'https://res.cloudinary.com/dbgzsikcs/image/upload/v1779666295/globalcet/13665029439565267830.jpg',
		})
	);
}
