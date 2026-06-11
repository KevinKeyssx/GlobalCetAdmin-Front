// ─── Domain Types ─────────────────────────────────────────────────────────────

export type ProductCategory =
	| 'Material de Vidrio'
	| 'Kits de Laboratorio'
	| 'Sistemas Completos'
	| 'Reactivos'
	| 'Equipos de Medición';

export type ProductType = 'Producto' | 'Kit' | 'Laboratorio Móvil';

export interface ProductSpecs {
	material?      : string;
	grado?         : string;
	pureza?        : string;
	piezas?        : number;
	estuche?       : string;
	dimensiones?   : string;
	transporte?    : string;
	capacidad?     : string;
	precision?     : string;
	[key: string]  : string | number | undefined;
}

export interface Product {
	id         : string;
	name       : string;
	category   : ProductCategory;
	type       : ProductType;
	specs      : ProductSpecs;
	image      : string;
	badge?     : string;
}

// ─── Filter State ──────────────────────────────────────────────────────────────

export interface FilterState {
	search      : string;
	categories  : Set<ProductCategory>;
	types       : Set<ProductType>;
}

// ─── Initial Form Interfaces ───────────────────────────────────────────────────

export interface InitialFile {
	id     : string;
	url    : string;
	alt    : string;
	isMain : boolean;
	order  : number;
}

export interface ProductInitial {
	name           : string;
	sku            : string;
	description    : string;
	materialId     : string;
	subcategoryId  : string;
	active         : boolean;
	technicalSpecs : string;
	files?         : InitialFile[];
}

// ─── Admin View Interfaces ─────────────────────────────────────────────────────

export interface AdminProductFile {
	id     : string;
	url    : string;
	alt    : string;
	isMain : boolean;
}

export interface AdminProduct {
	id	                : string;
	sku	                : string;
	name	            : string;
	description         : string;
	active	            : boolean;
	files	            : AdminProductFile[];
    technical_specs?    : any;
	subcategory         : {
		id   : string;
		name : string;
	};
	material            : {
		id   : string;
		name : string;
		slug : string;
	};
}

export interface CategoryInfo {
	id            : string;
	name          : string;
	subCategories : Array<{ id : string; name : string }>;
}

