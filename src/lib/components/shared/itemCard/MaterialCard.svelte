<script lang="ts">
	import TableActions from '../TableActions.svelte';

	interface Material {
		id					: string;
		name				: string;
		slug				: string;
		description?		: string;
		autoclavable?		: boolean;
		maxTemperature?		: number;
		chemicalResistance	: {
			acid		: string;
			alkaline	: string;
		};
		active				: boolean;
		createdAt			: string;
		updatedAt			: string;
	}

	interface Props {
		item			: Material;
		openEditModal	: ( item : Material ) => void;
		deleteItem		: ( item : Material ) => void;
		isDeleteLoading	: boolean;
		confirmTitle?	: string;
		confirmMessage?	: string;
	}

	let {
		item,
		openEditModal,
		deleteItem,
		isDeleteLoading,
		confirmTitle   = '¿Eliminar material?',
		confirmMessage = '¿Está seguro de que desea eliminar este material? Esta acción no se puede deshacer.'
	} : Props = $props();

	// Derived properties
	const name   = $derived( item.name );
	const active = $derived( item.active ?? true );
</script>

<div class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-5 shadow-card hover:border-brand/35 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-56">
	<div class="space-y-2.5">
		<!-- Header: Item Type & Status -->
		<div class="flex items-center justify-between gap-2">
			<span class="text-[9px] font-black uppercase tracking-wider text-brand/70">
				Material
			</span>

			<span class="rounded-full px-2 py-0.5 text-[9px] font-bold border { active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' : 'bg-rose-500/10 text-rose-500 border-rose-500/15' }">
				{ active ? 'Activo' : 'Inactivo' }
			</span>
		</div>

		<!-- Title -->
		<h3 class="text-base font-semibold leading-snug text-text truncate transition-colors duration-200 group-hover:text-brand">
			{ name }
		</h3>

		<!-- Technical specs -->
		<div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-1 font-semibold text-[11px] leading-relaxed text-text-muted">
			<div class="truncate">
				<span class="text-[9px] font-black uppercase tracking-wider text-brand block">Slug</span>
				<span class="text-xs text-text truncate block font-mono">{ item.slug || 'N/A' }</span>
			</div>
			<div>
				<span class="text-[9px] font-black uppercase tracking-wider text-brand block">Autoclavable</span>
				<span class="text-xs text-text block">{ item.autoclavable ? 'Sí' : 'No' }</span>
			</div>
			<div class="truncate">
				<span class="text-[9px] font-black uppercase tracking-wider text-brand block">Temp. Máx</span>
				<span class="text-xs text-text truncate block">{ item.maxTemperature ? `${ item.maxTemperature }°C` : 'N/A' }</span>
			</div>
			<div class="truncate">
				<span class="text-[9px] font-black uppercase tracking-wider text-brand block">Resist. Química</span>
				<span class="text-xs text-text truncate block text-[10px]">
					Ác: { item.chemicalResistance?.acid || 'N/A' } | Al: { item.chemicalResistance?.alkaline || 'N/A' }
				</span>
			</div>
		</div>
	</div>

	<!-- Actions -->
	<div class="border-t border-brand/10 pt-3.5 mt-2 flex items-center justify-end">
		<TableActions
			{ item }
			{ openEditModal }
			{ deleteItem }
			{ isDeleteLoading }
			confirmTitle={ confirmTitle }
			confirmMessage={ confirmMessage }
		/>
	</div>
</div>
