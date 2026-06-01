<script lang="ts">
	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface Material {
		id                 : string;
		name               : string;
		description        : string;
		autoclavable       : boolean;
		maxTemperature     : number;
		chemicalResistance : {
			acid     : string;
			alkaline : string;
		};
	}

	interface ProductDetails {
		sku              : string;
		material?        : Material;
		technical_specs? : Record<string, string>;
	}

	interface Props {
		product : ProductDetails;
	}

	const { product }: Props = $props();

	// Derived lists of technical spec items
	const techSpecs = $derived(
		product.technical_specs
			? Object.entries( product.technical_specs )
			: []
	);
</script>


<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

	<!-- Material specs sheet -->
	{#if product.material }
		<div class="rounded-2xl border border-brand/10 bg-card p-5 space-y-4">
			<div class="flex items-center gap-2">
				<span class="text-lg">🧪</span>
				<div class="flex flex-col">
					<span class="text-[9px] font-black uppercase tracking-wider text-brand">Componente Físico</span>
					<h5 class="text-sm font-bold text-text">{ product.material.name }</h5>
				</div>
			</div>

			<p class="text-[11px] leading-relaxed text-text-muted">
				{ product.material.description }
			</p>

			<!-- Specific properties grid -->
			<div class="grid grid-cols-2 gap-3 border-t border-brand/5 pt-3 text-[11px]">
				<div class="space-y-0.5">
					<span class="block font-bold text-text-muted">Autoclavable</span>
					<span class="font-semibold text-text uppercase tracking-wider">
						{ product.material.autoclavable ? 'Sí ( 121°C - 134°C )' : 'No' }
					</span>
				</div>
				{#if product.material.maxTemperature }
					<div class="space-y-0.5">
						<span class="block font-bold text-text-muted">Temp. Máxima</span>
						<span class="font-semibold text-text">{ product.material.maxTemperature }°C</span>
					</div>
				{/if}
			</div>

			<!-- Chemical resistance specs -->
			{#if product.material.chemicalResistance }
				<div class="border-t border-brand/5 pt-3 space-y-2">
					<span class="block text-[9px] font-black uppercase tracking-wider text-brand">Resistencia Química</span>
					<div class="grid grid-cols-2 gap-2 text-[10px]">
						<div class="rounded-lg bg-surface px-2.5 py-1 flex justify-between items-center">
							<span class="text-text-muted font-semibold">Ácidos</span>
							<span class="font-bold text-brand capitalize">{ product.material.chemicalResistance.acid }</span>
						</div>
						<div class="rounded-lg bg-surface px-2.5 py-1 flex justify-between items-center">
							<span class="text-text-muted font-semibold">Alcalinos</span>
							<span class="font-bold text-brand capitalize">{ product.material.chemicalResistance.alkaline }</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Dynamic Technical parameters sheet -->
	<div class="rounded-2xl border border-brand/10 bg-card p-5 space-y-4">
		<div class="flex items-center gap-2">
			<span class="text-lg">📏</span>
			<div class="flex flex-col">
				<span class="text-[9px] font-black uppercase tracking-wider text-brand">Ficha Dimensorial</span>
				<h5 class="text-sm font-bold text-text">Especificaciones Físicas</h5>
			</div>
		</div>

		{#if techSpecs.length > 0 }
			<ul class="divide-y divide-brand/5 border-t border-brand/5 text-xs">
				{#each techSpecs as [ key, value ] ( key ) }
					<li class="flex items-center justify-between py-2.5">
						<span class="font-bold capitalize text-text-muted">{ key }</span>
						<span class="font-semibold text-text">{ value }</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-xs italic text-text-muted py-6 text-center">
				No se especifican parámetros adicionales.
			</p>
		{/if}
	</div>

</div>
