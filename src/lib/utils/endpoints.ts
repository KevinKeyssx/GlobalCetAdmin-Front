export const INTERNAL_ENDPOINTS = {
	PRODUCTS      : {
		BASE            : 'products',
		FILTERS         : 'products/filters',
		TECHNICAL_SPECS : 'products/get-technical-specs',
		GET_ONE         : 'products/get-one',
		FILES           : 'products/files',
		EXPORT          : 'products/export',
		MATERIALS       : {
			GET_ALL : 'products/materials/get-all',
			BASE    : 'products/materials',
		},
		CATEGORIES      : {
			BASE    : 'products/categories',
			GET_ALL : 'products/categories/get-all',
		},
		SUBCATEGORIES   : {
			GET_ALL : 'products/sub-categories',
		},
	},
	KITS          : {
		BASE       : 'kits',
		FILTERS    : 'kits/filters',
		GET_ONE    : 'kits/get-one',
		EXPORT     : 'kits/export',
		CATEGORIES : {
			BASE    : 'kits/categories',
			GET_ALL : 'kits/categories/get-all',
		},
	},
	LABS          : {
		BASE       : 'labs',
		FILTERS    : 'labs/filters',
		GET_ONE    : 'labs/get-one',
		EXPORT     : 'labs/export',
		CATEGORIES : {
			BASE    : 'labs/categories',
			GET_ALL : 'labs/categories/get-all',
		},
	},
	DUPLICATE     : {
		BASE : 'duplicate',
	},
	GLOBAL_SEARCH : {
		BASE   : 'global-search',
		TOTALS : 'global-search/totals',
	},
	QUOTES        : {
		BASE    : 'quotes',
		CREATE  : 'quotes/create',
		GET_ALL : 'quotes/get-all',
		GET_ONE : 'quotes/get-one',
		UPDATE  : 'quotes/update',
	},
	PRICE_HISTORY : {
		GET_PRICES : 'price-history/get-prices',
	},
};

export const EXTERNAL_ENDPOINTS = {
	PRODUCTS      : {
		BASE       : '/products',
		EXPORT     : '/products/export/file',
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
		EXPORT     : '/kits/export/file',
		CATEGORIES : {
			GET_ALL : '/kit-categories/paginated',
			BASE    : '/kit-categories',
		},
	},
	LABS          : {
		BASE       : '/mobile-labs',
		EXPORT     : '/mobile-labs/export/file',
		CATEGORIES : {
			GET_ALL : '/lab-categories/paginated',
			BASE    : '/lab-categories',
		},
	},
	DUPLICATES    : {
		PRODUCT		: '/duplicates/product',
		KIT			: '/duplicates/kit',
		MOBILE_LAB	: '/duplicates/mobile-lab',
	},
	QUOTES        : {
		BASE : '/quotes',
	},
	PRICE_HISTORY : {
		BASE : '/price-history',
	},
};

