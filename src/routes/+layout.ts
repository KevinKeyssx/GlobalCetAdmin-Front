import { browser }          from '$app/environment';
import type { LayoutLoad }  from './$types';

import { QueryClient } from '@tanstack/svelte-query';


export const prerender  = false;
export const ssr        = false;


export const load: LayoutLoad = async () => {
	const queryClient = new QueryClient( {
		defaultOptions : {
			queries : {
				staleTime            : 1000 * 60 * 5,
				retry                : 3,
				refetchOnWindowFocus : false,
				enabled              : browser,
			},
		},
	} );

	return { queryClient };
};
