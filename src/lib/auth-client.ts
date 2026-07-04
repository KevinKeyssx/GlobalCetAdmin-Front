import {
    // PUBLIC_BETTER_AUTH_BASE_PATH,
    // PUBLIC_FRONT_URL,
    PUBLIC_AUTH_URL
}                   from '$env/static/public';
// import { browser }  from '$app/environment';

import { createAuthClient } from 'better-auth/svelte';


// const baseURL = browser
// 	? `${ window.location.origin }${ PUBLIC_BETTER_AUTH_BASE_PATH }`
// 	: `${ PUBLIC_FRONT_URL }/${ PUBLIC_BETTER_AUTH_BASE_PATH }`;


const baseURL = PUBLIC_AUTH_URL;


export const authClient = createAuthClient({ baseURL });
