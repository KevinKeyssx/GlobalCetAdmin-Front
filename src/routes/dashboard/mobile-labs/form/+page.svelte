<script lang="ts">
	import { page }     from '$app/state';
	import { resolve }  from '$app/paths';
	import { goto }     from '$app/navigation';

	import {
		createMutation,
		createQuery,
		useQueryClient
	}                                       from '@tanstack/svelte-query';
	import toast                            from 'svelte-french-toast';
	import { isFormDirty, getErrorMessage } from '$lib/utils/form';

	import FileUploader, {
		type UploadedFileItem
	}                                       from '$lib/components/shared/Inputs/FileUploader.svelte';
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import ProductSelectManager             from '$lib/components/shared/ProductSelectManager.svelte';
	import KitSelectManager                 from '$lib/components/shared/KitSelectManager.svelte';
	import Select                           from '$lib/components/shared/Inputs/Select.svelte';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import ConfirmationModal                from '$lib/components/shared/ConfirmationModal.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import PageContainer                    from '$lib/components/shared/PageContainer.svelte';
	import IdentificationFields             from '$lib/components/shared/Inputs/IdentificationFields.svelte';
	import StockPriceFields                 from '$lib/components/shared/Inputs/StockPriceFields.svelte';
	import InputNumber                      from '$lib/components/shared/Inputs/InputNumber.svelte';
	import type { LabProduct, LabKit }      from '$lib/types/lab';

	interface LabCategory {
		id   : string;
		name : string;
	}

	interface LabDetail {
		id           : string;
		sku          : string;
		name         : string;
		description  : string;
		dimensions   : string;
		active       : boolean;
		files        : Array<{ id : string; url : string; alt : string; isMain : boolean }>;
		category     : { id : string; name : string };
		products     : LabProduct[];
		kits         : LabKit[];
		currentPrice?: number;
		currentStock?: number;
		minStock?    : number;
		maxStock?    : number;
	}

	// ─── Reactively get ID and Mode from URL ──────────────────────────────────────
	const labId     = $derived( page.url.searchParams.get( 'id' ) || '' );
	const isEditing = $derived( !!labId );

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

	// Inventory & Price states
	let currentPrice    = $state< number | null >( null );
	let currentStock    = $state< number | null >( null );
	let minStock        = $state< number | null >( null );
	let maxStock        = $state< number | null >( null );

	// Error states for price and stocks
	let priceError        = $state( '' );
	let currentStockError = $state( '' );
	let minStockError     = $state( '' );
	let maxStockError     = $state( '' );

	function parseDimensions( dimStr : string ) : { length : number; width : number; height : number } {
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
	let uploaderFiles     = $state< UploadedFileItem[] >( [] );
	let uploaderFilesInfo = $state( '' );
	let filesError        = $state( '' );

	$effect( () => {
		if ( uploaderFiles.length > 0 ) {
			filesError = '';
		}
	} );

	// Modales de creación rápida y confirmación
	let showCategoryModal = $state( false );
	let showCancelConfirm = $state( false );

	// ─── TanStack Query client & queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const categoriesQuery = createQuery( () => ( {
		queryKey : [ 'lab-categories' ],
		queryFn  : async () : Promise< LabCategory[] > => {
			const response = await connectRequest< LabCategory[] >( {
				endpoint   : INTERNAL_ENDPOINTS.LABS.CATEGORIES.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}

			return response;
		},
	} ) );

	const labQuery = createQuery( () => ( {
		queryKey : [ 'edit-lab', labId ],
		queryFn  : async () : Promise< LabDetail > => {
			const response = await connectRequest< LabDetail >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.LABS.GET_ONE }?id=${ labId }`,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled  : isEditing,
	} ) );

	const categories = $derived( categoriesQuery.data || [] );

	const initialData = $derived.by( () => {
		const item = labQuery.data;

		if ( !item ) {
			return null;
		}

		return {
			name         : item.name,
			sku          : item.sku,
			description  : item.description,
			dimensions   : item.dimensions,
			categoryId   : item.category?.id || '',
			active       : item.active,
			products     : item.products || [],
			kits         : item.kits || [],
			currentPrice : item.currentPrice ? Number( item.currentPrice ) : null,
			currentStock : item.currentStock ? Number( item.currentStock ) : null,
			minStock     : item.minStock ? Number( item.minStock ) : null,
			maxStock     : item.maxStock ? Number( item.maxStock ) : null,
			files        : ( item.files || [] )
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
		if ( isEditing && initialData && loadedId !== labId ) {
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

			loadedId = labId;
		} else if ( !isEditing && loadedId !== '' ) {
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

			loadedId = '';
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
			labId     : labId,
			productId : productToDelete.productId,
		}, {
			onSuccess : () => {
				productToDelete = null;
			}
		} );
	}

	function confirmDeleteKit() : void {
		if ( !kitToDelete ) return;
		deleteKitMutation.mutate( {
			labId : labId,
			kitId : kitToDelete.kitId,
		}, {
			onSuccess : () => {
				kitToDelete = null;
			}
		} );
	}

	// ─── Shared Utilities Bindings ────────────────────────────────────────────────
	const isDirty = $derived.by( () => {
		return isFormDirty(
			{
				name         : formName,
				sku          : formSku,
				description  : formDescription,
				active       : formActive,
				categoryId   : formCategoryId,
				currentPrice : currentPrice,
				currentStock : currentStock,
				minStock     : minStock,
				maxStock     : maxStock,
				files        : uploaderFiles,
				products     : formProducts,
				kits         : formKits,
				dimensions   : formDimensions,
			},
			initialData,
			isEditing
		);
	} );

	function handleCancel() : void {
		if ( isDirty ) {
			showCancelConfirm = true;
		} else {
			goto( resolve( '/dashboard/mobile-labs' ) );
		}
	}

	function confirmCancel() : void {
		showCancelConfirm = false;
		goto( resolve( '/dashboard/mobile-labs' ) );
	}

	function closeCancelConfirm() : void {
		showCancelConfirm = false;
	}

	// ─── TanStack Query Mutations ─────────────────────────────────────────────────
	const labMutation = createMutation( () => ( {
		mutationFn : async ( { isEditing, editingId, formData } : { isEditing : boolean; editingId : string; formData : FormData } ) : Promise< any > => {
			const endpoint = isEditing ? `${ INTERNAL_ENDPOINTS.LABS.BASE }?id=${ editingId }` : INTERNAL_ENDPOINTS.LABS.BASE;
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
			toast.success( isEditing ? 'Laboratorio editado con éxito.' : 'Laboratorio creado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-labs' ] } );
			goto( resolve( '/dashboard/mobile-labs' ) );
		},
		onError    : ( error : any ) => {
			console.error( 'Error al guardar laboratorio móvil:', error );
			toast.error( getErrorMessage( error, 'Error al guardar.' ) );
		},
	} ) );

	const deleteProductMutation = createMutation( () => ( {
		mutationFn : async ( { labId, productId } : { labId : string; productId : string } ) : Promise< any > => {
			const response = await connectRequest< any >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.LABS.BASE }?id=${ labId }&productId=${ productId }`,
				method     : METHOD.DELETE,
				isInternal : true,
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
			console.error( 'Error al eliminar producto de laboratorio:', error );
			toast.error( getErrorMessage( error, 'Error al eliminar el producto.' ) );
		},
	} ) );

	const deleteKitMutation = createMutation( () => ( {
		mutationFn : async ( { labId, kitId } : { labId : string; kitId : string } ) : Promise< any > => {
			const response = await connectRequest< any >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.LABS.BASE }?id=${ labId }&kitId=${ kitId }`,
				method     : METHOD.DELETE,
				isInternal : true,
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
			console.error( 'Error al eliminar kit de laboratorio:', error );
			toast.error( getErrorMessage( error, 'Error al eliminar el kit.' ) );
		},
	} ) );

	$effect( () => {
		$globalLoadingStore = labMutation.isPending || deleteProductMutation.isPending || deleteKitMutation.isPending || categoriesQuery.isFetching || labQuery.isFetching;
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
		formData.append( 'dimensions', formDimensions );
		formData.append( 'categoryId', formCategoryId );
		formData.append( 'active', String( formActive ) );

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

		// Format products relation info
		const mappedRelations = formProducts.map( ( p ) => ( {
			productId : p.productId,
			quantity  : Number( p.quantity ) || 1,
		} ) );
		formData.append( 'products', JSON.stringify( mappedRelations ) );

		// Format kits relation info
		const mappedKits = formKits.map( ( k ) => ( {
			kitId    : k.kitId,
			quantity : Number( k.quantity ) || 1,
		} ) );
		formData.append( 'kits', JSON.stringify( mappedKits ) );

		// Images
		formData.append( 'filesInfo', uploaderFilesInfo || '[]' );
		uploaderFiles.forEach( ( u ) => {
			if ( u.file ) {
				formData.append( 'files', u.file );
			}
		} );

		labMutation.mutate( { isEditing, editingId : labId, formData } );
	}

	const breadcrumbItems = $derived( [
		{ label : 'Dashboard', href : resolve( '/dashboard' ) },
		{ label : 'Laboratorios Móviles', href : resolve( '/dashboard/mobile-labs' ) },
		{ label : isEditing ? 'Modificar Laboratorio' : 'Crear Laboratorio' }
	] );
</script>

<svelte:head>
	<title>{ isEditing ? 'Modificar Laboratorio Móvil' : 'Crear Nuevo Laboratorio Móvil' } - GlobalCET</title>
</svelte:head>

<PageContainer>
		<HeaderPage
			title            = { isEditing ? 'Modificar Laboratorio Móvil' : 'Crear Nuevo Laboratorio' }
			description      = { isEditing ? 'Actualice las especificaciones, dimensiones, inventario, precios e imágenes del laboratorio seleccionado.' : 'Complete el siguiente formulario para ingresar un nuevo laboratorio móvil al catálogo de GlobalCET.' }
			breadcrumb       = { breadcrumbItems }
			showCancelButton = { true }
			oncancel         = { handleCancel }
			formId           = "lab-form"
			isPending        = { labMutation.isPending }
		/>

		{#if ( isEditing && labQuery.isPending )}
			<div class="flex min-h-[400px] items-center justify-center rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
					<p class="font-display text-xs font-black uppercase tracking-widest text-brand animate-pulse">
						Cargando datos del laboratorio...
					</p>
				</div>
			</div>
		{:else if ( isEditing && labQuery.isError )}
			<div class="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted">
				<p class="text-red-400 font-bold uppercase tracking-wider">Error al cargar el laboratorio</p>
				<p class="text-xs">{ labQuery.error?.message || 'Ocurrió un error inesperado al consultar los datos.' }</p>
				<a
					href={ resolve( '/dashboard/mobile-labs' ) }
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-2.5 font-bold uppercase tracking-wider text-brand hover:bg-brand/10 transition-colors cursor-pointer"
				>
					Volver a la lista
				</a>
			</div>
		{:else}
			<div class="">
				<form
					id="lab-form"
					onsubmit={ handleSubmit }
					class="flex flex-col gap-5 text-[0.8125rem] font-semibold text-text-muted"
				>
					<!-- ── Two-panel grid: fields left / uploader right ── -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
						<!-- ── LEFT PANEL: Fields ── -->
						<div class="flex flex-col gap-3">
							<IdentificationFields
								bind:name       = { formName }
								bind:sku        = { formSku }
								nameError       = { nameError }
								skuError        = { skuError }
								nameLabel       = "Nombre del Laboratorio"
								namePlaceholder = "Ej: Laboratorio Móvil de Física"
								skuPlaceholder  = "Ej: CLAB-001"
								idPrefix        = "lab"
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
										<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="lab-category">
											Categoría Científica
										</label>
										<button
											type="button"
											onclick={ () => { showCategoryModal = true; } }
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
							<div class="fade-in gap-4 grid lg:hidden" style="--delay: 240ms">
								<ProductSelectManager
									bind:items           = { formProducts }
									isEditing            = { isEditing }
									initialDataRelations = { initialData?.products }
									onRemove             = { removeProductFromForm }
								/>

								<KitSelectManager
									bind:items           = { formKits }
									isEditing            = { isEditing }
									initialDataRelations = { initialData?.kits }
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
								error          = { filesError }
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
											{ formActive ? 'Habilitado' : 'Deshabilitado' }
										</span>
									</label>
								</div>
							</fieldset>
						</div>
					</div>

                    <!-- <div class="fade-in gap-4 grid grid-cols-1 lg:grid-cols-2" style="--delay: 240ms"> -->
                    <div class="hidden fade-in gap-4 lg:grid lg:grid-cols-2" style="--delay: 240ms">
                        <ProductSelectManager
                            bind:items           = { formProducts }
                            isEditing            = { isEditing }
                            initialDataRelations = { initialData?.products }
                            onRemove             = { removeProductFromForm }
                        />

                        <KitSelectManager
                            bind:items           = { formKits }
                            isEditing            = { isEditing }
                            initialDataRelations = { initialData?.kits }
                            onRemove             = { removeKitFromForm }
                        />
                    </div> 
				</form>
			</div>
		{/if}
</PageContainer>

{#if ( showCategoryModal )}
	<CategoryFormModal
		show={ showCategoryModal }
		isEditing={ false }
		editingId=""
		context="labs"
		initialData={ null }
		onSave={ () => {
			showCategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'lab-categories' ] } );
		} }
		onCancel={ () => {
			showCategoryModal = false;
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

<ConfirmationModal
	show        = { productToDelete !== null }
	title       = "Confirmar Eliminación"
	message     = { `¿Estás seguro de que deseas eliminar "${ productToDelete?.name }" de este laboratorio? Esta acción no se puede deshacer.` }
	confirmText = "Eliminar"
	onConfirm   = { confirmDeleteProduct }
	onCancel    = { () => { productToDelete = null; } }
	isPending   = { deleteProductMutation.isPending }
/>

<ConfirmationModal
	show        = { kitToDelete !== null }
	title       = "Confirmar Eliminación"
	message     = { `¿Estás seguro de que deseas eliminar "${ kitToDelete?.name }" de este laboratorio? Esta acción no se puede deshacer.` }
	confirmText = "Eliminar"
	onConfirm   = { confirmDeleteKit }
	onCancel    = { () => { kitToDelete = null; } }
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
