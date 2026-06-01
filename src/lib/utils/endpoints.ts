export const INTERNAL_ENDPOINTS = {
	PRODUCTS       : {
		FILTERS         : 'products/filters',
		TECHNICAL_SPECS : 'products/get-technical-specs',
		GET_ONE         : 'products/get-one',
		MATERIALS       : {
			GET_ALL : 'products/materials/get-all',
		},
		CATEGORIES     : {
			GET_ALL : 'products/categories/get-all',
		},
	},
	KITS : {
		FILTERS    : 'kits/filters',
		GET_ONE    : 'kits/get-one',
		CATEGORIES : {
			GET_ALL : 'kits/categories/get-all',
		},
	},
	LABS : {
		FILTERS    : 'labs/filters',
		GET_ONE    : 'labs/get-one',
		CATEGORIES : {
			GET_ALL : 'labs/categories/get-all',
		},
	},
	GLOBAL_SEARCH  : {
		BASE : 'global-search',
	},
};

export const EXTERNAL_ENDPOINTS = {
	PRODUCTS      : {
		BASE       : '/products',
		MATERIALS  : {
			GET_ALL : '/materials',
		},
		CATEGORIES : {
			GET_ALL : '/categories',
		},
	},
	GLOBAL_SEARCH : {
		BASE : '/global-searches',
	},
	KITS          : {
		BASE       : '/kits',
		CATEGORIES : {
			GET_ALL : '/kit-categories',
		},
	},
	LABS          : {
		BASE       : '/mobile-labs',
		CATEGORIES : {
			GET_ALL : '/lab-categories',
		},
	}
};

