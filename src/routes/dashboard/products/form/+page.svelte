<script lang="ts">
    import { page }     from '$app/state';
    import { resolve }  from '$app/paths';
    import { goto }     from '$app/navigation';

    import {
		createMutation,
		createQuery,
		useQueryClient
	}               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

	import FileUploader, {
		type UploadedFileItem
	}                                       from '$lib/components/shared/Inputs/FileUploader.svelte';
	import type {
        CategoryInfo,
        AdminProduct
    }                                       from '$lib/types/product';
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import Select                           from '$lib/components/shared/Inputs/Select.svelte';
	import KeyValueEditor                   from '$lib/components/shared/KeyValueEditor.svelte';
	import IdentificationFields             from '$lib/components/shared/Inputs/IdentificationFields.svelte';
	import StockPriceFields                 from '$lib/components/shared/Inputs/StockPriceFields.svelte';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import MaterialFormModal                from '../materials/components/MaterialFormModal.svelte';
	import ConfirmationModal                from '$lib/components/shared/ConfirmationModal.svelte';
	import Breadcrum                        from '$lib/components/shared/Breadcrum.svelte';
	import { isFormDirty, getErrorMessage } from '$lib/utils/form';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface MaterialInfo {
		id   : string;
		name : string;
	}

	// ─── Reactively get ID and Mode from URL ──────────────────────────────────────
	const productId = $derived( page.url.searchParams.get( 'id' ) || '' );
	const isEditing = $derived( !!productId );

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName          = $state( '' );
	let formSku           = $state( '' );
	let formDescription   = $state( '' );
	let formMaterialId    = $state( '' );
	let formSubcategoryId = $state( '' );
	let formActive        = $state( true );
	let formSpecs         = $state( '{}' );

	// Inventory & Price states
	let currentPrice      = $state< number | null >( null );
	let currentStock      = $state< number | null >( null );
	let minStock          = $state< number | null >( null );
	let maxStock          = $state< number | null >( null );

	// Error states
	let nameError         = $state( '' );
	let skuError          = $state( '' );
	let materialError     = $state( '' );
	let subcategoryError  = $state( '' );
	let specsError        = $state( '' );
	let priceError        = $state( '' );
	let currentStockError = $state( '' );
	let minStockError     = $state( '' );
	let maxStockError     = $state( '' );

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
	let showCancelConfirm    = $state( false );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const materialsQuery = createQuery( () => ( {
		queryKey : [ 'materials' ],
		queryFn  : async () : Promise< MaterialInfo[] > => {
			const matResponse = await connectRequest< MaterialInfo[] >( {
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( matResponse ) ) {
				throw new Error( 'Error al cargar materiales.' );
			}

			return matResponse;
		},
	} ) );

	const categoriesQuery = createQuery( () => ( {
		queryKey : [ 'categories' ],
		queryFn  : async () : Promise< CategoryInfo[] > => {
			const catResponse = await connectRequest< CategoryInfo[] >( {
				endpoint   : INTERNAL_ENDPOINTS.PRODUCTS.CATEGORIES.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( catResponse ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}

			return catResponse;
		},
	} ) );

	const productQuery = createQuery( () => ( {
		queryKey : [ 'edit-product', productId ],
		queryFn  : async () : Promise< AdminProduct > => {
			const response = await connectRequest< AdminProduct >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.GET_ONE }?id=${ productId }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled  : isEditing,
	} ) );

	const materials  = $derived( materialsQuery.data || [] );
	const categories = $derived( categoriesQuery.data || [] );

	const mappedSubcategories = $derived.by( () => {
		return categories.flatMap( ( cat ) => {
			return ( cat.subCategories || [] ).map( ( sub ) => ( {
				id   : sub.id,
				name : `${ cat.name }:${ sub.name }`,
			} ) );
		} );
	} );

	const initialData = $derived.by( () => {
		const item = productQuery.data;

		if ( !item ) {
			return null;
		}

		return {
			name           : item.name,
			sku            : item.sku,
			description    : item.description,
			materialId     : item.material?.id || '',
			subcategoryId  : item.subcategory?.id || '',
			active         : item.active,
			technicalSpecs : item.technical_specs ? ( typeof item.technical_specs === 'object' ? JSON.stringify( item.technical_specs ) : item.technical_specs ) : '{}',
			currentPrice   : item.currentPrice ? Number( item.currentPrice ) : null,
			currentStock   : item.currentStock ? Number( item.currentStock ) : null,
			minStock       : item.minStock ? Number( item.minStock ) : null,
			maxStock       : item.maxStock ? Number( item.maxStock ) : null,
			files          : ( item.files || [] )
				.filter( ( f ) => f.id !== 'placeholder' )
				.map( ( f, index ) => ( {
					id             : f.id,
					url            : f.url,
					alt            : f.alt || '',
					isMain         : f.isMain || false,
					order          : ( f as any ).order ?? index,
					attachmentType : ( f as any ).attachmentType,
				} ) ),
		};
	} );

	// ─── Sync data on open/load ───────────────────────────────────────────────────
	let loadedId = $state( '' );

	$effect( () => {
		if ( isEditing && initialData && loadedId !== productId ) {
			formName          = initialData.name           || '';
			formSku           = initialData.sku            || '';
			formDescription   = initialData.description    || '';
			formMaterialId    = initialData.materialId     || '';
			formSubcategoryId = initialData.subcategoryId  || '';
			formActive        = initialData.active         ?? true;
			formSpecs         = initialData.technicalSpecs || '{}';
			currentPrice      = initialData.currentPrice    ?? null;
			currentStock      = initialData.currentStock    ?? null;
			minStock          = initialData.minStock        ?? null;
			maxStock          = initialData.maxStock        ?? null;

			if ( initialData.files ) {
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

			loadedId = productId;
		} else if ( !isEditing && loadedId !== '' ) {
			formName          = '';
			formSku           = '';
			formDescription   = '';
			formMaterialId    = '';
			formSubcategoryId = '';
			formActive        = true;
			formSpecs         = '{}';
			currentPrice      = null;
			currentStock      = null;
			minStock          = null;
			maxStock          = null;
			uploaderFiles     = [];
			uploaderFilesInfo = '';
			nameError         = '';
			skuError          = '';
			materialError     = '';
			subcategoryError  = '';
			specsError        = '';
			priceError        = '';
			currentStockError = '';
			minStockError     = '';
			maxStockError     = '';
			filesError        = '';

			loadedId = '';
		}
	} );

	const isDirty = $derived.by( () => {
		return isFormDirty(
			{
				name           : formName,
				sku            : formSku,
				description    : formDescription,
				active         : formActive,
				materialId     : formMaterialId,
				subcategoryId  : formSubcategoryId,
				technicalSpecs : formSpecs,
				currentPrice   : currentPrice,
				currentStock   : currentStock,
				minStock       : minStock,
				maxStock       : maxStock,
				files          : uploaderFiles,
			},
			initialData,
			isEditing
		);
	} );

	function handleCancel() : void {
		if ( isDirty ) {
			showCancelConfirm = true;
		} else {
			goto( resolve( '/dashboard/products' ) );
		}
	}

	function confirmCancel() : void {
		showCancelConfirm = false;
		goto( resolve( '/dashboard/products' ) );
	}

	function closeCancelConfirm() : void {
		showCancelConfirm = false;
	}


	// ─── TanStack Query Mutations ─────────────────────────────────────────────────
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
			goto( resolve( '/dashboard/products' ) );
		},
		onError    : ( error : any ) => {
			console.error( 'Error al guardar producto:', error );
			toast.error( getErrorMessage( error, 'Error al guardar.' ) );
		},
	} ) );

	$effect( () => {
		$globalLoadingStore = productMutation.isPending || materialsQuery.isFetching || categoriesQuery.isFetching || productQuery.isFetching;
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
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.FILES }?id=${ productId }&fileId=${ fileId }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			toast.success( 'Archivo eliminado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-products' ] } );
			queryClient.invalidateQueries( { queryKey : [ 'edit-product', productId ] } );
		} catch ( error : any ) {
			console.error( 'Error al eliminar archivo:', error );
			toast.error( getErrorMessage( error, 'Error al eliminar el archivo.' ) );
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
				endpoint   : `${ INTERNAL_ENDPOINTS.PRODUCTS.FILES }?id=${ productId }`,
				method     : METHOD.DELETE,
				body       : { fileIds },
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			toast.success( 'Archivos seleccionados eliminados con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-products' ] } );
			queryClient.invalidateQueries( { queryKey : [ 'edit-product', productId ] } );
		} catch ( error : any ) {
			console.error( 'Error al eliminar archivos seleccionados:', error );
			toast.error( getErrorMessage( error, 'Error al eliminar los archivos seleccionados.' ) );
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

		const priceStr = currentPrice !== null && currentPrice !== undefined ? String( currentPrice ).trim() : '';
		if ( priceStr !== '' && priceStr !== 'null' && priceStr !== 'undefined' ) {
			formData.append( 'currentPrice', priceStr );
		}

		const stockStr = currentStock !== null && currentStock !== undefined ? String( currentStock ).trim() : '';
		if ( stockStr !== '' && stockStr !== 'null' && stockStr !== 'undefined' ) {
			formData.append( 'currentStock', stockStr );
		}

		const minStockStr = minStock !== null && minStock !== undefined ? String( minStock ).trim() : '';
		if ( minStockStr !== '' && minStockStr !== 'null' && minStockStr !== 'undefined' ) {
			formData.append( 'minStock', minStockStr );
		}

		const maxStockStr = maxStock !== null && maxStock !== undefined ? String( maxStock ).trim() : '';
		if ( maxStockStr !== '' && maxStockStr !== 'null' && maxStockStr !== 'undefined' ) {
			formData.append( 'maxStock', maxStockStr );
		}

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

		productMutation.mutate( { isEditing, editingId : productId, formData } );
	}

	const breadcrumbItems = $derived( [
		{ label : 'Dashboard', href : '/dashboard' },
		{ label : 'Productos', href : '/dashboard/products' },
		{ label : isEditing ? 'Modificar Producto' : 'Crear Producto' }
	] );
</script>

<svelte:head>
	<title>{ isEditing ? 'Modificar Producto' : 'Crear Nuevo Producto' } - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-[3.3rem]">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- Navigation & Header -->
        <div class="flex items-center justify-between gap-4">
            <div class="flex flex-col gap-4">
                <Breadcrum items={ breadcrumbItems } />

                <div class="flex flex-col gap-1.5">
                    <h1 class="font-display text-3xl font-black tracking-tight dark:text-white text-brand-bright">
                        { isEditing ? 'Modificar Producto' : 'Crear Nuevo Producto' }
                    </h1>

                    <p class="text-xs text-text-muted">
                        { isEditing ? 'Actualice las especificaciones, inventario, precios e imágenes del producto seleccionado.' : 'Complete el siguiente formulario para ingresar un nuevo producto al catálogo de GlobalCET.' }
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2.5">
                <button
                    type    = "button"
                    onclick = { handleCancel }
                    class   = "cursor-pointer rounded-lg border border-brand/20 bg-card/70 px-4 py-1.5 font-display text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted transition-all hover:border-brand/35 hover:bg-brand/10 hover:text-brand"
                >
                    Cancelar
                </button>

                <button
                    type     = "submit"
                    form     = "product-form"
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

		{#if ( isEditing && productQuery.isPending )}
			<div class="flex min-h-[400px] items-center justify-center rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
					<p class="font-display text-xs font-black uppercase tracking-widest text-brand animate-pulse">
						Cargando datos del producto...
					</p>
				</div>
			</div>
		{:else if ( isEditing && productQuery.isError )}
			<div class="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted">
				<p class="text-red-400 font-bold uppercase tracking-wider">Error al cargar el producto</p>
				<p class="text-xs">{ productQuery.error?.message || 'Ocurrió un error inesperado al consultar los datos.' }</p>
				<a
					href="/dashboard/products"
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-2.5 font-bold uppercase tracking-wider text-brand hover:bg-brand/10 transition-colors cursor-pointer"
				>
					Volver al catálogo
				</a>
			</div>
		{:else}
			<div class="">
				<form
					id="product-form"
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
								nameLabel       = "Nombre del Producto"
								namePlaceholder = "Ej: Vaso de Precipitado 250ml"
								skuPlaceholder  = "Ej: CPRODUCT-002"
								idPrefix        = "prod"
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
												onclick={ () => { showMaterialModal = true; } }
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
													onclick={ () => { showCategoryModal = true; } }
													class="cursor-pointer text-brand hover:text-brand-bright transition-colors text-[0.65rem] font-black uppercase tracking-wider"
												>
													+ Crear Categoría
												</button>
												<span class="text-brand/30">|</span>
												<button
													type="button"
													onclick={ () => { showSubcategoryModal = true; } }
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

							<!-- Visibilidad de Catálogo (Panel Derecho) -->
							<fieldset class="mt-5 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5">
								<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
									Estado de Publicación
								</legend>

								<div class="flex items-center justify-between">
									<span class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase">
										Habilitar Catálogo
									</span>

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
											{ formActive ? 'Habilitado' : 'Deshabilitado' }
										</span>
									</label>
								</div>
							</fieldset>
						</div>
					</div>
				</form>
			</div>
		{/if}
	</div>
</main>

{#if ( showMaterialModal )}
	<MaterialFormModal
		show={ showMaterialModal }
		isEditing={ false }
		editingId=""
		initialData={ null }
		onSave={ () => {
			showMaterialModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'materials' ] } );
		} }
		onCancel={ () => {
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
		onSave={ () => {
			showCategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'categories' ] } );
		} }
		onCancel={ () => {
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
		onSave={ () => {
			showSubcategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'categories' ] } );
			queryClient.invalidateQueries( { queryKey : [ 'subcategories-all' ] } );
		} }
		onCancel={ () => {
			showSubcategoryModal = false;
		} }
	/>
{/if}

{#if ( showCancelConfirm )}
	<ConfirmationModal
		show        = { showCancelConfirm }
		title       = "Descartar cambios"
		message     = "Tienes cambios sin guardar en el formulario. ¿Realmente deseas salir y perder los cambios?"
		confirmText = "Descartar"
		cancelText  = "Volver a editar"
		onConfirm   = { confirmCancel }
		onCancel    = { closeCancelConfirm }
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
