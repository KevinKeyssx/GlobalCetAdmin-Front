<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import DashboardModal                   from '../../../routes/dashboard/components/DashboardModal.svelte';
	import Select                           from './Select.svelte';
	import InputText                        from './InputText.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface ParentCategory {
		id   : string;
		name : string;
	}

	interface CategoryInitial {
		name         : string;
		parentCatId? : string;
		active?      : boolean;
	}

	interface CategoryFormProps {
		show        : boolean;
		isEditing   : boolean;
		editingId   : string;
		context     : 'products' | 'kits' | 'labs';
		activeTab?  : string; // 'categories' | 'subcategories'
		categories? : ParentCategory[];
		initialData : CategoryInitial | null;
		onSave      : () => void;
		onCancel    : () => void;
	}

	let {
		show,
		isEditing,
		editingId,
		context,
		activeTab = 'categories',
		categories = [],
		initialData,
		onSave,
		onCancel,
	} : CategoryFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName    = $state( '' );
	let parentCatId = $state( '' );
	let formActive  = $state( true );

	// Error states
	let nameError   = $state( '' );
	let parentError = $state( '' );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName    = initialData.name;
			parentCatId = initialData.parentCatId || ( categories[ 0 ]?.id || '' );
			formActive  = initialData.active !== undefined ? initialData.active : true;
			nameError   = '';
			parentError = '';
		} else if ( show && !initialData ) {
			formName    = '';
			parentCatId = categories[ 0 ]?.id || '';
			formActive  = true;
			nameError   = '';
			parentError = '';
		}
	} );

	// ─── Derived Variables for dynamic texts ──────────────────────────────────────
	const isSub = $derived( context === 'products' && activeTab === 'subcategories' );

	const title = $derived.by( () => {
		if ( context === 'products' ) {
			const label = activeTab === 'categories' ? 'Categoría' : 'Subcategoría';
			return ( isEditing ? 'Editar ' : 'Agregar ' ) + label;
		}
		const contextLabel = context === 'kits' ? 'de Kits' : 'de Laboratorio';
		return isEditing ? 'Modificar Categoría' : `Nueva Categoría ${ contextLabel }`;
	} );

	const nameLabel = $derived.by( () => {
		if ( context === 'products' ) {
			return `Nombre de la ${ activeTab === 'categories' ? 'Categoría' : 'Subcategoría' }`;
		}
		return 'Nombre de la Categoría';
	} );

	const namePlaceholder = $derived.by( () => {
		if ( context === 'products' ) {
			return 'Ej: Reactivos Técnicos';
		}
		if ( context === 'kits' ) {
			return 'Ej: Química Avanzada';
		}
		return 'Ej: Química e Insumos';
	} );

	// ─── TanStack Query client & mutation ─────────────────────────────────────────
	const queryClient = useQueryClient();

	const categoryMutation = createMutation( () => ( {
		mutationFn : async ( {
			isEditing,
			editingId,
			context,
			activeTab,
			formName,
			parentCatId,
			formActive,
		} : {
			isEditing   : boolean;
			editingId   : string;
			context     : 'products' | 'kits' | 'labs';
			activeTab?  : string;
			formName    : string;
			parentCatId : string;
			formActive  : boolean;
		} ) : Promise< any > => {
			let endpoint   = '';
			let body : any = {
				name   : formName,
				active : formActive,
			};

			if ( context === 'products' ) {
				const isSub    = activeTab === 'subcategories';
				const path     = isSub ? `${ INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.BASE }?type=subcategory` : INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.BASE;
				endpoint       = isEditing ? `${ path }${ isSub ? '&' : '?' }id=${ editingId }` : path;
				if ( isSub ) {
					body = {
						name       : formName,
						categoryId : parentCatId,
						active     : formActive,
					};
				}
			} else if ( context === 'kits' ) {
				endpoint = isEditing ? `${ INTERNAL_ENDPOINTS.KITS.CATEGORIES.BASE }?id=${ editingId }` : INTERNAL_ENDPOINTS.KITS.CATEGORIES.BASE;
			} else if ( context === 'labs' ) {
				endpoint = isEditing ? `${ INTERNAL_ENDPOINTS.LABS.CATEGORIES.BASE }?id=${ editingId }` : INTERNAL_ENDPOINTS.LABS.CATEGORIES.BASE;
			}

			// We call our internal SvelteKit endpoint using PUT (which SvelteKit PUT handler will forward as PATCH to the backend)
			const method = isEditing ? METHOD.PUT : METHOD.POST;

			const response = await connectRequest< any >( {
				endpoint,
				method,
				body,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : () => {
			const successMsg = isEditing ? 'Modificado con éxito.' : 'Creado con éxito.';
			toast.success( successMsg );

			// Invalidate appropriate queries
			if ( context === 'products' ) {
				queryClient.invalidateQueries( { queryKey : [ 'categories' ] } );
				queryClient.invalidateQueries( { queryKey : [ 'subcategories' ] } );
			} else if ( context === 'kits' ) {
				queryClient.invalidateQueries( { queryKey : [ 'kit-categories' ] } );
			} else if ( context === 'labs' ) {
				queryClient.invalidateQueries( { queryKey : [ 'lab-categories' ] } );
			}

			onSave();
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al guardar.' );
		},
	} ) );

	$effect( () => {
		$globalLoadingStore = categoryMutation.isPending;
		return () => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	function handleSubmit( e : Event ) : void {
		e.preventDefault();

		nameError   = '';
		parentError = '';
		let hasError = false;

		if ( !formName.trim() ) {
			nameError = 'El nombre es obligatorio.';
			hasError  = true;
		}

		if ( isSub && !parentCatId ) {
			parentError = 'La categoría padre es obligatoria.';
			hasError    = true;
		}

		if ( hasError ) {
			return;
		}

		categoryMutation.mutate( {
			isEditing,
			editingId,
			context,
			activeTab,
			formName,
			parentCatId,
			formActive,
		} );
	}
</script>

<DashboardModal
	{ show }
	{ title }
	onClose={ onCancel }
	maxWidth="max-w-md"
	overflowVisible={ true }
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 font-bold text-text-muted">
			<!-- Parent Category selector for Subcategories -->
			{#if ( isSub && categories.length > 0 )}
				<div class="space-y-1.5">
					<label for="parent-cat-select">Categoría Padre</label>
					<Select
						options={ categories }
						bind:value={ parentCatId }
						multiple={ false }
						placeholder="Seleccionar categoría..."
						hasError={ !!parentError }
					/>
					{#if ( parentError )}
						<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ parentError }</p>
					{/if}
				</div>
			{/if}

			<!-- Name input -->
			<div class="space-y-1.5">
				<label for="item-name">
					{ nameLabel }
				</label>
				<InputText
					id="item-name"
					bind:value={ formName }
					error={ nameError }
					placeholder={ namePlaceholder }
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
				/>
			</div>

			<!-- Estado Activo -->
			<div class="flex items-center gap-3 pt-2">
				<input
					id="item-active"
					type="checkbox"
					bind:checked={ formActive }
					class="accent-brand h-4 w-4 cursor-pointer"
				/>
				<label for="item-active" class="cursor-pointer select-none">Estado Activo</label>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-3 border-t border-brand/10 pt-4">
				<button
					type="button"
					onclick={ onCancel }
					disabled={ categoryMutation.isPending }
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-3 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={ categoryMutation.isPending }
					class="rounded-xl bg-brand px-5 py-3 font-bold uppercase tracking-wider text-surface-dark shadow-card hover:bg-brand-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{ categoryMutation.isPending ? 'Guardando...' : 'Guardar' }
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
