import { toSvelteKitHandler } from 'better-auth/svelte-kit';

import { auth } from '$lib/server/auth';


/**
 * @description Handler de SvelteKit para peticiones de Better Auth.
 */
export const GET  = toSvelteKitHandler( auth );
export const POST = toSvelteKitHandler( auth );
