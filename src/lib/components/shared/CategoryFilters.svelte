<script lang="ts">
	import Select            from '$lib/components/shared/Inputs/Select.svelte';
	import SearchInput       from '$lib/components/shared/Inputs/SearchInput.svelte';
	import { BrushCleaning } from '@lucide/svelte';

	interface Props {
		search          : string;
		debouncedSearch : string;
		activeStatus    : string;
		placeholder?    : string;
		class?          : string;
	}

	let {
		search          = $bindable( '' ),
		debouncedSearch = $bindable( '' ),
		activeStatus    = $bindable( 'all' ),
		placeholder     = 'Buscar...',
		class : className = ''
	} : Props = $props();

	const statusOptions = [
		{
			id   : 'all',
			name : 'Todos'
		},
		{
			id   : 'true',
			name : 'Activos'
		},
		{
			id   : 'false',
			name : 'Inactivos'
		}
	];

	function clearFilters() : void {
		search          = '';
		debouncedSearch = '';
		activeStatus    = 'all';
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end bg-card/40 border border-brand/10 p-4 rounded-2xl w-full text-xs { className }">
	<!-- Search -->
	<div class="space-y-1.5 w-full lg:col-span-2 xl:col-span-3">
		<label for="search-input" class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Buscar</label>
		<SearchInput
			bind:value          = { search }
			bind:debouncedValue = { debouncedSearch }
			placeholder         = { placeholder }
		/>
	</div>

	<!-- Status and Reset -->
	<div class="flex gap-2 w-full font-semibold text-xs text-text-muted items-end">
		<div class="space-y-1.5 flex-1">
			<span class="font-bold uppercase tracking-wider block mb-1.5">Estado</span>
			<Select
				bind:value  = { activeStatus }
				options     = { statusOptions }
				multiple    = { false }
				searching   = { false }
				placeholder = "Todos"
			/>
		</div>

		{#if ( activeStatus !== 'all' || search ) }
			<button
				onclick = { clearFilters }
				class   = "p-2.5 rounded-xl border border-brand/15 bg-brand/10 text-brand hover:bg-brand hover:text-surface-dark transition-all duration-300 shadow-sm h-[46px] aspect-square flex items-center justify-center cursor-pointer"
				title   = "Limpiar Filtros"
			>
				<BrushCleaning class="size-4" />
			</button>
		{/if}
	</div>
</div>
