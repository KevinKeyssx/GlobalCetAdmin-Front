<script lang="ts">
	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface KitProduct {
		id        : string;
		quantity  : number;
		productId : string;
		product   : {
			id   : string;
			name : string;
			sku  : string;
		};
	}

	interface KitDetails {
		sku      : string;
		products : Array< KitProduct >;
	}

	interface Props {
		kit : KitDetails;
	}

	const { kit }: Props = $props();
</script>


<div class="rounded-2xl border border-brand/10 bg-card p-5 space-y-4">

	<!-- Header title -->
	<div class="flex items-center gap-2">
		<span class="text-lg">🧰</span>
		<div class="flex flex-col">
			<span class="text-[9px] font-black uppercase tracking-wider text-brand">Configuración Educativa</span>
			<h5 class="text-sm font-bold text-text">Insumos y Reactivos Incluidos</h5>
		</div>
	</div>

	<!-- Components List -->
	{#if kit.products && kit.products.length > 0 }
		<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
			{#each kit.products as kp ( kp.id ) }
				<a
					href  = "/products/product/{ kp.product.id }"
					class = "
						group/item flex items-center justify-between rounded-xl
						border border-brand/5 bg-surface/50 p-3
						transition-all duration-200 hover:border-brand/20 hover:bg-brand/5
					"
				>
					<div class="flex items-center gap-2.5 min-w-0">
						<!-- Quantity counter badge -->
						<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-[10px] font-bold text-brand group-hover/item:bg-brand group-hover/item:text-surface-dark transition-colors duration-200">
							{ kp.quantity }x
						</span>
						<div class="flex flex-col min-w-0">
							<span class="truncate text-xs font-bold text-text group-hover/item:text-brand transition-colors duration-200">
								{ kp.product.name }
							</span>
							<span class="text-[9px] font-mono text-text-muted mt-0.5">
								SKU: { kp.product.sku }
							</span>
						</div>
					</div>

					<!-- Visual Arrow -->
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
			No hay insumos o productos individuales asociados a este kit científico.
		</p>
	{/if}

</div>
