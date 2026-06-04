<script lang="ts">
	import toast from 'svelte-french-toast';

	import FileUploader, {
        type UploadedFileItem
    }                               from '$lib/components/shared/FileUploader.svelte';
	import { globalLoadingStore }   from '$lib/state/loading';
	import DashboardModal           from '../../components/DashboardModal.svelte';
	import Select                   from '$lib/components/shared/Select.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface ProductRelation {
		id   : string;
		name : string;
		sku  : string;
	}

	interface KitProduct {
		productId : string;
		quantity  : number;
		product?  : ProductRelation;
	}

	interface KitCategory {
		id   : string;
		name : string;
	}

	interface CatalogProduct {
		id   : string;
		name : string;
		sku  : string;
	}

	interface KitFormProps {
		show            : boolean;
		isEditing       : boolean;
		editingId       : string;
		initialData     : KitInitial | null;
		categories      : KitCategory[];
		catalogProducts : CatalogProduct[];
		onSave          : () => void;
		onCancel        : () => void;
	}

	interface KitInitial {
		name        : string;
		sku         : string;
		description : string;
		categoryId  : string;
		active      : boolean;
		products    : KitProduct[];
	}

	let {
		show,
		isEditing,
		editingId,
		initialData,
		categories,
		catalogProducts,
		onSave,
		onCancel,
	} : KitFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName        = $state( '' );
	let formSku         = $state( '' );
	let formDescription = $state( '' );
	let formCategoryId  = $state( '' );
	let formActive      = $state( true );

	// Relations list state (Selected products in this kit)
	let formProducts    = $state< KitProduct[] >( [] );
	let selectedAddProd = $state( '' );

	const mappedProducts = $derived.by( () => {
		return catalogProducts.map( ( prod ) => ( {
			id   : prod.id,
			name : `[${ prod.sku }] ${ prod.name }`,
		} ) );
	} );

	// File Uploader state
	let uploaderFiles     = $state< UploadedFileItem[] >( [] );
	let uploaderFilesInfo = $state( '' );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName          = initialData.name;
			formSku           = initialData.sku;
			formDescription   = initialData.description;
			formCategoryId    = initialData.categoryId || ( categories[ 0 ]?.id || '' );
			formActive        = initialData.active;
			formProducts      = initialData.products || [];
			selectedAddProd   = catalogProducts[ 0 ]?.id || '';
			uploaderFiles     = [];
			uploaderFilesInfo = '';
		} else if ( show && !initialData ) {
			formName          = '';
			formSku           = '';
			formDescription   = '';
			formCategoryId    = categories[ 0 ]?.id || '';
			formActive        = true;
			formProducts      = [];
			selectedAddProd   = catalogProducts[ 0 ]?.id || '';
			uploaderFiles     = [];
			uploaderFilesInfo = '';
		}
	} );

	// ─── Relation Helpers ─────────────────────────────────────────────────────────
	function addProductToForm() : void {
		if ( !selectedAddProd ) return;

		// Check if already added
		if ( formProducts.some( ( p ) => p.productId === selectedAddProd ) ) {
			toast.error( 'Este producto ya está agregado al kit.' );
			return;
		}

		const match = catalogProducts.find( ( p ) => p.id === selectedAddProd );
		if ( match ) {
			formProducts = [
				...formProducts,
				{
					productId : selectedAddProd,
					quantity  : 1,
					product   : {
						id   : match.id,
						name : match.name,
						sku  : match.sku,
					},
				},
			];
		}
	}

	function removeProductFromForm( id : string ) : void {
		formProducts = formProducts.filter( ( p ) => p.productId !== id );
	}

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	async function handleSubmit( e : Event ) : Promise<void> {
		e.preventDefault();

		if ( !formName.trim() || !formSku.trim() ) {
			toast.error( 'Nombre y SKU son obligatorios.' );
			return;
		}

		$globalLoadingStore = true;
		try {
			const formData = new FormData();
			formData.append( 'name', formName );
			formData.append( 'sku', formSku );
			formData.append( 'description', formDescription );
			formData.append( 'categoryId', formCategoryId );
			formData.append( 'active', String( formActive ) );

			// Format products relation info
			const mappedRelations = formProducts.map( ( p ) => ( {
				productId : p.productId,
				quantity  : Number( p.quantity ) || 1,
			} ) );
			formData.append( 'products', JSON.stringify( mappedRelations ) );

			// Images
			formData.append( 'filesInfo', uploaderFilesInfo || '[]' );
			uploaderFiles.forEach( ( u ) => {
				formData.append( 'files', u.file );
			} );

			const endpoint = isEditing ? `kits?id=${ editingId }` : 'kits';
			const method   = isEditing ? 'PUT' : 'POST';

			const response = await fetch( `/api/${ endpoint }`, {
				method,
				body : formData,
			} );

			if ( !response.ok ) {
				const err = await response.json().catch( () => ( { error : 'Error al guardar.' } ) );
				toast.error( `Error: ${ err.error || err.message }` );
				return;
			}

			toast.success( isEditing ? 'Kit editado con éxito.' : 'Kit creado con éxito.' );

			onSave();
		} catch ( err ) {
			toast.error( 'Error de red al enviar el formulario.' );
		} finally {
			$globalLoadingStore = false;
		}
	}
</script>

<DashboardModal
	{ show }
	title={ isEditing ? 'Modificar Kit' : 'Crear Nuevo Kit' }
	onClose={ onCancel }
	maxWidth="max-w-2xl"
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 font-bold text-text-muted">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Name -->
				<div class="space-y-1.5">
					<label for="kit-name">Nombre del Kit</label>
					<input
						id="kit-name"
						type="text"
						bind:value={ formName }
						placeholder="Ej: Kit de Bioquímica Básica"
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
					/>
				</div>

				<!-- SKU -->
				<div class="space-y-1.5">
					<label for="kit-sku">SKU Identificador</label>
					<input
						id="kit-sku"
						type="text"
						bind:value={ formSku }
						placeholder="Ej: CKIT-001"
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
					/>
				</div>
			</div>

			<!-- Description -->
			<div class="space-y-1.5">
				<label for="kit-desc">Descripción Completa del Kit</label>
				<textarea
					id="kit-desc"
					bind:value={ formDescription }
					placeholder="Indique los módulos pedagógicos, experimentos integrados o guías de laboratorio incluidas..."
					rows="3"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card resize-none"
				></textarea>
			</div>

			<!-- Category Select -->
			<div class="space-y-1.5">
				<label for="kit-category">Categoría Científica</label>
				<Select
					options={ categories }
					bind:value={ formCategoryId }
					multiple={ false }
					placeholder="Seleccionar categoría..."
				/>
			</div>

			<!-- PRODUCTS SELECTOR IN FORM -->
			<div class="space-y-3 rounded-2xl border border-brand/15 bg-surface/20 p-4">
				<span class="text-[10px] uppercase font-black tracking-wider text-brand">Productos Incluidos en este Kit</span>

				<div class="flex items-center gap-2">
					<Select
						options={ mappedProducts }
						bind:value={ selectedAddProd }
						multiple={ false }
						placeholder="Seleccionar producto..."
					/>
					<button
						type="button"
						onclick={ addProductToForm }
						class="rounded-xl border border-brand bg-brand/10 hover:bg-brand hover:text-surface-dark px-4 py-2.5 transition-colors font-bold uppercase"
					>
						Agregar
					</button>
				</div>

				<!-- Selected items list -->
				<div class="max-h-48 overflow-y-auto space-y-2 border-t border-brand/5 pt-2">
					{#each formProducts as item ( item.productId )}
						<div class="flex items-center justify-between rounded-xl bg-input p-2.5 border border-brand/5 text-[11px]">
							<div class="space-y-0.5 max-w-[70%]">
								<span class="font-mono text-[9px] text-brand/80 font-bold block">{ item.product?.sku || 'PROD' }</span>
								<span class="font-bold text-text truncate block">{ item.product?.name || 'Producto' }</span>
							</div>

							<div class="flex items-center gap-3">
								<div class="flex items-center gap-1.5">
									<span class="text-[10px] text-text-muted">Cant:</span>
									<input
										type="number"
										min="1"
										bind:value={ item.quantity }
										class="w-12 text-center rounded-lg border border-brand/15 bg-card py-1 text-text font-bold"
									/>
								</div>
								<button
									type="button"
									onclick={ () => removeProductFromForm( item.productId ) }
									class="text-red-400 hover:text-red-300 font-bold uppercase text-[10px] tracking-wide"
								>
									Eliminar
								</button>
							</div>
						</div>
					{:else}
						<div class="text-center py-4 text-text-muted text-[11px]">No hay productos seleccionados para este Kit.</div>
					{/each}
				</div>
			</div>

			<!-- Image Dropzone Area -->
			<div class="space-y-1.5 border-t border-brand/5 pt-3">
				<span class="text-[10px] uppercase font-black tracking-wider text-brand">Imágenes del Kit</span>
				<FileUploader
					bind:files={ uploaderFiles }
					bind:filesInfo={ uploaderFilesInfo }
				/>
			</div>

			<!-- Active Checkbox -->
			<div class="flex items-center gap-3 pt-2">
				<input
					id="kit-active"
					type="checkbox"
					bind:checked={ formActive }
					class="accent-brand h-4 w-4 cursor-pointer"
				/>
				<label for="kit-active" class="cursor-pointer select-none">Habilitar en Catálogo Público</label>
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
					Guardar Kit
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
