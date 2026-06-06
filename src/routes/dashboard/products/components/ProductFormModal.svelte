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

	// ─── Submit Handlers ──────────────────────────────────────────────────────────
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

		// Sync file items metadata
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
	title       = { isEditing ? 'Modificar Producto' : 'Crear Nuevo Producto' }
	onClose     = { onCancel }
	maxWidth    = "max-w-6xl"
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 font-bold text-text-muted">
            <div class="grid grid-cols-2 gap-4 items-start">
                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Name -->
                        <div class="space-y-1.5">
                            <label class="font-bold text-brand" for="prod-name">Nombre del Producto</label>

                            <input
                                id="prod-name"
                                type="text"
                                bind:value={ formName }
                                placeholder="Ej: Vaso de Precipitado 250ml"
                                class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
                            />
                        </div>

                        <!-- SKU -->
                        <div class="space-y-1.5">
                            <label class="font-bold text-brand" for="prod-sku">SKU Identificador</label>

                            <input
                                id="prod-sku"
                                type="text"
                                bind:value={ formSku }
                                placeholder="Ej: CPRODUCT-002"
                                class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
                            />
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="space-y-1.5">
                        <label class="font-bold text-brand" for="prod-desc">Descripción Completa</label>

                        <textarea
                            id="prod-desc"
                            bind:value={ formDescription }
                            placeholder="Describa el grado de pureza, dimensiones o aplicación pedagógica..."
                            rows="3"
                            class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card resize-none"
                        ></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Material select -->
                        <div class="space-y-1.5">
                            <label class="font-bold text-brand" for="prod-material">Material</label>

                            <Select
                                options={ materials }
                                bind:value={ formMaterialId }
                                multiple={ false }
                                placeholder="Seleccionar material..."
                            />
                        </div>

                        <!-- Subcategory select -->
                        <div class="space-y-1.5">
                            <label class="font-bold text-brand" for="prod-subcat">Subcategoría</label>

                            <Select
                                options     = { mappedSubcategories }
                                bind:value  = { formSubcategoryId }
                                multiple    = { false }
                                placeholder = "Seleccionar subcategoría..."
                            />
                        </div>
                    </div>

                    <!-- Technical specs (Visual Editor) -->
                    <div class="space-y-1.5 font-bold">
                        <label for="prod-specs" class="font-bold text-brand">Especificaciones Técnicas (Clave : Valor)</label>
                        <KeyValueEditor id="prod-specs" bind:value={ formSpecs } />
                    </div>

                </div>

                <!-- Custom Shared File Uploader (Dropzone area) -->
                <div class="space-y-1.5">
                    <span class="text-sm text-brand">Carga de Imágenes Catálogo</span>
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

			<!-- Active checkbox -->
			<div class="flex items-center gap-3 pt-2">
				<input
					id="prod-active"
					type="checkbox"
					bind:checked={ formActive }
					class="accent-brand h-4 w-4 cursor-pointer"
				/>
				<label for="prod-active" class="font-bold text-brand cursor-pointer select-none">Habilitar en Catálogo Público</label>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-3 border-t border-brand/10 pt-4">
				<button
					type     = "button"
					onclick  = { onCancel }
					disabled = { productMutation.isPending }
					class    = "rounded-xl border border-brand/20 bg-surface/30 px-5 py-3 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancelar
				</button>
				<button
					type     = "submit"
					disabled = { productMutation.isPending }
					class    = "rounded-xl bg-brand px-5 py-3 font-bold uppercase tracking-wider text-surface-dark shadow-card hover:bg-brand-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{ productMutation.isPending ? 'Guardando...' : 'Guardar Producto' }
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
