<script lang="ts">
	import toast from 'svelte-french-toast';

	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { METHOD }                     from '$lib/services/http-codes';
	import { globalLoadingStore }         from '$lib/state/loading';
	import DashboardModal                 from '../../../components/DashboardModal.svelte';
	import Select                         from '$lib/components/shared/Select.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface CategoryFormProps {
		show        : boolean;
		isEditing   : boolean;
		editingId   : string;
		activeTab   : string; // 'categories' | 'subcategories'
		categories  : ParentCategory[];
		initialData : CategoryInitial | null;
		onSave      : () => void;
		onCancel    : () => void;
	}

	interface ParentCategory {
		id   : string;
		name : string;
	}

	interface CategoryInitial {
		name         : string;
		parentCatId? : string;
	}

	let {
		show,
		isEditing,
		editingId,
		activeTab,
		categories,
		initialData,
		onSave,
		onCancel,
	} : CategoryFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName    = $state( '' );
	let parentCatId = $state( '' );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName    = initialData.name;
			parentCatId = initialData.parentCatId || ( categories[ 0 ]?.id || '' );
		} else if ( show && !initialData ) {
			formName    = '';
			parentCatId = categories[ 0 ]?.id || '';
		}
	} );

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	async function handleSubmit( e : Event ) : Promise<void> {
		e.preventDefault();

		if ( !formName.trim() ) {
			toast.error( 'El nombre es obligatorio.' );
			return;
		}

		$globalLoadingStore = true;
		try {
			const isSub    = activeTab === 'subcategories';
			const path     = isSub ? 'products/categories?type=subcategory' : 'products/categories';
			const endpoint = isEditing ? `${ path }&id=${ editingId }` : path;
			const method   = isEditing ? METHOD.PUT : METHOD.POST;

			const payload = isSub 
				? { name : formName, categoryId : parentCatId } 
				: { name : formName };

			const response = await connectRequest< any >( {
				endpoint,
				method,
				body       : payload,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error: ${ response.message }` );
				return;
			}

			toast.success( isEditing ? 'Modificado con éxito.' : 'Creado con éxito.' );

			onSave();
		} catch ( err ) {
			toast.error( 'Error de red al guardar el registro.' );
		} finally {
			$globalLoadingStore = false;
		}
	}
</script>

<DashboardModal
	{ show }
	title={ ( isEditing ? 'Editar ' : 'Agregar ' ) + ( activeTab === 'categories' ? 'Categoría' : 'Subcategoría' ) }
	onClose={ onCancel }
	maxWidth="max-w-md"
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 font-bold text-text-muted">
			<!-- Parent Category selector for Subcategories -->
			{#if ( activeTab === 'subcategories' )}
				<div class="space-y-1.5">
					<label for="parent-cat-select">Categoría Padre</label>
					<Select
						options={ categories }
						bind:value={ parentCatId }
						multiple={ false }
						placeholder="Seleccionar categoría..."
					/>
				</div>
			{/if}

			<!-- Name input -->
			<div class="space-y-1.5">
				<label for="item-name">Nombre de la { activeTab === 'categories' ? 'Categoría' : 'Subcategoría' }</label>
				<input
					id="item-name"
					type="text"
					bind:value={ formName }
					placeholder="Ej: Reactivos Técnicos"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
				/>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-3 border-t border-brand/10 pt-4">
				<button
					type="button"
					onclick={ onCancel }
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-3 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-colors"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="rounded-xl bg-brand px-5 py-3 font-bold uppercase tracking-wider text-surface-dark shadow-card hover:bg-brand-bright transition-colors"
				>
					Guardar
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
