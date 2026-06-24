export interface CurrentFormState {
	name            : string;
	sku             : string;
	description     : string;
	active          : boolean;
	categoryId?     : string;
	subcategoryId?  : string;
	materialId?     : string;
	technicalSpecs? : string;
	currentPrice    : number | null;
	currentStock    : number | null;
	minStock        : number | null;
	maxStock        : number | null;
	files           : Array<{ id : string; file? : File; alt : string; isMain : boolean; order : number }>;
	products?       : Array<{ productId : string; quantity : number }>;
	kits?           : Array<{ kitId : string; quantity : number }>;
	dimensions?     : string;
}

export interface InitialFormState {
	name            : string;
	sku             : string;
	description     : string;
	active          : boolean;
	categoryId?     : string;
	subcategoryId?  : string;
	materialId?     : string;
	technicalSpecs? : string;
	currentPrice?   : number | null;
	currentStock?   : number | null;
	minStock?       : number | null;
	maxStock?       : number | null;
	files?          : Array<{ id : string; url : string; alt : string; isMain : boolean; order : number }>;
	products?       : Array<{ productId : string; quantity : number }>;
	kits?           : Array<{ kitId : string; quantity : number }>;
	dimensions?     : string;
}

export function isFormDirty(
	current   : CurrentFormState,
	initial   : InitialFormState | null | undefined,
	isEditing : boolean
) : boolean {
	if ( !isEditing ) {
		const hasFiles    = current.files.length > 0;
		const hasProducts = current.products && current.products.length > 0;
		const hasKits     = current.kits && current.kits.length > 0;

		return current.name !== ''
			|| current.sku !== ''
			|| current.description !== ''
			|| ( current.categoryId !== undefined && current.categoryId !== '' )
			|| ( current.subcategoryId !== undefined && current.subcategoryId !== '' )
			|| ( current.materialId !== undefined && current.materialId !== '' )
			|| current.active !== true
			|| ( current.technicalSpecs !== undefined && current.technicalSpecs !== '{}' )
			|| current.currentPrice !== null
			|| current.currentStock !== null
			|| current.minStock !== null
			|| current.maxStock !== null
			|| ( current.dimensions !== undefined && current.dimensions !== '0m x 0m x 0m' )
			|| !!hasFiles
			|| !!hasProducts
			|| !!hasKits;
	}

	if ( !initial ) {
		return false;
	}

	// 1. Compare basic fields
	if (
		current.name !== initial.name ||
		current.sku !== initial.sku ||
		current.description !== initial.description ||
		current.active !== ( initial.active ?? true )
	) {
		return true;
	}

	// 2. Compare optional classification fields
	if ( current.categoryId !== undefined && current.categoryId !== ( initial.categoryId || '' ) ) {
		return true;
	}
	if ( current.subcategoryId !== undefined && current.subcategoryId !== ( initial.subcategoryId || '' ) ) {
		return true;
	}
	if ( current.materialId !== undefined && current.materialId !== ( initial.materialId || '' ) ) {
		return true;
	}

	// 3. Compare technical specs
	if ( current.technicalSpecs !== undefined && current.technicalSpecs !== ( initial.technicalSpecs || '{}' ) ) {
		return true;
	}

	// 4. Compare dimensions
	if ( current.dimensions !== undefined && current.dimensions !== ( initial.dimensions || '0m x 0m x 0m' ) ) {
		return true;
	}

	// 5. Compare prices & stocks
	const initialPrice    = initial.currentPrice    ?? null;
	const initialStock    = initial.currentStock    ?? null;
	const initialMinStock = initial.minStock        ?? null;
	const initialMaxStock = initial.maxStock        ?? null;

	if (
		current.currentPrice !== initialPrice
        || current.currentStock !== initialStock
        || current.minStock !== initialMinStock
        || current.maxStock !== initialMaxStock
	) {
		return true;
	}

	// 6. Compare files
	const initialFilesCount = initial.files?.length || 0;
	const currentFilesCount = current.files.length;

	if ( initialFilesCount !== currentFilesCount ) {
		return true;
	}

	if ( initial.files ) {
		const filesChanged = current.files.some( ( uf ) => {
			if ( uf.file ) {
				return true;
			}

            const original = initial.files?.find( ( f ) => f.id === uf.id );

            if ( !original ) {
				return true;
			}

            return original.alt !== uf.alt
				|| original.isMain !== uf.isMain
				|| original.order !== uf.order;
		});
		if ( filesChanged ) {
			return true;
		}
	}

	// 7. Compare products relations
	if ( current.products && initial.products ) {
		const initialProductsCount = initial.products.length;
		const currentProductsCount = current.products.length;

		if ( initialProductsCount !== currentProductsCount ) {
			return true;
		}

        const productsChanged = current.products.some( ( cp ) => {
			const original = initial.products?.find( ( p ) => p.productId === cp.productId );

            if ( !original ) {
				return true;
			}

            return original.quantity !== cp.quantity;
		});

        if ( productsChanged ) {
			return true;
		}
	} else if (( current.products && current.products.length > 0 ) || ( initial.products && initial.products.length > 0 )) {
		return true;
	}

	// 8. Compare kits relations
	if ( current.kits && initial.kits ) {
		const initialKitsCount = initial.kits.length;
		const currentKitsCount = current.kits.length;

		if ( initialKitsCount !== currentKitsCount ) {
			return true;
		}

        const kitsChanged = current.kits.some( ( ck ) => {
			const original = initial.kits?.find( ( k ) => k.kitId === ck.kitId );

            if ( !original ) {
				return true;
			}

            return original.quantity !== ck.quantity;
		});

        if ( kitsChanged ) {
			return true;
		}
	} else if (( current.kits && current.kits.length > 0 ) || ( initial.kits && initial.kits.length > 0 )) {
		return true;
	}

	return false;
}


export function getErrorMessage(
    error : any,
    defaultMsg : string = 'Ocurrió un error inesperado.'
) : string {
	if ( !error ) {
		return defaultMsg;
	}

	const msg = error.message;

	if ( Array.isArray( msg ) ) {
		return msg.join( '. ' );
	}

	if ( typeof msg === 'object' && msg !== null ) {
		try {
			return JSON.stringify( msg );
		} catch ( _ ) {
			return defaultMsg;
		}
	}

	if ( typeof msg === 'string' && msg.trim() ) {
		return msg;
	}

	if ( error.error ) {
		if ( Array.isArray( error.error ) ) {
			return error.error.join( '. ' );
		}

        if ( typeof error.error === 'string' && error.error.trim() ) {
			return error.error;
		}
	}

	return defaultMsg;
}
