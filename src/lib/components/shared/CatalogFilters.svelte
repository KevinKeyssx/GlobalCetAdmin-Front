<script lang="ts">
	import Select            from '$lib/components/shared/Inputs/Select.svelte';
	import SearchInput       from '$lib/components/shared/Inputs/SearchInput.svelte';
	import { BrushCleaning } from '@lucide/svelte';

	interface CategoryOption {
		id   : string;
		name : string;
	}

	interface Props {
		search                : string;
		debouncedSearch       : string;
		activeStatus          : string;
		selectedCategories    : Set< string >;
		categories            : CategoryOption[];
		searchPlaceholder?    : string;
		categoriesLabel?      : string;
		categoriesPlaceholder?: string;
		class?                : string;
	}

	let {
		search                = $bindable( '' ),
		debouncedSearch       = $bindable( '' ),
		activeStatus          = $bindable( 'all' ),
		selectedCategories    = $bindable( new Set< string >() ),
		categories,
		searchPlaceholder     = 'Buscar...',
		categoriesLabel       = 'Categorías',
		categoriesPlaceholder = 'Todas las categorías',
		class : className     = ''
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

	function clearFilters( ) : void {
		search             = '';
		debouncedSearch    = '';
		activeStatus       = 'all';
		selectedCategories = new Set< string >();
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end bg-card/40 border border-brand/10 p-4 rounded-2xl w-full text-xs { className }">
	<!-- Search -->
	<div class="space-y-1.5 w-full md:col-span-2">
		<label for="search-input" class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Buscar</label>
		<SearchInput
			bind:value          = { search }
			bind:debouncedValue = { debouncedSearch }
			placeholder         = { searchPlaceholder }
		/>
	</div>

	<!-- Categories Select -->
	<div class="space-y-1.5 w-full font-bold text-xs text-text-muted">
		<label for="categories-select" class="uppercase tracking-wider block mb-1.5">{ categoriesLabel }</label>
		<Select
			options       = { categories }
			bind:selected = { selectedCategories }
			multiple      = { true }
			placeholder   = { categoriesPlaceholder }
		/>
	</div>

	<!-- Status and Reset -->
	<div class="flex flex-col sm:flex-row gap-2 w-full font-semibold text-xs text-text-muted items-center">
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

		{#if ( activeStatus !== 'all' || selectedCategories.size > 0 || search ) }
			<button
				onclick = { clearFilters }
				class   = "p-2.5 rounded-xl border border-brand/15 bg-brand/10 text-brand hover:bg-brand hover:text-surface-dark transition-all duration-300 shadow-sm self-end h-[42px] aspect-square flex items-center justify-center"
				title   = "Limpiar Filtros"
			>
				<BrushCleaning class="size-4" />
			</button>
		{/if}
	</div>
</div>
