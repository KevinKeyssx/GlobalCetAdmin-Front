import type { InitialFile } from './product';

export interface LabProduct {
	productId : string;
	quantity  : number;
	product?  : { id : string; name : string; sku : string };
}

export interface LabKit {
	kitId    : string;
	quantity : number;
	kit?     : { id : string; name : string; sku : string };
}

export interface LabInitial {
	name         : string;
	sku          : string;
	description  : string;
	dimensions   : string;
	categoryId   : string;
	active       : boolean;
	products     : LabProduct[];
	kits         : LabKit[];
	files?       : InitialFile[];
	currentPrice?: number | null;
	currentStock?: number | null;
	minStock?    : number | null;
	maxStock?    : number | null;
}
