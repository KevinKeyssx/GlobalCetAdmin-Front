<script lang="ts">
	import {
        createMutation,
        useQueryClient
    }               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

	import FileUploader, {
		type UploadedFileItem
	}                                       from '$lib/components/shared/FileUploader.svelte';
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import Select                           from '$lib/components/shared/Select.svelte';
	import KeyValueEditor                   from '$lib/components/shared/KeyValueEditor.svelte';
	import InputText                        from '$lib/components/shared/InputText.svelte';
	import TextArea                         from '$lib/components/shared/TextArea.svelte';
	import type { ProductInitial }          from '$lib/types/product';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import MaterialFormModal                from '../materials/components/MaterialFormModal.svelte';
	import DashboardModal                   from '../../components/DashboardModal.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface ProductFormProps {
		show        : boolean;
		isEditing   : boolean;
		editingId   : string;
		initialData : ProductInitial | null;
		materials   : MaterialInfo[];
		categories  : CategoryInfo[];
		onSave      : () => void;
		onCancel    : () => void;
	}

	interface MaterialInfo {
		id   : string;
		name : string;
	}

	interface CategoryInfo {
		id            : string;
		name          : string;
		subCategories : Array<{ id : string; name : string }>;
	}

	let {
		show,
		isEditing,
		editingId,
		initialData,
		materials,
		categories,
		onSave,
		onCancel,
	} : ProductFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName          = $state( '' );
	let formSku           = $state( '' );
	let formDescription   = $state( '' );
	let formMaterialId    = $state( '' );
	let formSubcategoryId = $state( '' );
	let formActive        = $state( true );
	let formSpecs         = $state( '{}' );

	// Error states
	let nameError         = $state( '' );
	let skuError          = $state( '' );
	let materialError     = $state( '' );
	let subcategoryError  = $state( '' );
	let specsError        = $state( '' );

	// File Uploader state
	let uploaderFiles     = $state< UploadedFileItem[] >( [] );
	let uploaderFilesInfo = $state( '' );
	let deletingFileId    = $state< string | null >( null );
	let filesError        = $state( '' );

	$effect( () => {
		if ( uploaderFiles.length > 0 ) {
			filesError = '';
		}
	} );

	// Modales de creación rápida
	let showMaterialModal    = $state( false );
	let showCategoryModal    = $state( false );
	let showSubcategoryModal = $state( false );

	const mappedSubcategories = $derived.by( () => {
		return categories.flatMap( ( cat ) => {
			return ( cat.subCategories || [] ).map( ( sub ) => ( {
				id   : sub.id,
				name : `${ cat.name }:${ sub.name }`,
			} ) );
		} );
	} );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show ) {
			formName          = initialData?.name           || '';
			formSku           = initialData?.sku            || '';
			formDescription   = initialData?.description    || '';
			formMaterialId    = initialData?.materialId     || '';
			formSubcategoryId = initialData?.subcategoryId  || '';
			formActive        = initialData?.active         ?? true;
			formSpecs         = initialData?.technicalSpecs || '{}';
			if ( isEditing && initialData?.files ) {
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
			materialError     = '';
			subcategoryError  = '';
			specsError        = '';
			filesError        = '';
		} else if ( show && !initialData ) {
			formName          = '';
			formSku           = '';
			formDescription   = '';
			formMaterialId    = '';
			formSubcategoryId = '';
			formActive        = true;
			formSpecs         = '{}';
			uploaderFiles     = [];
			uploaderFilesInfo = '';
			nameError         = '';
			skuError          = '';
			materialError     = '';
			subcategoryError  = '';
			specsError        = '';
			filesError        = '';
		}
	} );

	// ─── TanStack Query client & mutations ────────────────────────────────────────
	const queryClient = useQueryClient();

	const productMutation = createMutation( () => ( {
		mutationFn : async ( { isEditing, editingId, formData } : { isEditing : boolean; editingId : string; formData : FormData } ) : Promise< any > => {
			const endpoint = isEditing ? `${ INTERNAL_ENDPOINTS.PRODUCTS.BASE }?id=${ editingId }` : INTERNAL_ENDPOINTS.PRODUCTS.BASE;
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
		onSuccess  : () => {
			toast.success( isEditing ? 'Producto editado con éxito.' : 'Producto creado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-products' ] } );
			onSave();
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al guardar.' );
		},
	} ) );

	$effect( () => {
		$globalLoadingStore = productMutation.isPending;
		return () => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Deletion Handlers ────────────────────────────────────────────────────────
	async function handleDeleteSingleFile( fileId : string ) : Promise< void > {
		try {
			deletingFileId      = fileId;
			$globalLoadingStore = true;

			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.PRODUCTS.FILES }?id=${ editingId }&fileId=${ fileId }`,
				method		: METHOD.DELETE,
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			toast.success( 'Archivo eliminado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-products' ] } );
		} catch ( error : any ) {
			toast.error( error.message || 'Error al eliminar el archivo.' );
		} finally {
			deletingFileId      = null;
			$globalLoadingStore = false;
		}
	}

	async function handleDeleteMultipleFiles( fileIds : string[] ) : Promise< void > {
		try {
			deletingFileId      = 'bulk';
			$globalLoadingStore = true;

			const response = await connectRequest< any >( {
				endpoint	: `${ INTERNAL_ENDPOINTS.PRODUCTS.FILES }?id=${ editingId }`,
				method		: METHOD.DELETE,
				body		: { fileIds },
				isInternal	: true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			toast.success( 'Archivos seleccionados eliminados con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-products' ] } );
		} catch ( error : any ) {
			toast.error( error.message || 'Error al eliminar los archivos seleccionados.' );
		} finally {
			deletingFileId      = null;
			$globalLoadingStore = false;
		}
	}

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	function handleSubmit( e : Event ) : void {
		e.preventDefault();

		nameError        = '';
		skuError         = '';
		materialError    = '';
		subcategoryError = '';
		specsError       = '';
		let hasError     = false;

		if ( !formName.trim() ) {
			nameError = 'El nombre es obligatorio.';
			hasError  = true;
		}

		if ( !formSku.trim() ) {
			skuError = 'El SKU es obligatorio.';
			hasError = true;
		}

		if ( !formMaterialId ) {
			materialError = 'El material es obligatorio.';
			hasError      = true;
		}

		if ( !formSubcategoryId ) {
			subcategoryError = 'La subcategoría es obligatoria.';
			hasError         = true;
		}

		let specsCount = 0;
		try {
			const parsed = JSON.parse( formSpecs || '{}' );
			specsCount = Object.keys( parsed ).length;
		} catch ( _ ) {
			specsCount = 0;
		}

		if ( specsCount === 0 ) {
			specsError = 'Al menos una especificación es requerida.';
			hasError   = true;
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
		formData.append( 'materialId', formMaterialId );
		formData.append( 'subcategoryId', formSubcategoryId );
		formData.append( 'active', String( formActive ) );
		formData.append( 'includeImages', 'true' );
		formData.append( 'includeKits', 'false' );
		formData.append( 'includeMobileLabs', 'false' );
		formData.append( 'technical_specs', formSpecs );

		const clientImages = uploaderFiles.map( ( uf ) => ( {
			id             : uf.file ? undefined : uf.id,
			name           : uf.file ? uf.file.name : ( uf.preview.split( '/' ).pop() || '' ),
			alt            : uf.alt,
			isMain         : uf.isMain,
			order          : uf.order,
			attachmentType : uf.attachmentType,
		} ) );
		formData.append( 'imagesInfo', JSON.stringify( clientImages ) );

		uploaderFiles.forEach( ( uf ) => {
			if ( uf.file ) {
				formData.append( 'files', uf.file );
			}
		} );

		productMutation.mutate( { isEditing, editingId, formData } );
	}
</script>

<DashboardModal
	{ show }
	title    = { isEditing ? 'Modificar Producto' : 'Crear Nuevo Producto' }
	onClose  = { onCancel }
	maxWidth = "max-w-6xl"
	overflowVisible = { true }
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

					<!-- Section: Identificación -->
					<fieldset
						class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 0ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Identificación
						</legend>

                        <div class="grid grid-cols-1 gap-3">
							<!-- Name -->
							<div class="flex flex-col gap-1">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-name">
									Nombre del Producto
								</label>

                                <TextArea
									id="prod-name"
									bind:value={ formName }
									error={ nameError }
									placeholder="Ej: Vaso de Precipitado 250ml"
									class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 text-[0.8125rem] text-text outline-none focus:ring-2 focus:ring-brand/15"
								/>
							</div>

							<!-- SKU -->
							<div class="flex flex-col gap-1">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-sku">
									SKU Identificador
								</label>

                                <InputText
									id="prod-sku"
									bind:value={ formSku }
									error={ skuError }
									placeholder="Ej: CPRODUCT-002"
									class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 font-mono text-[0.8125rem] tracking-wide text-text outline-none focus:ring-2 focus:ring-brand/15"
								/>
							</div>
						</div>
					</fieldset>

					<!-- Section: Descripción -->
					<fieldset
						class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 60ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Descripción
						</legend>

                        <div class="flex flex-col gap-1">
							<label class="sr-only" for="prod-desc">Descripción Completa</label>

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

                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">

							<!-- Material -->
							<div class="flex flex-col gap-1">
								<div class="flex items-center justify-between">
									<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-material">
										Material
									</label>
									<button
										type="button"
										onclick={ ( ) => { showMaterialModal = true; } }
										class="cursor-pointer text-brand hover:text-brand-bright transition-colors text-[0.65rem] font-black uppercase tracking-wider"
									>
										+ Crear Material
									</button>
								</div>

								<Select
									options={ materials }
									bind:value={ formMaterialId }
									multiple={ false }
									placeholder="Seleccionar material..."
									hasError={ !!materialError }
								/>
								{#if ( materialError )}
									<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ materialError }</p>
								{/if}
							</div>

							<!-- Subcategory -->
							<div class="flex flex-col gap-1">
								<div class="flex items-center justify-between">
									<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-subcat">
										Subcategoría
									</label>
									<div class="flex items-center gap-2">
										<button
											type="button"
											onclick={ ( ) => { showCategoryModal = true; } }
											class="cursor-pointer text-brand hover:text-brand-bright transition-colors text-[0.65rem] font-black uppercase tracking-wider"
										>
											+ Crear Categoría
										</button>
										<span class="text-brand/30">|</span>
										<button
											type="button"
											onclick={ ( ) => { showSubcategoryModal = true; } }
											class="cursor-pointer text-brand hover:text-brand-bright transition-colors text-[0.65rem] font-black uppercase tracking-wider"
										>
											+ Crear Subcategoría
										</button>
									</div>
								</div>
								<Select
									options     = { mappedSubcategories }
									bind:value  = { formSubcategoryId }
									multiple    = { false }
									placeholder = "Seleccionar subcategoría..."
									hasError    = { !!subcategoryError }
								/>
								{#if ( subcategoryError )}
									<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ subcategoryError }</p>
								{/if}
							</div>
						</div>
					</fieldset>

					<!-- Section: Especificaciones Técnicas -->
					<fieldset
						class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
						style="--delay: 180ms"
					>
						<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
							Especificaciones Técnicas
						</legend>
						<div class="flex flex-col gap-1">
							<label class="sr-only" for="prod-specs">Clave : Valor</label>
							<KeyValueEditor id="prod-specs" bind:value={ formSpecs } error={ specsError } />
						</div>
					</fieldset>
				</div>

				<!-- ── RIGHT PANEL: File Uploader ── -->
				<div class="fade-in flex flex-col" style="--delay: 80ms">
					<p class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
						Carga de Imágenes Catálogo
					</p>
					<FileUploader
						bind:files={ uploaderFiles }
						bind:filesInfo={ uploaderFilesInfo }
						isEditing={ isEditing }
						deletingFileId={ deletingFileId }
						onDeleteSingle={ handleDeleteSingleFile }
						onDeleteMultiple={ handleDeleteMultipleFiles }
						error={ filesError }
					/>
				</div>
			</div>

			<!-- ── Footer: Toggle + Actions ── -->
			<div
				class="fade-in flex flex-col gap-3 border-t border-brand/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
				style="--delay: 220ms"
			>
				<!-- Custom toggle -->
				<label class="flex cursor-pointer select-none items-center gap-2.5" for="prod-active">
					<!-- Track -->
					<span
						class="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-all duration-200 { formActive ? 'bg-brand/30 border-brand' : 'bg-input border-brand/20' }"
					>
						<input
							id="prod-active"
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
						disabled = { productMutation.isPending }
						class    = "cursor-pointer rounded-lg border border-brand/20 bg-card/70 px-4 py-1.5 font-display text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted transition-all hover:border-brand/35 hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-45"
					>
						Cancelar
					</button>
					<button
						type     = "submit"
						disabled = { productMutation.isPending }
						class    = "flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-linear-to-tr from-brand via-brand-bright to-brand px-5 py-1.5 font-display text-[0.7rem] font-black uppercase tracking-[0.08em] text-white dark:text-brand-dark shadow-[0_0_16px_color-mix(in_srgb,var(--color-brand)_30%,transparent)] transition-all hover:shadow-[0_0_26px_color-mix(in_srgb,var(--color-brand)_50%,transparent)] disabled:cursor-not-allowed disabled:opacity-55"
					>
						{#if productMutation.isPending}
							<span class="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
							Guardando…
						{:else}
							{ isEditing ? 'Guardar Cambios' : 'Guardar Producto' }
						{/if}
					</button>
				</div>
			</div>
		</form>
	{/snippet}
</DashboardModal>

{#if ( showMaterialModal )}
	<MaterialFormModal
		show={ showMaterialModal }
		isEditing={ false }
		editingId=""
		initialData={ null }
		onSave={ ( ) => {
			showMaterialModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'materials' ] } );
		} }
		onCancel={ ( ) => {
			showMaterialModal = false;
		} }
	/>
{/if}

{#if ( showCategoryModal )}
	<CategoryFormModal
		show={ showCategoryModal }
		isEditing={ false }
		editingId=""
		context="products"
		activeTab="categories"
		initialData={ null }
		onSave={ ( ) => {
			showCategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'categories' ] } );
		} }
		onCancel={ ( ) => {
			showCategoryModal = false;
		} }
	/>
{/if}

{#if ( showSubcategoryModal )}
	<CategoryFormModal
		show={ showSubcategoryModal }
		isEditing={ false }
		editingId=""
		context="products"
		activeTab="subcategories"
		categories={ categories }
		initialData={ null }
		onSave={ ( ) => {
			showSubcategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'categories' ] } );
			queryClient.invalidateQueries( { queryKey : [ 'subcategories-all' ] } );
		} }
		onCancel={ ( ) => {
			showSubcategoryModal = false;
		} }
	/>
{/if}

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
