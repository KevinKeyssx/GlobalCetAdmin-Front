import { getRequestEvent } from '$app/server';

import { betterAuth }       from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { ENV } from '$lib/utils/env.server';


export const auth = betterAuth({
	secret          : ENV.BETTER_AUTH.SECRET,
	baseURL         : ENV.BETTER_AUTH.URL,
	basePath        : ENV.BETTER_AUTH.BASE_PATH,
	socialProviders : {
		google : {
			clientId     : ENV.GOOGLE.CLIENT_ID,
			clientSecret : ENV.GOOGLE.CLIENT_SECRET,
		},
	},
	plugins         : [ sveltekitCookies( getRequestEvent ) ],
});
