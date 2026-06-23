<script lang="ts">
	import {
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

	import FileUploader, {
		type UploadedFileItem
	}                                       from '$lib/components/shared/Inputs/FileUploader.svelte';
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import ProductSelectManager             from '$lib/components/shared/ProductSelectManager.svelte';
	import Select                           from '$lib/components/shared/Inputs/Select.svelte';
	import IdentificationFields             from '$lib/components/shared/Inputs/IdentificationFields.svelte';
	import StockPriceFields                 from '$lib/components/shared/Inputs/StockPriceFields.svelte';
	import type { KitInitial, KitProduct }  from '$lib/types/kit';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import DashboardModal                   from '../../components/DashboardModal.svelte';
	import ConfirmationModal                from '../../../../lib/components/shared/ConfirmationModal.svelte';

	interface KitCategory {
		id   : string;
		name : string;
	}

	interface KitFormProps {
		show        : boolean;
		isEditing   : boolean;
		editingId   : string;
		initialData : KitInitial | null;
		categories  : KitCategory[];
		onSave      : () => void;
		onCancel    : () => void;
	}

	let {
		show,
		isEditing,
		editingId,
		initialData,
		categories,
		onSave,
		onCancel,
	} : KitFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName        = $state( '' );
	let formSku         = $state( '' );
	let formDescription = $state( '' );
	let formCategoryId  = $state( '' );
	let formActive      = $state( true );

	// Error states
	let nameError       = $state( '' );
	let skuError        = $state( '' );
	let categoryError   = $state( '' );

	// Inventory & Price states
	let currentPrice      = $state<number | null>( null );
	let currentStock      = $state<number | null>( null );
	let minStock          = $state<number | null>( null );
	let maxStock          = $state<number | null>( null );

	// Error states for price and stocks
	let priceError        = $state( '' );
	let currentStockError = $state( '' );
	let minStockError     = $state( '' );
	let maxStockError     = $state( '' );

	// Relations list state (Selected products in this kit)
	let formProducts    = $state< KitProduct[] >( [] );

	// File Uploader state
	let uploaderFiles     = $state< UploadedFileItem[] >( [] );
	let uploaderFilesInfo = $state( '' );
	let filesError        = $state( '' );

	$effect( () => {
		if ( uploaderFiles.length > 0 ) {
			filesError = '';
		}
	} );

	// Modales de creación rápida
	let showCategoryModal = $state( false );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName          = initialData.name;
			formSku           = initialData.sku;
			formDescription   = initialData.description;
			formCategoryId    = initialData.categoryId || '';
			formActive        = initialData.active;
			formProducts      = initialData.products || [];
			currentPrice      = initialData.currentPrice    ?? null;
			currentStock      = initialData.currentStock    ?? null;
			minStock          = initialData.minStock        ?? null;
			maxStock          = initialData.maxStock        ?? null;
			if ( isEditing && initialData.files ) {
				uploaderFiles = initialData.files.map( ( f ) => ( {
					id             : f.id,
					preview        : f.url,
					alt            : f.alt || '',
					isMain         : f.isMain,
					order          : f.order,
					attachmentType : f.attachmentType,
				} ) );
			} else {
				uploaderFiles = [];
			}
			uploaderFilesInfo = '';
			nameError         = '';
			skuError          = '';
			categoryError     = '';
			filesError        = '';
		} else if ( show && !initialData ) {
			formName          = '';
			formSku           = '';
			formDescription   = '';
			formCategoryId    = '';
			formActive        = true;
			formProducts      = [];
			currentPrice      = null;
			currentStock      = null;
			minStock          = null;
			maxStock          = null;
			uploaderFiles     = [];
			uploaderFilesInfo = '';
			nameError         = '';
			skuError          = '';
			categoryError     = '';
			priceError        = '';
			currentStockError = '';
			minStockError     = '';
			maxStockError     = '';
			filesError        = '';
		}
	} );

	// ─── Relation Helpers ─────────────────────────────────────────────────────────

	let productToDelete = $state<{ productId : string; name : string } | null>( null );

	function handleRemoveProduct( productId : string, name : string ) : void {
		if ( isEditing && initialData?.products.some( ( p ) => p.productId === productId ) ) {
			// Product is already saved in the database, require confirmation & server delete
			productToDelete = { productId, name };
		} else {
			// Local temporary product, remove immediately
			formProducts = formProducts.filter( ( p ) => p.productId !== productId );
		}
	}

	function confirmDeleteProduct( ) : void {
		if ( !productToDelete ) return;
		deleteProductMutation.mutate( {
			kitId     : editingId,
			productId : productToDelete.productId,
		}, {
			onSuccess : ( ) => {
				productToDelete = null;
			}
		} );
	}

	// ─── TanStack Query client & mutations ────────────────────────────────────────
	const queryClient = useQueryClient();

	const kitMutation = createMutation( ( ) => ( {
		mutationFn : async ( { isEditing, editingId, formData } : { isEditing : boolean; editingId : string; formData : FormData } ) : Promise< any > => {
			const endpoint = isEditing ? `${ INTERNAL_ENDPOINTS.KITS.BASE }?id=${ editingId }` : INTERNAL_ENDPOINTS.KITS.BASE;
			const method   = isEditing ? METHOD.PUT : METHOD.POST;

			const response = await connectRequest< any >( {
				endpoint   : endpoint,
				method     : method,
				body       : formData,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( ) => {
			toast.success( isEditing ? 'Kit editado con éxito.' : 'Kit creado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-kits' ] } );
			onSave( );
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al guardar.' );
		},
	} ) );

	const deleteProductMutation = createMutation( ( ) => ( {
		mutationFn : async ( { kitId, productId } : { kitId : string; productId : string } ) : Promise< any > => {
			const response = await connectRequest< any >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.KITS.BASE }?id=${ kitId }&productId=${ productId }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( data, variables ) => {
			toast.success( 'Producto eliminado del kit con éxito.' );
			formProducts = formProducts.filter( ( p ) => p.productId !== variables.productId );
			queryClient.invalidateQueries( { queryKey : [ 'admin-kits' ] } );
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al eliminar el producto.' );
		},
	} ) );

	$effect( ( ) => {
		$globalLoadingStore = kitMutation.isPending || deleteProductMutation.isPending;
		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	function handleSubmit( e : Event ) : void {
		e.preventDefault();

		nameError     = '';
		skuError      = '';
		categoryError = '';
		let hasError  = false;

		if ( priceError || currentStockError || minStockError || maxStockError ) {
			hasError = true;
		}

		if ( !formName.trim() ) {
			nameError = 'El nombre es obligatorio.';
			hasError  = true;
		}

		if ( !formSku.trim() ) {
			skuError = 'El SKU es obligatorio.';
			hasError = true;
		}

		if ( !formCategoryId ) {
			categoryError = 'La categoría es obligatoria.';
			hasError      = true;
		}

		if ( uploaderFiles.length === 0 ) {
			filesError = 'Debe subir al menos un archivo.';
			hasError   = true;
		}

		if ( hasError ) {
			return;
		}

		const formData = new FormData();
		formData.append( 'name', formName );
		formData.append( 'sku', formSku );
		formData.append( 'description', formDescription );
		formData.append( 'categoryId', formCategoryId );
		formData.append( 'active', String( formActive ) );

		if ( currentPrice !== null ) formData.append( 'currentPrice', String( currentPrice ) );
		if ( currentStock !== null ) formData.append( 'currentStock', String( currentStock ) );
		if ( minStock !== null ) formData.append( 'minStock', String( minStock ) );
		if ( maxStock !== null ) formData.append( 'maxStock', String( maxStock ) );

		// Format products relation info
		const mappedRelations = formProducts.map( ( p ) => ( {
			productId	: p.productId,
			quantity	: Number( p.quantity ) || 1,
		} ) );
		formData.append( 'products', JSON.stringify( mappedRelations ) );

		// Images
		formData.append( 'filesInfo', uploaderFilesInfo || '[]' );
		uploaderFiles.forEach( ( u ) => {
			if ( u.file ) {
				formData.append( 'files', u.file );
			}
		} );

		kitMutation.mutate( { isEditing, editingId, formData } );
	}
</script>

<DashboardModal
	{ show }
	title            = { isEditing ? 'Modificar Kit' : 'Crear Nuevo Kit' }
	onClose          = { onCancel }
	maxWidth         = "max-w-6xl"
	overflowVisible  = { true }
>
	{#snippet body()}
		<form
			onsubmit={ handleSubmit }
			class="flex flex-col gap-5 text-[0.8125rem] font-semibold text-text-muted"
		>

			<!-- ── Two-panel grid: fields left / uploader right ── -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

				<!-- ── LEFT PANEL: Fields ── -->
				<div class="flex flex-col gap-3">

					<IdentificationFields
						bind:name       = { formName }
						bind:sku        = { formSku }
						nameError       = { nameError }
						skuError        = { skuError }
						nameLabel       = "Nombre del Kit"
						namePlaceholder = "Ej: Kit de Bioquímica Básica"
						skuPlaceholder  = "Ej: CKIT-001"
						idPrefix        = "kit"
						delay           = "0ms"
					/>

					<StockPriceFields
						bind:currentPrice      = { currentPrice }
						bind:currentStock      = { currentStock }
						bind:minStock          = { minStock }
						bind:maxStock          = { maxStock }
						bind:priceError        = { priceError }
						bind:currentStockError = { currentStockError }
						bind:minStockError     = { minStockError }
						bind:maxStockError     = { maxStockError }
						delay                  = "30ms"
					/>

					<!-- Section: Descripción -->
					<fieldset
						class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 60ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Descripción
						</legend>

                        <div class="flex flex-col gap-1">
							<label class="sr-only" for="kit-desc">Descripción Completa del Kit</label>

                            <RichTextEditor bind:html={ formDescription } />
						</div>
					</fieldset>

					<!-- Section: Clasificación (z-index elevado para que el dropdown no quede por debajo) -->
					<fieldset
						class="fade-in relative z-10 m-0 overflow-visible rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 120ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Clasificación
						</legend>
						<div class="flex flex-col gap-1">
							<div class="flex items-center justify-between">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="kit-category">
									Categoría Científica
								</label>
								<button
									type="button"
									onclick={ ( ) => { showCategoryModal = true; } }
									class="cursor-pointer text-brand hover:text-brand-bright transition-colors text-[0.65rem] font-black uppercase tracking-wider"
								>
									+ Crear Categoría
								</button>
							</div>
							<Select
								options     = { categories }
								bind:value  = { formCategoryId }
								multiple    = { false }
								placeholder = "Seleccionar categoría..."
								hasError    = { !!categoryError }
							/>
							{#if ( categoryError )}
								<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ categoryError }</p>
							{/if}
						</div>
					</fieldset>

					<!-- Section: Productos Incluidos -->
					<div class="fade-in" style="--delay: 180ms">
						<ProductSelectManager
							bind:items           = { formProducts }
							isEditing            = { isEditing }
							initialDataRelations = { initialData?.products }
							onRemove             = { handleRemoveProduct }
						/>
					</div>
				</div>

				<!-- ── RIGHT PANEL: File Uploader ── -->
				<div class="fade-in flex flex-col" style="--delay: 80ms">
					<p class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
						Carga de Imágenes Catálogo
					</p>
					<FileUploader
						bind:files     = { uploaderFiles }
						bind:filesInfo = { uploaderFilesInfo }
						isEditing      = { isEditing }
						error          = { filesError }
					/>
				</div>
			</div>

			<!-- ── Footer: Toggle + Actions ── -->
			<div
				class="fade-in flex flex-col gap-3 border-t border-brand/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
				style="--delay: 220ms"
			>
				<!-- Custom toggle -->
				<label class="flex cursor-pointer select-none items-center gap-2.5" for="kit-active">
					<!-- Track -->
					<span
						class="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-all duration-200 { formActive ? 'bg-brand/30 border-brand' : 'bg-input border-brand/20' }"
					>
						<input
							id="kit-active"
							type="checkbox"
							bind:checked={ formActive }
							class="sr-only"
						/>
						<!-- Thumb -->
						<span
							class="absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full transition-all duration-200 { formActive ? 'translate-x-4 bg-brand shadow-[0_0_8px_rgba(0,230,118,0.55)]' : 'bg-text-muted translate-x-0' }"
						></span>
					</span>
					<!-- Label text -->
					<span
						class="text-[0.72rem] font-bold tracking-wide transition-colors duration-200"
						class:text-brand={ formActive }
						class:text-text-muted={ !formActive }
					>
						{ formActive ? 'Habilitado en Catálogo Público' : 'Deshabilitado del Catálogo' }
					</span>
				</label>

				<!-- Action buttons -->
				<div class="flex items-center gap-2.5">
					<button
						type     = "button"
						onclick  = { onCancel }
						disabled = { kitMutation.isPending }
						class    = "cursor-pointer rounded-lg border border-brand/20 bg-card/70 px-4 py-1.5 font-display text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted transition-all hover:border-brand/35 hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-45"
					>
						Cancelar
					</button>
					<button
						type     = "submit"
						disabled = { kitMutation.isPending }
						class    = "flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-linear-to-tr from-brand via-brand-bright to-brand px-5 py-1.5 font-display text-[0.7rem] font-black uppercase tracking-[0.08em] text-white dark:text-brand-dark shadow-[0_0_16px_color-mix(in_srgb,var(--color-brand)_30%,transparent)] transition-all hover:shadow-[0_0_26px_color-mix(in_srgb,var(--color-brand)_50%,transparent)] disabled:cursor-not-allowed disabled:opacity-55"
					>
						{#if kitMutation.isPending}
							<span class="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
							Guardando…
						{:else}
							{ isEditing ? 'Guardar Cambios' : 'Guardar Kit' }
						{/if}
					</button>
				</div>
			</div>
		</form>
	{/snippet}
</DashboardModal>

{#if ( showCategoryModal )}
	<CategoryFormModal
		show={ showCategoryModal }
		isEditing={ false }
		editingId=""
		context="kits"
		initialData={ null }
		onSave={ ( ) => {
			showCategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'kit-categories' ] } );
		} }
		onCancel={ ( ) => {
			showCategoryModal = false;
		} }
	/>
{/if}

<ConfirmationModal
	show        = { productToDelete !== null }
	title       = "Confirmar Eliminación"
	message     = { `¿Estás seguro de que deseas eliminar "${ productToDelete?.name }" de este kit? Esta acción no se puede deshacer.` }
	confirmText = "Eliminar"
	onConfirm   = { confirmDeleteProduct }
	onCancel    = { ( ) => { productToDelete = null; } }
	isPending   = { deleteProductMutation.isPending }
/>

<style>
	/* Solo el keyframe de entrada — no es posible definirlo con Tailwind sin modificar la config global */
	@keyframes fadeSlideUp {
		from { opacity: 0; transform: translateY( 8px ); }
		to   { opacity: 1; transform: translateY( 0 ); }
	}

	.fade-in {
		animation       : fadeSlideUp 0.35s ease both;
		animation-delay : var( --delay, 0ms );
	}
</style>
