export interface SubCategory {
	id         : string;
	name       : string;
	categoryId : string;
	active     : boolean;
	createdAt  : string;
	updatedAt  : string;
}

export interface Category {
	id            : string;
	name          : string;
	active        : boolean;
	createdAt     : string;
	updatedAt     : string;
	subCategories : SubCategory[];
}


export interface SubCategoryFilter {
	id   : string;
	name : string;
}

export interface CategoryFilter {
	id            : string;
	name          : string;
	subCategories : SubCategoryFilter[];
}

export interface KitCategory {
	id   : string;
	name : string;
}

export interface LabCategory {
	id   : string;
	name : string;
}
