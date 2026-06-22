<script lang="ts">
	import { Trash2, X, Plus } from '@lucide/svelte';
	import toast               from 'svelte-french-toast';
	import Select              from '$lib/components/shared/Select.svelte';
	import InputNumber         from '$lib/components/shared/InputNumber.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface RelationManagerProps {
		items                : any[];
		catalogItems         : any[];
		title                : string;
		placeholder          : string;
		idKey                : string;
		metaKey              : string;
		isEditing            : boolean;
		initialDataRelations : any[] | null | undefined;
		duplicateMessage?    : string;
		onRemove             : ( id : string, name : string ) => void;
		onLoadMore?          : ( ) => void;
		hasMore?             : boolean;
		isLoading?           : boolean;
		onSearchChange?      : ( query : string ) => void;
	}

	let {
		items                = $bindable( [ ] ),
		catalogItems,
		title,
		placeholder,
		idKey,
		metaKey,
		isEditing,
		initialDataRelations = [ ],
		duplicateMessage     = 'Este elemento ya está agregado.',
		onRemove,
		onLoadMore,
		hasMore              = false,
		isLoading            = false,
		onSearchChange,
	} : RelationManagerProps = $props();

	let selectedId = $state( '' );

	const mappedOptions = $derived.by( ( ) => {
		return catalogItems.map( ( item ) => ( {
			id   : item.id,
			name : `[${ item.sku }] ${ item.name }`,
		} ) );
	} );

	function handleAdd() : void {
		if ( !selectedId ) return;

		if ( items.some( ( item ) => item[ idKey ] === selectedId ) ) {
			toast.error( duplicateMessage );
			return;
		}

		const match = catalogItems.find( ( item ) => item.id === selectedId );
		if ( match ) {
			items = [
				...items,
				{
					[ idKey ]   : selectedId,
					quantity    : 1,
					[ metaKey ] : {
						id   : match.id,
						name : match.name,
						sku  : match.sku,
					},
				},
			];
		}
	}

	function isSavedInDatabase( id : string ) : boolean {
		if ( !isEditing || !initialDataRelations ) return false;
		return initialDataRelations.some( ( initial ) => initial[ idKey ] === id );
	}
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 transition-colors h-[290px]">

	<!-- Title legend -->
	<span class="block font-display text-xs font-black tracking-[0.14em] uppercase text-brand opacity-80">
		{ title }
	</span>

	<!-- Selector + Add button row -->
	<div class="flex items-center gap-2">
		<div class="flex-1 min-w-0">
			<Select
				options        = { mappedOptions }
				bind:value     = { selectedId }
				multiple       = { false }
				placeholder    = { placeholder }
				onLoadMore     = { onLoadMore }
				hasMore        = { hasMore }
				isLoading      = { isLoading }
				onSearchChange = { onSearchChange }
			/>
		</div>

		<button
			type     = "button"
			onclick  = { handleAdd }
			title    = "Agregar elemento"
			class    = "flex shrink-0 items-center justify-center gap-1.5 rounded-lg border-none bg-linear-to-tr from-brand via-brand-bright to-brand h-8 w-8 text-white dark:text-brand-dark shadow-[0_0_12px_color-mix(in_srgb,var(--color-brand)_25%,transparent)] transition-all hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-brand)_45%,transparent)] hover:scale-105 cursor-pointer active:scale-95"
		>
			<Plus class="h-3.5 w-3.5" />
		</button>
	</div>

	<!-- Items list -->
	<div class="flex-1 overflow-y-auto flex flex-col gap-1.5 border-t border-brand/10 pt-2">
		{#each items as item ( item[ idKey ] )}
			<div class="flex items-center justify-between rounded-lg border border-brand/10 bg-input px-2.5 py-1.5 text-xs">

				<span class="font-semibold text-text truncate max-w-[50%]">
					{ item[ metaKey ]?.name || '' }
				</span>

				<div class="flex items-center gap-2">
					<!-- Quantity stepper -->
					<InputNumber
                        bind:value={ item.quantity }
                        min     = { 1 }
                        max     = { 10000 }
                        width   = { 'w-12' }
                    />

					<!-- Delete / Remove button -->
					{#if ( isSavedInDatabase( item[ idKey ] ) )}
						<button
							type    = "button"
							onclick = { ( ) => onRemove( item[ idKey ], item[ metaKey ]?.name || '' ) }
							title   = "Eliminar del servidor"
							class   = "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white cursor-pointer"
						>
							<Trash2 class="h-3 w-3" />
						</button>
					{:else}
						<button
							type    = "button"
							onclick = { ( ) => onRemove( item[ idKey ], item[ metaKey ]?.name || '' ) }
							title   = "Quitar temporalmente"
							class   = "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-brand/20 bg-brand/5 text-brand transition-all duration-200 hover:bg-brand hover:text-surface-dark cursor-pointer"
						>
							<X class="h-3 w-3" />
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center text-sm font-medium text-text-muted/60 italic">
				Sin elementos agregados.
			</div>
		{/each}
	</div>
</div>
