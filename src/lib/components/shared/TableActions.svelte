<script lang="ts" generics="T">
	import { Pencil, Trash2 } from '@lucide/svelte';
	import ConfirmationModal  from './ConfirmationModal.svelte';

	interface Props< T > {
		item			: T;
		openEditModal	: ( item : T ) => void;
		deleteItem		: ( item : T ) => void;
		isDeleteLoading	: boolean;
		confirmTitle	: string;
		confirmMessage	: string;
	}

	let {
		item,
		openEditModal,
		deleteItem,
		isDeleteLoading,
		confirmTitle,
		confirmMessage,
	} : Props< T > = $props();

	let showConfirm = $state( false );

	function triggerDelete() : void {
		showConfirm = true;
	}

	function handleConfirm() : void {
		showConfirm = false;
		deleteItem( item );
	}

	function handleCancel() : void {
		showConfirm = false;
	}
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
		onclick  = { triggerDelete }
		disabled = { isDeleteLoading }
		class    = "flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
		title    = "Eliminar"
	>
		{#if ( isDeleteLoading )}
			<div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
		{:else}
			<Trash2 size={ 14 } />
		{/if}
	</button>
</div>

<ConfirmationModal
	show      = { showConfirm }
	title     = { confirmTitle }
	message   = { confirmMessage }
	onConfirm = { handleConfirm }
	onCancel  = { handleCancel }
/>
