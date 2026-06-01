<script lang="ts">
	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface LabKit {
		id       : string;
		quantity : number;
		kitId    : string;
		kit      : {
			id   : string;
			name : string;
			sku  : string;
		};
	}

	interface LabProduct {
		id        : string;
		quantity  : number;
		productId : string;
		product   : {
			id   : string;
			name : string;
			sku  : string;
		};
	}

	interface LabDetails {
		sku        : string;
		dimensions : string;
		kits       : Array< LabKit >;
		products   : Array< LabProduct >;
	}

	interface Props {
		lab : LabDetails;
	}

	const { lab }: Props = $props();

	// Derived: total integrated item counts
	const totalKits     = $derived( lab.kits?.length || 0 );
	const totalProducts = $derived( lab.products?.length || 0 );
</script>


<div class="space-y-4">

	<!-- Dimensions specifications sheet -->
	<div class="rounded-2xl border border-brand/10 bg-card p-5 space-y-3">
		<div class="flex items-center gap-2">
			<span class="text-lg">📐</span>
			<div class="flex flex-col">
				<span class="text-[9px] font-black uppercase tracking-wider text-brand">Especificaciones Físicas</span>
				<h5 class="text-sm font-bold text-text">Dimensiones del Módulo</h5>
			</div>
		</div>

		<div class="rounded-xl bg-surface px-4 py-3 flex justify-between items-center text-xs border border-brand/5">
			<span class="text-text-muted font-semibold">Espacio Útil de Trabajo</span>
			<span class="font-bold text-brand uppercase tracking-wider">{ lab.dimensions || 'N/A' }</span>
		</div>
	</div>

	<!-- Equipment & Modules sheet -->
	<div class="rounded-2xl border border-brand/10 bg-card p-5 space-y-4">
		<div class="flex items-center gap-2">
			<span class="text-lg">🔬</span>
			<div class="flex flex-col">
				<span class="text-[9px] font-black uppercase tracking-wider text-brand">Sistemas de Instrumentación</span>
				<h5 class="text-sm font-bold text-text">Equipamiento e Insumos</h5>
			</div>
		</div>

		{#if totalKits > 0 || totalProducts > 0 }
			<div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">

				<!-- Associated Kits list -->
				{#each lab.kits as lk ( lk.id ) }
					<a
						href  = "/products/kit/{ lk.kit.id }"
						class = "
							group/item flex items-center justify-between rounded-xl
							border border-blue-500/10 bg-blue-500/5 p-3.5
							transition-all duration-200 hover:border-blue-500/25 hover:bg-blue-500/10
						"
					>
						<div class="flex items-center gap-2.5 min-w-0">
							<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-[10px] font-bold text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-surface-dark transition-colors duration-200">
								{ lk.quantity }x
							</span>
							<div class="flex flex-col min-w-0">
								<span class="truncate text-xs font-bold text-text group-hover/item:text-blue-400 transition-colors duration-200">
									{ lk.kit.name }
								</span>
								<span class="text-[9px] font-mono text-text-muted mt-0.5">
									SKU: { lk.kit.sku } ( Kit )
								</span>
							</div>
						</div>

						<svg
							class        = "h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 text-blue-400"
							viewBox      = "0 0 24 24"
							fill         = "none"
							stroke       = "currentColor"
							stroke-width = "2.5"
							stroke-linecap = "round"
						>
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</a>
				{/each}

				<!-- Associated Products list -->
				{#each lab.products as lp ( lp.id ) }
					<a
						href  = "/products/product/{ lp.product.id }"
						class = "
							group/item flex items-center justify-between rounded-xl
							border border-brand/5 bg-brand/5 p-3.5
							transition-all duration-200 hover:border-brand/20 hover:bg-brand/10
						"
					>
						<div class="flex items-center gap-2.5 min-w-0">
							<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-[10px] font-bold text-brand group-hover/item:bg-brand group-hover/item:text-surface-dark transition-colors duration-200">
								{ lp.quantity }x
							</span>
							<div class="flex flex-col min-w-0">
								<span class="truncate text-xs font-bold text-text group-hover/item:text-brand transition-colors duration-200">
									{ lp.product.name }
								</span>
								<span class="text-[9px] font-mono text-text-muted mt-0.5">
									SKU: { lp.product.sku }
								</span>
							</div>
						</div>

						<svg
							class        = "h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 text-brand"
							viewBox      = "0 0 24 24"
							fill         = "none"
							stroke       = "currentColor"
							stroke-width = "2.5"
							stroke-linecap = "round"
						>
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</a>
				{/each}

			</div>
		{:else}
			<p class="text-xs italic text-text-muted py-8 text-center">
				No se han definido kits científicos ni reactivos adicionales en la configuración base de este laboratorio móvil.
			</p>
		{/if}
	</div>

</div>
