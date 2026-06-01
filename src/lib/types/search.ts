export interface FileAttachment {
	id             : string;
	url            : string;
	alt            : string | null;
	isMain         : boolean;
	order          : number;
	attachmentType : 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

export interface CategoryInfo {
	id   : string;
	name : string;
}

export interface SubcategoryInfo {
	id       : string;
	name     : string;
	category : CategoryInfo;
}

export interface MaterialInfo {
	id   : string;
	name : string;
	slug : string;
}

export interface GlobalSearchProduct {
	id          : string;
	sku         : string;
	name        : string;
	description : string;
	active      : boolean;
	createdAt   : string;
	updatedAt   : string;
	files       : FileAttachment[];
	subcategory : SubcategoryInfo;
	material    : MaterialInfo;
}

export interface ProductRelationInfo {
	id   : string;
	name : string;
	sku  : string;
}

export interface GlobalSearchKitProduct {
	quantity : number;
	product  : ProductRelationInfo;
}

export interface GlobalSearchKit {
	id          : string;
	sku         : string;
	name        : string;
	description : string;
	active      : boolean;
	createdAt   : string;
	updatedAt   : string;
	files       : FileAttachment[];
	category    : CategoryInfo;
	products    : GlobalSearchKitProduct[];
}

export interface KitRelationInfo {
	id   : string;
	name : string;
	sku  : string;
}

export interface GlobalSearchMobileLabKit {
	id       : string;
	quantity : number;
	kit      : KitRelationInfo;
}

export interface GlobalSearchMobileLab {
	id          : string;
	sku         : string;
	name        : string;
	description : string;
	dimensions  : string;
	active      : boolean;
	createdAt   : string;
	updatedAt   : string;
	files       : FileAttachment[];
	category    : CategoryInfo;
	kits        : GlobalSearchMobileLabKit[];
	products    : GlobalSearchKitProduct[];
}

export interface GlobalSearchMeta {
	totalProducts   : number;
	totalKits       : number;
	totalMobileLabs : number;
	isSuggestion    : boolean;
}

export interface GlobalSearchResponse {
	products   : GlobalSearchProduct[];
	kits       : GlobalSearchKit[];
	mobileLabs : GlobalSearchMobileLab[];
	meta       : GlobalSearchMeta;
}
