<script lang="ts" generics="T">
	import { Pencil, Trash2 } from '@lucide/svelte';

	interface Props<T> {
		item          : T;
		openEditModal : ( item : T ) => void;
		deleteItem    : ( item : T ) => void;
	}

	let {
        item,
        openEditModal,
        deleteItem
    } : Props<T> = $props();
</script>

<div class="flex items-center justify-end gap-2">
	<button
		onclick = { () => openEditModal( item ) }
		class   = "flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-all duration-200 hover:bg-brand hover:text-surface-dark"
		title   = "Editar"
	>
		<Pencil size={ 14 } />
	</button>

	<button
		onclick = { () => deleteItem( item ) }
		class   = "flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white"
		title   = "Eliminar"
	>
		<Trash2 size={ 14 } />
	</button>
</div>
