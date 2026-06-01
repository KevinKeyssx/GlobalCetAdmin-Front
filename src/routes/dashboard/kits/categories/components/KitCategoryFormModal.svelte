<script lang="ts">
	import toast from 'svelte-french-toast';

	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { METHOD }                     from '$lib/services/http-codes';
	import { globalLoadingStore }         from '$lib/state/loading';
	import DashboardModal                 from '../../../components/DashboardModal.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface KitCategoryFormProps {
		show        : boolean;
		isEditing   : boolean;
		editingId   : string;
		initialData : KitCategoryInitial | null;
		onSave      : () => void;
		onCancel    : () => void;
	}

	interface KitCategoryInitial {
		name : string;
	}

	let {
		show,
		isEditing,
		editingId,
		initialData,
		onSave,
		onCancel,
	} : KitCategoryFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName = $state( '' );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName = initialData.name;
		} else if ( show && !initialData ) {
			formName = '';
		}
	} );

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	async function handleSubmit( e : Event ) : Promise<void> {
		e.preventDefault();

		if ( !formName.trim() ) {
			toast.error( 'El nombre de la categoría es obligatorio.' );
			return;
		}

		$globalLoadingStore = true;
		try {
			const endpoint = isEditing ? `kits/categories?id=${ editingId }` : 'kits/categories';
			const method   = isEditing ? METHOD.PUT : METHOD.POST;

			const response = await connectRequest< any >( {
				endpoint,
				method,
				body       : { name : formName },
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error: ${ response.message }` );
				return;
			}

			toast.success( isEditing ? 'Categoría modificada con éxito.' : 'Categoría agregada con éxito.', {
				style : 'background: #111f18; color: #00e676; border: 1px solid rgba(0, 230, 118, 0.2); font-family: Outfit;',
			} );

			onSave();
		} catch ( err ) {
			toast.error( 'Error de red al guardar la categoría.' );
		} finally {
			$globalLoadingStore = false;
		}
	}
</script>

<DashboardModal
	{ show }
	title={ isEditing ? 'Modificar Categoría' : 'Nueva Categoría de Kits' }
	onClose={ onCancel }
	maxWidth="max-w-md"
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 text-xs font-bold text-text-muted">
			<!-- Name -->
			<div class="space-y-1.5">
				<label for="cat-name">Nombre de la Categoría</label>
				<input
					id="cat-name"
					type="text"
					bind:value={ formName }
					placeholder="Ej: Química Avanzada"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-xs text-text outline-none focus:border-brand focus:bg-card"
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
