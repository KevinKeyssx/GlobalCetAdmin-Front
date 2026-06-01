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
