<script lang="ts" generics="T">
	import { Pencil, Trash2, TrendingUp } from '@lucide/svelte';
	import ConfirmationModal              from './ConfirmationModal.svelte';
	import DuplicateButton                from './DuplicateButton.svelte';

	interface Props< T > {
		item            : T;
		openEditModal   : ( item : T ) => void;
		deleteItem      : ( item : T ) => void;
		isDeleteLoading : boolean;
		confirmTitle    : string;
		confirmMessage  : string;
		color?          : boolean;
		itemType?       : 'product' | 'kit' | 'lab';
		showDuplicate?  : boolean;
		showHistory?    : boolean;
		onViewHistory?  : ( item : T ) => void;
	}

	let {
		item,
		openEditModal,
		deleteItem,
		isDeleteLoading,
		confirmTitle,
		confirmMessage,
		color         = false,
		itemType,
		showDuplicate = false,
		showHistory   = false,
		onViewHistory
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

<div class="flex items-center justify-end gap-1.5">
	{#if ( showDuplicate && itemType )}
		<DuplicateButton
			{ item }
			{ itemType }
			class = "flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 { color ? 'bg-brand/80 text-white' : 'bg-brand/10 text-brand' } transition-all duration-200 hover:bg-brand hover:text-surface-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
		/>
	{/if}

	{#if ( showHistory && onViewHistory )}
		<button
			onclick = { ( ) => onViewHistory( item ) }
			class   = "flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 { color ? 'bg-brand/80 text-white' : 'bg-brand/10 text-brand' } transition-all duration-200 hover:bg-brand hover:text-surface-dark cursor-pointer"
			title   = "Historial de Precios"
		>
			<TrendingUp size={ 14 } />
		</button>
	{/if}

	<button
		onclick = { () => openEditModal( item ) }
		class   = "flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 { color ? 'bg-brand/80 text-white' : 'bg-brand/10 text-brand' } transition-all duration-200 hover:bg-brand hover:text-surface-dark cursor-pointer"
		title   = "Editar"
	>
		<Pencil size={ 14 } />
	</button>

	<button
		onclick  = { triggerDelete }
		disabled = { isDeleteLoading }
		class    = "flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 { color ? 'bg-red-500/80 text-white' : 'bg-red-500/10 text-red-400' } transition-all duration-200 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
