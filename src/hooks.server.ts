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
				await auth.api.signOut( { headers : event.request.headers } );
				throw redirect( 302, `${ path( '/login' ) }?error=${ encodeURIComponent( `Error del servidor de validación: ${ response.status }` ) }` );
			}

			const responseText = await response.text();
			const responseTrim = responseText.trim();

			if ( responseTrim !== 'true' ) {
				await auth.api.signOut( { headers : event.request.headers } );
				const errorQuery = responseTrim === 'false' ? 'no_permission' : `Respuesta inesperada del servidor: ${ responseTrim.slice( 0, 50 ) }`;
				throw redirect( 302, `${ path( '/login' ) }?error=${ encodeURIComponent( errorQuery ) }` );
			}
		} catch ( error ) {
			if ( error && typeof error === 'object' && 'status' in error && ( error as { status : number } ).status === 302 ) {
				throw error;
			}

			await auth.api.signOut( { headers : event.request.headers } );
			const msg = error instanceof Error ? error.message : String( error );
			throw redirect( 302, `${ path( '/login' ) }?error=${ encodeURIComponent( `Error de validación: ${ msg }` ) }` );
		}
	}

	return resolve( event );
};
