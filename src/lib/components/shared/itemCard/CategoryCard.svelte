<script lang="ts">
	import TableActions from '../TableActions.svelte';

	interface Option {
		id   : string;
		name : string;
	}

	interface Props {
		itemType        : 'category' | 'subcategory' | 'kit-category' | 'lab-category';
		item            : any;
		openEditModal   : ( item : any ) => void;
		deleteItem      : ( item : any ) => void;
		isDeleteLoading : boolean;
		confirmTitle?   : string;
		confirmMessage? : string;
	}

	let {
		itemType,
		item,
		openEditModal,
		deleteItem,
		isDeleteLoading,
		confirmTitle   = '¿Eliminar elemento?',
		confirmMessage = '¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.'
	} : Props = $props();

	// Derived properties
	const name   = $derived( item.name );
	const active = $derived( item.active ?? true );
</script>

<div class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-5 shadow-card hover:border-brand/35 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-44">
	<div class="space-y-2.5">
		<!-- Header: Item Type & Status -->
		<div class="flex items-center justify-between gap-2">
			<span class="text-[9px] font-black uppercase tracking-wider text-brand/70">
				{#if itemType === 'category'}
					Categoría de Producto
				{:else}
					{ itemType === 'subcategory' ? 'Subcategoría' : itemType === 'kit-category' ? 'Categoría de Kit' : 'Categoría de Laboratorio' }
				{/if}
			</span>

			<span class="rounded-full px-2 py-0.5 text-[9px] font-bold border { active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' : 'bg-rose-500/10 text-rose-500 border-rose-500/15' }">
				{ active ? 'Activo' : 'Inactivo' }
			</span>
		</div>

		<!-- Title -->
		<h3 class="text-base font-semibold leading-snug text-text truncate transition-colors duration-200 group-hover:text-brand">
			{ name }
		</h3>

		<!-- Metadata details based on itemType -->
		<div class="text-[11px] leading-relaxed text-text-muted space-y-1">
			{#if itemType === 'subcategory'}
				<div class="flex items-center gap-1.5 truncate">
					<span class="font-bold text-brand/70 uppercase text-[9px] tracking-wide">Categoría:</span>
					<span class="truncate">{ item.category?.name || 'N/A' }</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Actions -->
	<div class="border-t border-brand/10 pt-3 flex items-center justify-end">
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
