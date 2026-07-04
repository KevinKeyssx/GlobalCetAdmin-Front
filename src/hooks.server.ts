import { redirect }    from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

import { resolve as path } from '$app/paths';

import { auth }               from '$lib/server/auth';
import { ENV }                from '$lib/utils/env.server';
import { EXTERNAL_ENDPOINTS } from '$lib/utils/endpoints';


export const handle : Handle = async({ event, resolve }) => {
	// ─── Poblar sesión en locals ───────────────────────────────────────────────
	let session : Awaited<ReturnType<typeof auth.api.getSession>> = null;

	try {
		session = await auth.api.getSession({
			headers : event.request.headers,
		});
	} catch {
		session = null;
	}

	event.locals.session = session?.session ?? null;
	event.locals.user    = session?.user    ?? null;

	// ─── Protección de rutas /dashboard/* ─────────────────────────────────────
	if ( event.route.id?.startsWith( '/dashboard' )) {
		const user = event.locals.user;

		if ( !event.locals.session || !user ) {
			throw redirect( 302, path( '/login' ));
		}

		try {
			const email       = user.email;
			const validateUrl = `${ ENV.BACKEND_URL }${ EXTERNAL_ENDPOINTS.USERS.VALIDATE_LOGIN }`;

			const response = await fetch( validateUrl, {
				method  : 'GET',
				headers : {
					'accept'       : '*/*',
					'x-secret'     : ENV.INTERNAL_SECRET_KEY,
					'x-user-email' : email,
				},
			});

			if ( !response.ok ) {
				throw redirect( 302, path( '/login' ) );
			}

			const responseText = await response.text();
			const isValid      = responseText.trim() === 'true';

			if ( !isValid ) {
				throw redirect( 302, path( '/login' ) );
			}
		} catch ( error ) {
			if ( error && typeof error === 'object' && 'status' in error && ( error as { status : number } ).status === 302 ) {
				throw error;
			}

			throw redirect( 302, path( '/login' ) );
		}
	}

	return resolve( event );
};
