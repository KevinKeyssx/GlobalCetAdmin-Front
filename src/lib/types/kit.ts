import type { InitialFile } from './product';

export interface KitProduct {
	productId : string;
	quantity  : number;
	product?  : { id : string; name : string; sku : string };
}

export interface KitInitial {
	name         : string;
	sku          : string;
	description  : string;
	categoryId   : string;
	active       : boolean;
	products     : KitProduct[];
	files?       : InitialFile[];
	currentPrice?: number | null;
	currentStock?: number | null;
	minStock?    : number | null;
	maxStock?    : number | null;
}
