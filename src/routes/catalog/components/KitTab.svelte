<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	import CheckboxList                   from '$lib/components/shared/CheckboxList.svelte';
	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }         from '$lib/utils/endpoints';
	import type { KitCategory }           from '$lib/types/category';

	// ─── Props ────────────────────────────────────────────────────────────────────
	interface Props {
		selected  : Set<string>;
		isEnabled : boolean;
	}

	let {
		selected  = $bindable( new Set<string>() ),
		isEnabled = false,
	}: Props = $props();

	// ─── Query: Load kit categories ───────────────────────────────────────────────
	const kitCategoriesQuery = createQuery( () => ({
		queryKey : [ 'kitCategories' ],
		queryFn  : async () => {
			const response = await connectRequest<KitCategory[]>( {
				endpoint   : INTERNAL_ENDPOINTS.KITS.CATEGORIES.GET_ALL,
				isInternal : true,
			});

			if ( isApiError( response )) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled : isEnabled,
	}));

	// ─── Derived: Loading / Error States ──────────────────────────────────────────
	const isLoading = $derived( kitCategoriesQuery.isLoading );
	const isError   = $derived( kitCategoriesQuery.isError );
</script>

<CheckboxList
	items={ kitCategoriesQuery.data || [] }
	bind:selected
	isLoading={ isLoading }
	isError={ isError }
	onRetry={ () => kitCategoriesQuery.refetch() }
/>
