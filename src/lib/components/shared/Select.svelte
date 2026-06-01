<script lang="ts">
	import { slide } from 'svelte/transition';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface OptionMeta {
		autoclavable?       : boolean;
		maxTemperature?     : number;
		chemicalResistance? : {
			acid     : string;
			alkaline : string;
		};
	}

	interface Option {
		id   : string;
		name : string;
		meta?: OptionMeta;
	}

	interface Props {
		options     : Option[];
		selected    : Set<string>;
		placeholder : string;
	}

	let {
		options     = [],
		selected    = $bindable( new Set<string>() ),
		placeholder = 'Seleccionar...',
	}: Props = $props();

	// ─── Reactive States ──────────────────────────────────────────────────────────
	let isOpen    = $state( false );
	let searchVal = $state( '' );
	let container = $state<HTMLElement | null>( null );

	// ─── Derived State: Search Filter ─────────────────────────────────────────────
	const filteredOptions = $derived.by( () => {
		const query = searchVal.trim().toLowerCase();
		if ( !query ) return options;
		return options.filter( ( opt ) => opt.name.toLowerCase().includes( query ) );
	} );

	// ─── Derived: Selected Items List ─────────────────────────────────────────────
	const selectedItems = $derived.by( () => {
		return options.filter( ( opt ) => selected.has( opt.id ) );
	} );

	// ─── Actions ──────────────────────────────────────────────────────────────────
	function toggleOption( id: string ) {
		const next = new Set( selected );
		if ( next.has( id ) ) {
			next.delete( id );
		} else {
			next.add( id );
		}
		selected = next;
	}


    function removeOption( id: string, event: MouseEvent ) {
		event.stopPropagation();
		const next = new Set( selected );
		next.delete( id );
		selected = next;
	}


    function clearAll( event: MouseEvent ): void {
		event.stopPropagation();

        const next: Set<string> = new Set( selected );

        for ( const opt of options ) {
			next.delete( opt.id );
		}

        selected = next;
	}

	// ─── Click Outside Listener ───────────────────────────────────────────────────
	function handleOutsideClick( event: MouseEvent ) {
		if ( isOpen && container && !container.contains( event.target as Node ) ) {
			isOpen = false;
		}
	}

	// Dynamic icon resolver for chemical resistance
	function getResistanceIcon( level: string ): string {
		const lower = level.toLowerCase();
		if ( lower === 'excellent' || lower === 'excelente' ) return '🟢';
		if ( lower === 'good' || lower === 'bueno' ) return '🟡';
		return '🔴';
	}
</script>

<svelte:window onclick={handleOutsideClick} />

<!-- ─── Select Wrapper ──────────────────────────────────────────────────────────── -->
<div bind:this={container} class="relative w-full text-left">
	<!-- Trigger Wrapper -->
	<div
		role="button"
		tabindex="0"
		onclick={ () => isOpen = !isOpen }
		onkeydown={ ( e ) => { if ( e.key === ' ' || e.key === 'Enter' ) { e.preventDefault(); isOpen = !isOpen; } } }
		class="
			flex min-h-[46px] w-full items-center justify-between gap-2 rounded-xl cursor-pointer
			border border-brand/20 dark:border-brand/10
			bg-surface/40 hover:bg-surface/60 backdrop-blur-md
			px-4 py-2.5 text-xs text-text
			shadow-[0_2px_10px_rgba(0,0,0,0.02)]
			outline-none transition-all duration-300 select-none
			{isOpen ? 'ring-2 ring-brand border-brand/40 shadow-[0_0_12px_rgba(0,230,118,0.1)]' : ''}
		"
	>
		<div class="flex flex-wrap gap-1.5 max-w-[90%] items-center">
			{#if selectedItems.length === 0}
				<span class="text-text-muted select-none">{placeholder}</span>
			{:else}
				{#each selectedItems.slice( 0, 2 ) as item}
					<span
						class="
							flex items-center gap-1 rounded-lg
							bg-brand/15 border border-brand/30
							px-2 py-0.5 text-[10px] font-bold text-brand
							transition-all duration-200 hover:bg-brand/20
						"
					>
						{item.name}
						<button
							type="button"
							onclick={ ( e ) => removeOption( item.id, e ) }
							class="hover:text-red-400 transition-colors p-0.5 ml-0.5"
							title="Eliminar"
							aria-label="Eliminar"
						>
							<svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
					</span>
				{/each}
				{#if selectedItems.length > 2}
					<span class="rounded-lg bg-brand text-surface-dark px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
						+ {selectedItems.length - 2}
					</span>
				{/if}
			{/if}
		</div>

		<!-- Right controls -->
		<div class="flex items-center gap-1 shrink-0 text-text-muted">
			{#if selectedItems.length > 0}
				<button
					type="button"
					onclick={clearAll}
					class="p-1 hover:text-red-400 transition-colors"
					title="Limpiar selección"
					aria-label="Limpiar selección"
				>
					<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			{/if}
			<svg
				class="h-4 w-4 transition-transform duration-300 {isOpen ? 'rotate-180 text-brand' : ''}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
			>
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</div>
	</div>

	<!-- Popover Dropdown Card -->
	{#if isOpen}
		<div
			transition:slide={{ duration: 250 }}
			class="
				absolute left-0 right-0 z-50 mt-2 flex flex-col gap-2 rounded-2xl
				border border-brand/20 dark:border-brand/10
				bg-surface/95 backdrop-blur-2xl p-3
				shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/5
			"
		>
			<!-- Search Field -->
			<div class="relative flex items-center">
				<svg class="absolute left-3.5 h-3.5 w-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<circle cx="11" cy="11" r="8"></circle>
					<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
				</svg>
				<input
					type="text"
					bind:value={searchVal}
					placeholder="Buscar..."
					class="
						w-full rounded-xl border border-brand/10 bg-surface/50
						py-2 pl-9 pr-4 text-xs text-text placeholder-text-muted/65
						outline-none transition-all duration-300
						focus:border-brand/40 focus:ring-1 focus:ring-brand/20
					"
				/>
			</div>

			<!-- Options List -->
			<div class="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
				{#if filteredOptions.length === 0}
					<p class="text-center text-[11px] text-text-muted py-3 italic">Sin resultados</p>
				{:else}
					{#each filteredOptions as opt}
						{@const isChecked = selected.has( opt.id )}
						<button
							type="button"
							onclick={ () => toggleOption( opt.id ) }
							class="
								w-full flex items-center justify-between rounded-xl px-3 py-2
								transition-all duration-200 text-left
								{isChecked
									? 'bg-brand/10 text-brand font-semibold'
									: 'hover:bg-brand/5 text-text-muted hover:text-text'
								}
							"
						>
							<div class="flex items-center gap-3">
								<!-- Checkbox Visualizer -->
								<div
									class="
										flex h-4 w-4 shrink-0 items-center justify-center rounded
										border transition-all duration-300
										{isChecked
											? 'border-brand bg-brand text-surface-dark shadow-[0_0_8px_rgba(0,230,118,0.25)]'
											: 'border-brand/20 bg-surface'
										}
									"
								>
									{#if isChecked}
										<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"></polyline>
										</svg>
									{/if}
								</div>
								<div class="flex flex-col">
									<span class="text-xs leading-tight">{opt.name}</span>
									<!-- Detailed option meta details (Autoclave, Temperature, Chemical Resistance) -->
									{#if opt.meta}
										<div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-bold text-text-muted/70 tracking-wider">
											{#if opt.meta.autoclavable !== undefined}
												<span class="flex items-center gap-0.5 bg-brand/5 px-1.5 py-0.5 rounded border border-brand/10">
													🧪 {opt.meta.autoclavable ? 'AUTOCLAVABLE' : 'NO AUTOCLAVABLE'}
												</span>
											{/if}
											{#if opt.meta.maxTemperature !== undefined}
												<span class="bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 text-amber-500">
													🔥 TMAX: {opt.meta.maxTemperature}°C
												</span>
											{/if}
											{#if opt.meta.chemicalResistance}
												<span class="flex items-center gap-1 bg-sky-500/5 px-1.5 py-0.5 rounded border border-sky-500/10 text-sky-400">
													🛡️ ÁCIDO: {getResistanceIcon( opt.meta.chemicalResistance.acid )} | ÁLK: {getResistanceIcon( opt.meta.chemicalResistance.alkaline )}
												</span>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Premium Scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: var(--color-brand-muted, rgba(0, 230, 118, 0.2));
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: var(--color-brand, #00e676);
	}
</style>
