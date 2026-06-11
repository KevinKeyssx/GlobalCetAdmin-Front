<script lang="ts">
	import {
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

	import FileUploader, {
        type UploadedFileItem
    }                                       from '$lib/components/shared/FileUploader.svelte';
	import type {
        LabInitial,
        LabProduct,
        LabKit
    }                                       from '$lib/types/lab';
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import DashboardModal                   from '../../components/DashboardModal.svelte';
	import ConfirmationModal                from '$lib/components/shared/ConfirmationModal.svelte';
	import RelationManager                  from '$lib/components/shared/RelationManager.svelte';
	import Select                           from '$lib/components/shared/Select.svelte';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import InputText                        from '$lib/components/shared/InputText.svelte';
	import InputNumber                      from '$lib/components/shared/InputNumber.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface LabCategory {
		id   : string;
		name : string;
	}

	interface CatalogProduct {
		id   : string;
		name : string;
		sku  : string;
	}

	interface CatalogKit {
		id   : string;
		name : string;
		sku  : string;
	}

	interface LabFormProps {
		show            : boolean;
		isEditing       : boolean;
		editingId       : string;
		initialData     : LabInitial | null;
		categories      : LabCategory[];
		catalogProducts : CatalogProduct[];
		catalogKits     : CatalogKit[];
		onSave          : () => void;
		onCancel        : () => void;
	}

	let {
		show,
		isEditing,
		editingId,
		initialData,
		categories,
		catalogProducts,
		catalogKits,
		onSave,
		onCancel,
	} : LabFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName        = $state( '' );
	let formSku         = $state( '' );
	let formDescription = $state( '' );
	let formCategoryId  = $state( '' );
	let formActive      = $state( true );

	// Dimensions sub-states
	let dimLength = $state( 0 );
	let dimWidth  = $state( 0 );
	let dimHeight = $state( 0 );

	const formDimensions = $derived( `${ dimLength }m x ${ dimWidth }m x ${ dimHeight }m` );

	// Error states
	let nameError       = $state( '' );
	let skuError        = $state( '' );
	let categoryError   = $state( '' );

	function parseDimensions( dimStr: string ): { length: number; width: number; height: number } {
		const regex = /^\s*([0-9.]+)\s*m\s*x\s*([0-9.]+)\s*m\s*x\s*([0-9.]+)\s*m\s*$/i;
		const match = dimStr.match( regex );

        if ( match ) {
			return {
				length : parseFloat( match[ 1 ] ) || 0,
				width  : parseFloat( match[ 2 ] ) || 0,
				height : parseFloat( match[ 3 ] ) || 0,
			};
		}

        return {
			length : 0,
			width  : 0,
			height : 0,
		};
	}

	// Relations list state (Selected products and kits in this lab)
	let formProducts      = $state< LabProduct[] >( [] );
	let formKits          = $state< LabKit[] >( [] );
	let uploaderFiles     = $state< UploadedFileItem[] >( [] );// File Uploader state
	let uploaderFilesInfo = $state( '' );

	// Modales de creación rápida
	let showCategoryModal = $state( false );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName          = initialData.name;
			formSku           = initialData.sku;
			formDescription   = initialData.description;
			const parsed      = parseDimensions( initialData.dimensions );
			dimLength         = parsed.length;
			dimWidth          = parsed.width;
			dimHeight         = parsed.height;
			formCategoryId    = initialData.categoryId || '';
			formActive        = initialData.active;
			formProducts      = initialData.products || [];
			formKits          = initialData.kits || [];
			if ( isEditing && initialData.files ) {
				uploaderFiles = initialData.files.map( ( f ) => ( {
					id		: f.id,
					preview	: f.url,
					alt		: f.alt || '',
					isMain	: f.isMain,
					order	: f.order,
				} ) );
			} else {
				uploaderFiles = [];
			}
			uploaderFilesInfo = '';
			nameError         = '';
			skuError          = '';
			categoryError     = '';
		} else if ( show && !initialData ) {
			formName          = '';
			formSku           = '';
			formDescription   = '';
			const parsed      = parseDimensions( '' );
			dimLength         = parsed.length;
			dimWidth          = parsed.width;
			dimHeight         = parsed.height;
			formCategoryId    = '';
			formActive        = true;
			formProducts      = [];
			formKits          = [];
			uploaderFiles     = [];
			uploaderFilesInfo = '';
			nameError         = '';
			skuError          = '';
			categoryError     = '';
		}
	} );

	// ─── Relation Helpers ─────────────────────────────────────────────────────────

	let productToDelete = $state<{ productId : string; name : string } | null>( null );
	let kitToDelete     = $state<{ kitId : string; name : string } | null>( null );

	function removeProductFromForm( id : string, name : string ) : void {
		if ( isEditing && initialData?.products?.some( ( p ) => p.productId === id ) ) {
			productToDelete = { productId : id, name };
		} else {
			formProducts = formProducts.filter( ( p ) => p.productId !== id );
		}
	}

	function removeKitFromForm( id : string, name : string ) : void {
		if ( isEditing && initialData?.kits?.some( ( k ) => k.kitId === id ) ) {
			kitToDelete = { kitId : id, name };
		} else {
			formKits = formKits.filter( ( k ) => k.kitId !== id );
		}
	}

	function confirmDeleteProduct() : void {
		if ( !productToDelete ) return;
		deleteProductMutation.mutate( {
			labId     : editingId,
			productId : productToDelete.productId,
		}, {
			onSuccess : () => {
				productToDelete = null;
			}
		} );
	}

	// ─── TanStack Query client & mutation ─────────────────────────────────────────
	const queryClient = useQueryClient();

	const labMutation = createMutation( () => ( {
		mutationFn : async ( { isEditing, editingId, formData } : { isEditing : boolean; editingId : string; formData : FormData } ) : Promise< any > => {
			const endpoint = isEditing ? `labs?id=${ editingId }` : 'labs';
			const method   = isEditing ? METHOD.PUT : METHOD.POST;

			const response = await connectRequest< any >( {
				endpoint	: endpoint,
				method		: method,
				body		: formData,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess : () => {
			toast.success( isEditing ? 'Laboratorio editado con éxito.' : 'Laboratorio creado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-labs' ] } );
			onSave();
		},
		onError : ( error : any ) => {
			toast.error( error.message || 'Error al guardar.' );
		},
	} ) );

	const deleteProductMutation = createMutation( () => ( {
		mutationFn : async ( { labId, productId } : { labId : string; productId : string } ) : Promise< any > => {
			const response = await connectRequest< any >( {
				endpoint	: `labs?id=${ labId }&productId=${ productId }`,
				method		: METHOD.DELETE,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( data, variables ) => {
			toast.success( 'Producto eliminado del laboratorio con éxito.' );
			formProducts = formProducts.filter( ( p ) => p.productId !== variables.productId );
			queryClient.invalidateQueries( { queryKey : [ 'admin-labs' ] } );
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al eliminar el producto.' );
		},
	} ) );

	const deleteKitMutation = createMutation( () => ( {
		mutationFn : async ( { labId, kitId } : { labId : string; kitId : string } ) : Promise< any > => {
			const response = await connectRequest< any >( {
				endpoint	: `labs?id=${ labId }&kitId=${ kitId }`,
				method		: METHOD.DELETE,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( data, variables ) => {
			toast.success( 'Kit eliminado del laboratorio con éxito.' );
			formKits = formKits.filter( ( k ) => k.kitId !== variables.kitId );
			queryClient.invalidateQueries( { queryKey : [ 'admin-labs' ] } );
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al eliminar el kit.' );
		},
	} ) );

	function confirmDeleteKit() : void {
		if ( !kitToDelete ) return;
		deleteKitMutation.mutate( {
			labId : editingId,
			kitId : kitToDelete.kitId,
		}, {
			onSuccess : () => {
				kitToDelete = null;
			}
		} );
	}

	$effect( () => {
		$globalLoadingStore = labMutation.isPending || deleteProductMutation.isPending || deleteKitMutation.isPending;
		return () => {
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

		if ( hasError ) {
			return;
		}

		const formData = new FormData();
		formData.append( 'name', formName );
		formData.append( 'sku', formSku );
		formData.append( 'description', formDescription );
		formData.append( 'dimensions', formDimensions );
		formData.append( 'categoryId', formCategoryId );
		formData.append( 'active', String( formActive ) );

		// Format products relation info
		const mappedRelations = formProducts.map( ( p ) => ( {
			productId	: p.productId,
			quantity	: Number( p.quantity ) || 1,
		} ) );
		formData.append( 'products', JSON.stringify( mappedRelations ) );

		// Format kits relation info
		const mappedKits = formKits.map( ( k ) => ( {
			kitId		: k.kitId,
			quantity	: Number( k.quantity ) || 1,
		} ) );
		formData.append( 'kits', JSON.stringify( mappedKits ) );

		// Images
		formData.append( 'filesInfo', uploaderFilesInfo || '[]' );
		uploaderFiles.forEach( ( u ) => {
			if ( u.file ) {
				formData.append( 'files', u.file );
			}
		} );

		labMutation.mutate( { isEditing, editingId, formData } );
	}
</script>

<DashboardModal
	{ show }
	title            = { isEditing ? 'Modificar Laboratorio Móvil' : 'Crear Nuevo Laboratorio' }
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
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

				<!-- ── LEFT PANEL: Fields ── -->
				<div class="flex flex-col gap-3">

					<!-- Section: Identificación -->
					<fieldset
						class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 0ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Identificación
						</legend>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

							<!-- Name -->
							<div class="flex flex-col gap-1">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="lab-name">
									Nombre del Laboratorio
								</label>
								<InputText
									id="lab-name"
									bind:value={ formName }
									error={ nameError }
									placeholder="Ej: Laboratorio Móvil de Física"
									class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 text-[0.8125rem] text-text outline-none focus:ring-2 focus:ring-brand/15"
								/>
							</div>

							<!-- SKU -->
							<div class="flex flex-col gap-1">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="lab-sku">
									SKU Identificador
								</label>
								<InputText
									id="lab-sku"
									bind:value={ formSku }
									error={ skuError }
									placeholder="Ej: CLAB-001"
									class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 font-mono text-[0.8125rem] tracking-wide text-text outline-none focus:ring-2 focus:ring-brand/15"
								/>
							</div>
						</div>
					</fieldset>

					<!-- Section: Dimensiones -->
					<fieldset
						class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 60ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Dimensiones (Largo x Ancho x Alto en metros)
						</legend>
						<div class="grid grid-cols-3 gap-3">
							<div class="flex flex-col gap-1">
								<label class="text-[0.55rem] font-bold tracking-wider text-text-muted uppercase" for="dim-length">
									Largo (m)
								</label>
								<InputNumber
									min={ 0 }
									bind:value={ dimLength }
									class="w-full h-9 rounded-xl"
									width="w-full flex-1 text-[14px] font-mono"
								/>
							</div>
							<div class="flex flex-col gap-1">
								<label class="text-[0.55rem] font-bold tracking-wider text-text-muted uppercase" for="dim-width">
									Ancho (m)
								</label>
								<InputNumber
									min={ 0 }
									bind:value={ dimWidth }
									class="w-full h-9 rounded-xl"
									width="w-full flex-1 text-[14px] font-mono"
								/>
							</div>
							<div class="flex flex-col gap-1">
								<label class="text-[0.55rem] font-bold tracking-wider text-text-muted uppercase" for="dim-height">
									Alto (m)
								</label>
								<InputNumber
									min={ 0 }
									bind:value={ dimHeight }
									class="w-full h-9 rounded-xl"
									width="w-full flex-1 text-[14px] font-mono"
								/>
							</div>
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
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="lab-cat">
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

					<!-- Section: Descripción -->
					<fieldset
						class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 180ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Descripción
						</legend>
						<div class="flex flex-col gap-1">
							<label class="sr-only" for="lab-desc">Descripción Completa del Laboratorio</label>

                            <RichTextEditor bind:html={ formDescription } />
						</div>
					</fieldset>

					<!-- Section: Elementos Asociados -->
					<!-- <div class="fade-in grid grid-cols-1 sm:grid-cols-2 gap-3" style="--delay: 240ms"> -->
					<div class="fade-in gap-4 grid" style="--delay: 240ms">
						<!-- PRODUCTS RELATION -->
						<RelationManager
							bind:items           = { formProducts }
							catalogItems         = { catalogProducts }
							title                = "Productos / Insumos Individuales"
							placeholder          = "Seleccionar producto..."
							idKey                = "productId"
							metaKey              = "product"
							isEditing            = { isEditing }
							initialDataRelations = { initialData?.products }
							duplicateMessage     = "Este producto ya está agregado al laboratorio."
							onRemove             = { removeProductFromForm }
						/>

						<!-- KITS RELATION -->
						<RelationManager
							bind:items           = { formKits }
							catalogItems         = { catalogKits }
							title                = "Kits Pedagógicos Integrados"
							placeholder          = "Seleccionar kit..."
							idKey                = "kitId"
							metaKey              = "kit"
							isEditing            = { isEditing }
							initialDataRelations = { initialData?.kits }
							duplicateMessage     = "Este kit ya está agregado al laboratorio."
							onRemove             = { removeKitFromForm }
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
					/>
				</div>
			</div>

			<!-- ── Footer: Toggle + Actions ── -->
			<div
				class="fade-in flex flex-col gap-3 border-t border-brand/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
				style="--delay: 280ms"
			>
				<!-- Custom toggle -->
				<label class="flex cursor-pointer select-none items-center gap-2.5" for="lab-active">
					<!-- Track -->
					<span
						class="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-all duration-200 { formActive ? 'bg-brand/30 border-brand' : 'bg-input border-brand/20' }"
					>
						<input
							id="lab-active"
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
						disabled = { labMutation.isPending }
						class    = "cursor-pointer rounded-lg border border-brand/20 bg-card/70 px-4 py-1.5 font-display text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted transition-all hover:border-brand/35 hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-45"
					>
						Cancelar
					</button>
					<button
						type     = "submit"
						disabled = { labMutation.isPending }
						class    = "flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-linear-to-tr from-brand via-brand-bright to-brand px-5 py-1.5 font-display text-[0.7rem] font-black uppercase tracking-[0.08em] text-white dark:text-brand-dark shadow-[0_0_16px_color-mix(in_srgb,var(--color-brand)_30%,transparent)] transition-all hover:shadow-[0_0_26px_color-mix(in_srgb,var(--color-brand)_50%,transparent)] disabled:cursor-not-allowed disabled:opacity-55"
					>
						{#if labMutation.isPending}
							<span class="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
							Guardando…
						{:else}
							{ isEditing ? 'Guardar Cambios' : 'Guardar Laboratorio' }
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
		context="labs"
		initialData={ null }
		onSave={ ( ) => {
			showCategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'lab-categories' ] } );
		} }
		onCancel={ ( ) => {
			showCategoryModal = false;
		} }
	/>
{/if}

<ConfirmationModal
	show        = { productToDelete !== null }
	title       = "Confirmar Eliminación"
	message     = { `¿Estás seguro de que deseas eliminar "${ productToDelete?.name }" de este laboratorio? Esta acción no se puede deshacer.` }
	confirmText = "Eliminar"
	onConfirm   = { confirmDeleteProduct }
	onCancel    = { ( ) => { productToDelete = null; } }
	isPending   = { deleteProductMutation.isPending }
/>

<ConfirmationModal
	show        = { kitToDelete !== null }
	title       = "Confirmar Eliminación"
	message     = { `¿Estás seguro de que deseas eliminar "${ kitToDelete?.name }" de este laboratorio? Esta acción no se puede deshacer.` }
	confirmText = "Eliminar"
	onConfirm   = { confirmDeleteKit }
	onCancel    = { ( ) => { kitToDelete = null; } }
	isPending   = { deleteKitMutation.isPending }
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
