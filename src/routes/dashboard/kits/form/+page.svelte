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
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import ProductSelectManager             from '$lib/components/shared/ProductSelectManager.svelte';
	import Select                           from '$lib/components/shared/Inputs/Select.svelte';
	import IdentificationFields             from '$lib/components/shared/Inputs/IdentificationFields.svelte';
	import StockPriceFields                 from '$lib/components/shared/Inputs/StockPriceFields.svelte';
	import type { KitProduct }              from '$lib/types/kit';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';
	import CategoryFormModal                from '$lib/components/shared/CategoryFormModal.svelte';
	import ConfirmationModal                from '$lib/components/shared/ConfirmationModal.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import PageContainer                    from '$lib/components/shared/PageContainer.svelte';
	import { isFormDirty, getErrorMessage } from '$lib/utils/form';


	interface KitCategory {
		id   : string;
		name : string;
	}


    interface KitDetail {
		id           : string;
		sku          : string;
		name         : string;
		description  : string;
		active       : boolean;
		files        : Array<{ id : string; url : string; alt : string; isMain : boolean }>;
		category     : { id : string; name : string };
		products     : KitProduct[];
		currentPrice?: number;
		currentStock?: number;
		minStock?    : number;
		maxStock?    : number;
	}

	// ─── Reactively get ID and Mode from URL ──────────────────────────────────────
	const kitId     = $derived( page.url.searchParams.get( 'id' ) || '' );
	const isEditing = $derived( !!kitId );

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
	let currentPrice    = $state< number | null >( null );
	let currentStock    = $state< number | null >( null );
	let minStock        = $state< number | null >( null );
	let maxStock        = $state< number | null >( null );

	// Error states for price and stocks
	let priceError        = $state( '' );
	let currentStockError = $state( '' );
	let minStockError     = $state( '' );
	let maxStockError     = $state( '' );

	// Relations list state (Selected products in this kit)
	let formProducts      = $state< KitProduct[] >( [] );

	// File Uploader state
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
		queryKey : [ 'kit-categories' ],
		queryFn  : async () : Promise< KitCategory[] > => {
			const response = await connectRequest< KitCategory[] >( {
				endpoint   : INTERNAL_ENDPOINTS.KITS.CATEGORIES.GET_ALL,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( 'Error al cargar categorías.' );
			}

			return response;
		},
	} ) );

	const kitQuery = createQuery( () => ( {
		queryKey : [ 'edit-kit', kitId ],
		queryFn  : async () : Promise< KitDetail > => {
			const response = await connectRequest< KitDetail >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.KITS.GET_ONE }?id=${ kitId }`,
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
		const item = kitQuery.data;

		if ( !item ) {
			return null;
		}

		return {
			name         : item.name,
			sku          : item.sku,
			description  : item.description,
			categoryId   : item.category?.id || '',
			active       : item.active,
			products     : item.products || [],
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
		if ( isEditing && initialData && loadedId !== kitId ) {
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

			loadedId = kitId;
		} else if ( !isEditing && loadedId !== '' ) {
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

			loadedId = '';
		}
	} );

	// ─── Relation Helpers ─────────────────────────────────────────────────────────
	let productToDelete = $state<{ productId : string; name : string } | null>( null );

	function handleRemoveProduct( productId : string, name : string ) : void {
		if ( isEditing && initialData?.products.some( ( p ) => p.productId === productId ) ) {
			productToDelete = { productId, name };
		} else {
			formProducts = formProducts.filter( ( p ) => p.productId !== productId );
		}
	}

	function confirmDeleteProduct() : void {
		if ( !productToDelete ) {
			return;
		}

		deleteProductMutation.mutate( {
			kitId     : kitId,
			productId : productToDelete.productId,
		}, {
			onSuccess : () => {
				productToDelete = null;
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
			},
			initialData,
			isEditing
		);
	} );

	function handleCancel() : void {
		if ( isDirty ) {
			showCancelConfirm = true;
		} else {
			goto( resolve( '/dashboard/kits' ) );
		}
	}

	function confirmCancel() : void {
		showCancelConfirm = false;
		goto( resolve( '/dashboard/kits' ) );
	}

	function closeCancelConfirm() : void {
		showCancelConfirm = false;
	}

	// ─── TanStack Query Mutations ─────────────────────────────────────────────────
	const kitMutation = createMutation( () => ( {
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
		onSuccess  : () => {
			toast.success( isEditing ? 'Kit editado con éxito.' : 'Kit creado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-kits' ] } );
			goto( resolve( '/dashboard/kits' ) );
		},
		onError    : ( error : any ) => {
			console.error( 'Error al guardar kit:', error );
			toast.error( getErrorMessage( error, 'Error al guardar.' ) );
		},
	} ) );

	const deleteProductMutation = createMutation( () => ( {
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
			console.error( 'Error al eliminar producto del kit:', error );
			toast.error( getErrorMessage( error, 'Error al eliminar el producto.' ) );
		},
	} ) );

	$effect( () => {
		$globalLoadingStore = kitMutation.isPending || deleteProductMutation.isPending || categoriesQuery.isFetching || kitQuery.isFetching;
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

		const mappedRelations = formProducts.map( ( p ) => ( {
			productId : p.productId,
			quantity  : Number( p.quantity ) || 1,
		} ) );
		formData.append( 'products', JSON.stringify( mappedRelations ) );

		formData.append( 'filesInfo', uploaderFilesInfo || '[]' );
		uploaderFiles.forEach( ( u ) => {
			if ( u.file ) {
				formData.append( 'files', u.file );
			}
		} );

		kitMutation.mutate( { isEditing, editingId : kitId, formData } );
	}

	const breadcrumbItems = $derived( [
		{ label : 'Dashboard', href : resolve( '/dashboard' ) },
		{ label : 'Kits',      href : resolve( '/dashboard/kits' ) },
		{ label : isEditing ? 'Modificar Kit' : 'Crear Kit' }
	] );
</script>

<svelte:head>
	<title>{ isEditing ? 'Modificar Kit' : 'Crear Nuevo Kit' } - GlobalCET</title>
</svelte:head>

<PageContainer>
		<HeaderPage
			title            = { isEditing ? 'Modificar Kit' : 'Crear Nuevo Kit' }
			description      = { isEditing ? 'Actualice las especificaciones, inventario, precios e imágenes del kit seleccionado.' : 'Complete el siguiente formulario para ingresar un nuevo kit al catálogo de GlobalCET.' }
			breadcrumb       = { breadcrumbItems }
			showCancelButton = { true }
			oncancel         = { handleCancel }
			formId           = "kit-form"
			isPending        = { kitMutation.isPending }
		/>

		{#if ( isEditing && kitQuery.isPending )}
			<div class="flex min-h-[400px] items-center justify-center rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
					<p class="font-display text-xs font-black uppercase tracking-widest text-brand animate-pulse">
						Cargando datos del kit...
					</p>
				</div>
			</div>
		{:else if ( isEditing && kitQuery.isError )}
			<div class="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted">
				<p class="text-red-400 font-bold uppercase tracking-wider">Error al cargar el kit</p>
				<p class="text-xs">{ kitQuery.error?.message || 'Ocurrió un error inesperado al consultar los datos.' }</p>
				<a
					href={ resolve( '/dashboard/kits' ) }
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-2.5 font-bold uppercase tracking-wider text-brand hover:bg-brand/10 transition-colors cursor-pointer"
				>
					Volver a la lista
				</a>
			</div>
		{:else}
			<div class="">
				<form
					id="kit-form"
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

							<!-- Visibilidad de Catálogo (Panel Derecho) -->
							<fieldset class="mt-5 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5">
								<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
									Estado de Publicación
								</legend>

								<div class="flex items-center justify-between">
									<span class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase">
										Habilitar Catálogo
									</span>

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
</PageContainer>

{#if ( showCategoryModal )}
	<CategoryFormModal
		show={ showCategoryModal }
		isEditing={ false }
		editingId=""
		context="kits"
		initialData={ null }
		onSave={ () => {
			showCategoryModal = false;
			queryClient.invalidateQueries( { queryKey : [ 'kit-categories' ] } );
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
	message     = { `¿Estás seguro de que deseas eliminar "${ productToDelete?.name }" de este kit? Esta acción no se puede deshacer.` }
	confirmText = "Eliminar"
	onConfirm   = { confirmDeleteProduct }
	onCancel    = { () => { productToDelete = null; } }
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
