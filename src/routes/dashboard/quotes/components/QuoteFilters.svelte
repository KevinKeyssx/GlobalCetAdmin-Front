<script lang="ts">
	import Select from '$lib/components/shared/Select.svelte';
	import SearchInput from '$lib/components/shared/SearchInput.svelte';
	import { BrushCleaning, ArrowUpDown } from '@lucide/svelte';

	interface Props {
		search           : string;
		debouncedSearch  : string;
		selectedStatuses : Set< string >;
		orderBy          : string;
		order            : string;
	}

	let {
		search           = $bindable( '' ),
		debouncedSearch  = $bindable( '' ),
		selectedStatuses = $bindable( new Set< string >() ),
		orderBy          = $bindable( 'createdAt' ),
		order            = $bindable( 'desc' ),
	} : Props = $props();

	const statusOptions = [
		{ id : 'PENDING',        name : 'Pendiente' },
		{ id : 'IN_REVIEW',      name : 'En Revisión' },
		{ id : 'SENT_TO_CLIENT', name : 'Enviada al Cliente' },
		{ id : 'ACCEPTED',       name : 'Aceptada' },
		{ id : 'REJECTED',       name : 'Rechazada' },
		{ id : 'COMPLETED',      name : 'Completada' },
		{ id : 'CANCELLED',      name : 'Cancelada' },
	];

	const orderByOptions = [
		{ id : 'createdAt',   name : 'Fecha de Creación' },
		{ id : 'updatedAt',   name : 'Fecha de Modificación' },
		{ id : 'quoteNumber', name : 'Número de Cotización' },
	];

	function toggleOrder( ) : void {
		order = order === 'desc' ? 'asc' : 'desc';
	}

	function clearFilters( ) : void {
		search           = '';
		debouncedSearch  = '';
		selectedStatuses = new Set< string >();
		orderBy          = 'createdAt';
		order            = 'desc';
	}

	const hasActiveFilters = $derived(
		!!search || selectedStatuses.size > 0 || orderBy !== 'createdAt' || order !== 'desc'
	);
</script>

<div
	class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end bg-card/40 border border-brand/10 p-4 rounded-2xl w-full text-xs"
>
	<!-- Search -->
	<div class="space-y-1.5 w-full md:col-span-2">
		<label for="search-input" class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
			Buscar
		</label>
		<SearchInput
			bind:value          = { search }
			bind:debouncedValue = { debouncedSearch }
			placeholder         = "Buscar por número de cotización o cliente..."
		/>
	</div>

	<!-- Status Select -->
	<div class="space-y-1.5 w-full font-bold text-xs text-text-muted">
		<label for="status-select" class="uppercase tracking-wider block mb-1.5">
			Estados
		</label>
		<Select
			options       = { statusOptions }
			bind:selected = { selectedStatuses }
			multiple      = { true }
			placeholder   = "Todos los estados"
		/>
	</div>

	<!-- Sorting and Reset -->
	<div class="flex flex-col sm:flex-row gap-2 w-full font-semibold text-xs text-text-muted items-center">
		<!-- Order By Select -->
		<div class="space-y-1.5 flex-1 w-full">
			<span class="font-bold uppercase tracking-wider block mb-1.5">
				Ordenar por
			</span>
			<div class="flex gap-2 items-center">
				<div class="flex-1">
					<Select
						bind:value  = { orderBy }
						options     = { orderByOptions }
						multiple    = { false }
						searching   = { false }
						placeholder = "Fecha"
					/>
				</div>
				<!-- Order direction toggle -->
				<button
					type="button"
					onclick={ toggleOrder }
					class="p-2.5 rounded-xl border border-brand/15 bg-surface/30 text-text-muted hover:bg-brand/10 hover:text-brand transition-all duration-300 h-[46px] aspect-square flex items-center justify-center cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
					title={ order === 'desc' ? 'Descendente' : 'Ascendente' }
				>
					<ArrowUpDown class="size-4 transition-transform duration-300 { order === 'asc' ? 'rotate-180 text-brand' : '' }" />
				</button>
			</div>
		</div>

		<!-- Reset button -->
		{#if ( hasActiveFilters )}
			<button
				onclick={ clearFilters }
				class="p-2.5 rounded-xl border border-brand/15 bg-brand/10 text-brand hover:bg-brand hover:text-surface-dark transition-all duration-300 shadow-sm self-end h-[46px] aspect-square flex items-center justify-center cursor-pointer"
				title="Limpiar Filtros"
			>
				<BrushCleaning class="size-4" />
			</button>
		{/if}
	</div>
</div>
