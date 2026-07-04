import { redirect } from '@sveltejs/kit';
import { resolve }  from '$app/paths';

import type { LayoutLoad } from './$types';
import { authClient }      from '$lib/auth-client';


export const load : LayoutLoad = async ( ) : Promise<{ session : import( 'better-auth' ).Session }> => {
	const session = await authClient.getSession();

	if ( !session || !session.data ) {
		throw redirect( 302, resolve( '/login' ) );
	}

	return {
		session : session.data.session,
	};
};
