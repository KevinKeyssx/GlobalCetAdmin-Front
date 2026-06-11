export const INTERNAL_ENDPOINTS = {
	PRODUCTS       : {
		FILTERS         : 'products/filters',
		TECHNICAL_SPECS : 'products/get-technical-specs',
		GET_ONE         : 'products/get-one',
		MATERIALS       : {
			GET_ALL : 'products/materials/get-all',
		},
		CATEGORIES     : {
			BASE    : 'products/categories',
			GET_ALL : 'products/categories/get-all',
		},
		SUBCATEGORIES  : {
			GET_ALL : 'products/sub-categories',
		},
	},
	KITS : {
		FILTERS    : 'kits/filters',
		GET_ONE    : 'kits/get-one',
		CATEGORIES : {
			BASE    : 'kits/categories',
			GET_ALL : 'kits/categories/get-all',
		},
	},
	LABS : {
		FILTERS    : 'labs/filters',
		GET_ONE    : 'labs/get-one',
		CATEGORIES : {
			BASE    : 'labs/categories',
			GET_ALL : 'labs/categories/get-all',
		},
	},
	GLOBAL_SEARCH  : {
		BASE   : 'global-search',
		TOTALS : 'global-search/totals',
	},
};

export const EXTERNAL_ENDPOINTS = {
	PRODUCTS      : {
		BASE       : '/products',
		MATERIALS  : {
			GET_ALL : '/materials/paginated',
			BASE    : '/materials',
		},
		CATEGORIES : {
			GET_ALL       : '/categories/paginated',
			BASE          : '/categories',
			SUBCATEGORIES : '/sub-categories/paginated',
			SUB_BASE      : '/sub-categories',
		},
	},
	GLOBAL_SEARCH : {
		BASE   : '/global-searches',
		TOTALS : '/global-searches/totals',
	},
	KITS          : {
		BASE       : '/kits',
		CATEGORIES : {
			GET_ALL : '/kit-categories/paginated',
			BASE    : '/kit-categories',
		},
	},
	LABS          : {
		BASE       : '/mobile-labs',
		CATEGORIES : {
			GET_ALL : '/lab-categories/paginated',
			BASE    : '/lab-categories',
		},
	}
};

