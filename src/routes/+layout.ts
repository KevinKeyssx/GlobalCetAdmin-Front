import { QueryClient } from '@tanstack/svelte-query';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

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
