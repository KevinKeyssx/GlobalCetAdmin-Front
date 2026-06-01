<script lang="ts">
	import { Accordion } from 'bits-ui';
	import { slide }     from 'svelte/transition';
	import { createQuery } from '@tanstack/svelte-query';

	import Select from '$lib/components/shared/Select.svelte';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import type { CategoryFilter }          from '$lib/types/category';
	import type { Material }                from '$lib/types/material';

	// ─── Props ────────────────────────────────────────────────────────────────────
	interface Props {
		selectedSubCategories : Set<string>;
		selectedMaterials     : Set<string>;
		isEnabled             : boolean;
	}

	let {
		selectedSubCategories = $bindable( new Set<string>() ),
		selectedMaterials     = $bindable( new Set<string>() ),
		isEnabled,
	}: Props = $props();

	// ─── Local State: Category Search ─────────────────────────────────────────────
	let categorySearch = $state( '' );

	// ─── Query: Load categories dynamically ───────────────────────────────────────
	const categoriesQuery = createQuery( () => ({
		queryKey : [ 'categories' ],
		queryFn  : async () => {
			const response = await connectRequest<CategoryFilter[]>( {
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL,
				isInternal : true,
			});

			if ( isApiError( response )) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled : isEnabled,
	}));

	// ─── Query: Load materials dynamically ──────────────────────────────────────────
	const materialsQuery = createQuery( () => ({
		queryKey : [ 'materials' ],
		queryFn  : async () => {
			const response = await connectRequest<Material[]>( {
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.GET_ALL,
				isInternal : true,
			});

			if ( isApiError( response )) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled : isEnabled,
	}));

	// ─── Derived: Mapped Materials for Select Option matching ──────────────────────
	const mappedMaterials = $derived.by( () => {
		if ( !materialsQuery.data ) return [];
		return materialsQuery.data.map( ( m ) => ({
			id   : m.id,
			name : m.name,
			meta : {
				autoclavable       : m.autoclavable,
				maxTemperature     : m.maxTemperature,
				chemicalResistance : m.chemicalResistance,
			},
		}));
	});

	// ─── Derived: Filtered Categories (Local Search) ──────────────────────────────
	const filteredCategories = $derived.by( () => {
		if ( !categoriesQuery.data ) return [];
		const q = categorySearch.trim().toLowerCase();
		if ( !q ) return categoriesQuery.data;
		return categoriesQuery.data.filter( ( cat ) => cat.name.toLowerCase().includes( q ) );
	});

	// ─── Derived: Loading / Error States ──────────────────────────────────────────
	const isLoading = $derived( categoriesQuery.isLoading || materialsQuery.isLoading );
	const isError   = $derived( categoriesQuery.isError || materialsQuery.isError );

	// ─── Dynamic Icon Resolver ────────────────────────────────────────────────────
	function getCategoryIcon( name: string ): string {
		const lower = name.toLowerCase();

		if ( lower.includes( 'vidrio' ) || lower.includes( 'material' ) ) return '🧪';
		if ( lower.includes( 'kit' ) ) return '🧰';
		if ( lower.includes( 'sistema' ) ) return '🔬';
		if ( lower.includes( 'reactivo' ) ) return '⚗️';
		if ( lower.includes( 'medici' ) || lower.includes( 'equipo' ) ) return '📏';
		if ( lower.includes( 'electr' ) ) return '🔌';

		return '🔹';
	}
</script>

{#if isLoading}
	<!-- Premium Shimmering Loading Skeleton -->
	<div class="flex flex-col gap-3">
		{#each Array( 5 ) as _}
			<div class="h-12 w-full animate-pulse rounded-xl bg-surface/50 border border-brand/5"></div>
		{/each}
	</div>
{:else if isError}
	<!-- Error State with Retry option -->
	<div class="flex flex-col items-center justify-center py-6 text-center gap-3 rounded-xl bg-red-500/5 border border-red-500/10 p-4">
		<span class="text-2xl">⚠️</span>
		<p class="text-xs font-semibold text-red-500">Error al cargar datos de filtros</p>
		<button
			onclick={ () => { categoriesQuery.refetch(); materialsQuery.refetch(); } }
			class="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/25 transition-all duration-300"
		>
			Reintentar
		</button>
	</div>
{:else}
	<!-- Accordion Roots for Heading Containers -->
	<Accordion.Root type="multiple" class="flex flex-col gap-4" value={ [ 'categories', 'materials' ] }>
		<!-- Accordion Item: Categorías -->
		<Accordion.Item value="categories" class="border border-brand/10 dark:border-brand/5 rounded-xl bg-surface/30 transition-all duration-300 hover:border-brand/20">
			<Accordion.Header class="flex">
				<Accordion.Trigger class="group flex-1 flex items-center justify-between px-4 py-3 hover:bg-brand/5 transition-all text-left">
					<div class="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-text">
						<div class="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--color-brand)]"></div>
						Categorías
					</div>
					<!-- Chevron indicator -->
					<svg class="h-4 w-4 text-text-muted transition-transform duration-300 group-data-[state=open]:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</Accordion.Trigger>
			</Accordion.Header>

			<Accordion.Content class="px-4 pb-4 pt-2 border-t border-brand/5 bg-surface/10 space-y-4">
				<!-- Local Category Filter Input -->
				<div class="relative flex items-center mt-1 mb-3">
					<svg class="absolute left-3.5 h-3.5 w-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
					<input
						type="search"
						bind:value={ categorySearch }
						placeholder="Buscar categorías..."
						class="
							w-full rounded-xl border border-brand/10 bg-surface/50
							py-2 pl-9 pr-4 text-xs text-text placeholder-text-muted/65
							outline-none transition-all duration-300
							focus:border-brand/40 focus:ring-1 focus:ring-brand/20
						"
					/>
				</div>

				{#if categoriesQuery.data}
					{#each filteredCategories as category (category.id)}
						<div transition:slide={ { duration: 200 } } class="space-y-1.5">
							<div class="flex items-center gap-2 pl-1">
								<span class="text-sm">{ getCategoryIcon( category.name ) }</span>
								<span class="text-[11px] font-bold text-text-muted">{ category.name }</span>
							</div>
							<Select
								options={ category.subCategories }
								bind:selected={ selectedSubCategories }
								placeholder="Buscar subcategorías..."
							/>
						</div>
					{:else}
						<p class="text-center text-[11px] text-text-muted py-2 italic">Sin resultados</p>
					{/each}
				{/if}
			</Accordion.Content>
		</Accordion.Item>

		<!-- Accordion Item: Materiales -->
		<Accordion.Item value="materials" class="border border-brand/10 dark:border-brand/5 rounded-xl bg-surface/30 transition-all duration-300 hover:border-brand/20">
			<Accordion.Header class="flex">
				<Accordion.Trigger class="group flex-1 flex items-center justify-between px-4 py-3 hover:bg-brand/5 transition-all text-left">
					<div class="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-text">
						<div class="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--color-brand)]"></div>
						Materiales
					</div>
					<!-- Chevron indicator -->
					<svg class="h-4 w-4 text-text-muted transition-transform duration-300 group-data-[state=open]:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</Accordion.Trigger>
			</Accordion.Header>

			<Accordion.Content class="px-4 pb-4 pt-2 border-t border-brand/5 bg-surface/10">
				<Select
					options={mappedMaterials}
					bind:selected={selectedMaterials}
					placeholder="Buscar materiales..."
				/>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
{/if}
