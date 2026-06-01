import { json, type RequestHandler } from '@sveltejs/kit';

import connectRequest           from '$lib/services/fetch.service';
import { EXTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
import { ENV }                  from '$lib/utils/env.server';


export const GET: RequestHandler = async ({ fetch }) => {
	const response = await connectRequest({
		endpoint   : `${EXTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL}?includeSubcategories=true`,
		isInternal : false,
		headers    : {
			'x-secret' : ENV.INTERNAL_SECRET_KEY,
		},
		fetch,
	});

	return json( response );
};
