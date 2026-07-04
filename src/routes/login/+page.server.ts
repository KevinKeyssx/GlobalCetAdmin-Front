import { redirect } from '@sveltejs/kit';
import { resolve }  from '$app/paths';

import { ENV }                  from '$lib/utils/env.server';
import { EXTERNAL_ENDPOINTS }   from '$lib/utils/endpoints';
import type { PageServerLoad }  from './$types';


export const load : PageServerLoad = async ( { locals } ) => {
	if ( locals.session && locals.user ) {
		try {
			const email         = locals.user.email;
			const validateUrl   = `${ ENV.BACKEND_URL }${ EXTERNAL_ENDPOINTS.USERS.VALIDATE_LOGIN }`;

			const response = await fetch( validateUrl, {
				method  : 'GET',
				headers : {
					'accept'       : '*/*',
					'x-secret'     : ENV.INTERNAL_SECRET_KEY,
					'x-user-email' : email,
				},
			});

			if ( response.ok ) {
				const responseText = await response.text();
				const isValid = responseText.trim() === 'true';

				if ( isValid ) {
                    throw redirect( 302, resolve( '/dashboard' ) );
				}
			}
		} catch ( error ) {
			if ( error && typeof error === 'object' && 'status' in error && error.status === 302 ) {
				throw error;
			}
		}
	}

	return {};
};
