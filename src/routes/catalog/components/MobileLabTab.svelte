<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	import CheckboxList                   from '$lib/components/shared/CheckboxList.svelte';
	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }         from '$lib/utils/endpoints';
	import type { LabCategory }           from '$lib/types/category';

	// ─── Props ────────────────────────────────────────────────────────────────────
	interface Props {
		selected  : Set<string>;
		isEnabled : boolean;
	}

	let {
		selected  = $bindable( new Set<string>() ),
		isEnabled = false,
	}: Props = $props();

	// ─── Query: Load lab categories ───────────────────────────────────────────────
	const labCategoriesQuery = createQuery( () => ({
		queryKey : [ 'labCategories' ],
		queryFn  : async () => {
			const response = await connectRequest<LabCategory[]>( {
				endpoint   : INTERNAL_ENDPOINTS.LABS.CATEGORIES.GET_ALL,
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
	const isLoading = $derived( labCategoriesQuery.isLoading );
	const isError   = $derived( labCategoriesQuery.isError );
</script>

<CheckboxList
	items={ labCategoriesQuery.data || [] }
	bind:selected
	isLoading={ isLoading }
	isError={ isError }
	onRetry={ () => labCategoriesQuery.refetch() }
/>
