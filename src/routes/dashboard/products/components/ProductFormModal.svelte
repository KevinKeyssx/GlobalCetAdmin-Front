<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import FileUploader, {
		type UploadedFileItem
	}                                       from '$lib/components/shared/FileUploader.svelte';
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import DashboardModal                   from '../../components/DashboardModal.svelte';
	import Select                           from '$lib/components/shared/Select.svelte';
	import KeyValueEditor                   from '$lib/components/shared/KeyValueEditor.svelte';

	import type { ProductInitial }          from '$lib/types/product';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';

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

	// File Uploader state
	let uploaderFiles     = $state< UploadedFileItem[] >( [] );
	let uploaderFilesInfo = $state( '' );
	let deletingFileId    = $state< string | null >( null );

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
			formMaterialId    = initialData?.materialId     || ( materials[ 0 ]?.id || '' );
			formSubcategoryId = initialData?.subcategoryId  || '';
			formActive        = initialData?.active         || true;
			formSpecs         = initialData?.technicalSpecs || '{}';
			if ( isEditing && initialData?.files ) {
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
		}
	} );

	// ─── TanStack Query client & mutations ────────────────────────────────────────
	const queryClient = useQueryClient();

	const productMutation = createMutation( () => ( {
		mutationFn : async ( { isEditing, editingId, formData } : { isEditing : boolean; editingId : string; formData : FormData } ) : Promise< any > => {
			const endpoint = isEditing ? `products?id=${ editingId }` : 'products';
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
				endpoint	: `products/files?id=${ editingId }&fileId=${ fileId }`,
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
				endpoint	: `products/files?id=${ editingId }`,
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

		if ( !formName.trim() || !formSku.trim() ) {
			toast.error( 'Nombre y SKU son obligatorios.' );
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
			id     : uf.file ? undefined : uf.id,
			alt    : uf.alt,
			isMain : uf.isMain,
			order  : uf.order,
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
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

							<!-- Name -->
							<div class="flex flex-col gap-1">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-name">
									Nombre del Producto
								</label>
								<input
									id="prod-name"
									type="text"
									bind:value={ formName }
									placeholder="Ej: Vaso de Precipitado 250ml"
									class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 text-[0.8125rem] text-text outline-none transition-all placeholder:text-text-muted/50 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
								/>
							</div>

							<!-- SKU -->
							<div class="flex flex-col gap-1">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-sku">
									SKU Identificador
								</label>
								<input
									id="prod-sku"
									type="text"
									bind:value={ formSku }
									placeholder="Ej: CPRODUCT-002"
									class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 font-mono text-[0.8125rem] tracking-wide text-text outline-none transition-all placeholder:text-text-muted/50 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
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
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-material">
									Material
								</label>

                                <Select
									options={ materials }
									bind:value={ formMaterialId }
									multiple={ false }
									placeholder="Seleccionar material..."
								/>
							</div>

							<!-- Subcategory -->
							<div class="flex flex-col gap-1">
								<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="prod-subcat">
									Subcategoría
								</label>
								<Select
									options     = { mappedSubcategories }
									bind:value  = { formSubcategoryId }
									multiple    = { false }
									placeholder = "Seleccionar subcategoría..."
								/>
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
							<KeyValueEditor id="prod-specs" bind:value={ formSpecs } />
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
