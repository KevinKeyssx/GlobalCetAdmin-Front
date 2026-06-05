<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import FileUploader, { type UploadedFileItem } from '$lib/components/shared/FileUploader.svelte';
	import { globalLoadingStore }                   from '$lib/state/loading';
	import connectRequest, { isApiError }           from '$lib/services/fetch.service';
	import { METHOD }                               from '$lib/services/http-codes';
	import DashboardModal                           from '../../components/DashboardModal.svelte';
	import Select                                   from '$lib/components/shared/Select.svelte';

	import type { LabInitial, LabProduct, LabKit } from '$lib/types/lab';

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
	let formProducts        = $state< LabProduct[] >( [] );
	let formKits            = $state< LabKit[] >( [] );
	let selectedAddProd     = $state( '' );
	let selectedAddKit      = $state( '' );
	let uploaderFiles       = $state< UploadedFileItem[] >( [] );// File Uploader state
	let uploaderFilesInfo   = $state( '' );

	const mappedProducts = $derived.by( () => {
		return catalogProducts.map( ( prod ) => ( {
			id   : prod.id,
			name : `[${ prod.sku }] ${ prod.name }`,
		} ) );
	} );

	const mappedKits = $derived.by( () => {
		return catalogKits.map( ( kit ) => ( {
			id   : kit.id,
			name : `[${ kit.sku }] ${ kit.name }`,
		} ) );
	} );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( ( ) => {
		if ( show && initialData ) {
			formName          = initialData.name;
			formSku           = initialData.sku;
			formDescription   = initialData.description;
			const parsed      = parseDimensions( initialData.dimensions );
			dimLength         = parsed.length;
			dimWidth          = parsed.width;
			dimHeight         = parsed.height;
			formCategoryId    = initialData.categoryId || ( categories[ 0 ]?.id || '' );
			formActive        = initialData.active;
			formProducts      = initialData.products || [];
			formKits          = initialData.kits || [];
			selectedAddProd   = catalogProducts[ 0 ]?.id || '';
			selectedAddKit    = catalogKits[ 0 ]?.id || '';
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
			selectedAddProd   = '';
			selectedAddKit    = '';
			uploaderFiles     = [];
			uploaderFilesInfo = '';
		}
	} );

	// ─── Relation Helpers ─────────────────────────────────────────────────────────
	function addProductToForm() : void {
		if ( !selectedAddProd ) return;

		// Check if already added
		if ( formProducts.some( ( p ) => p.productId === selectedAddProd ) ) {
			toast.error( 'Este producto ya está agregado al laboratorio.' );
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

	function addKitToForm() : void {
		if ( !selectedAddKit ) return;

		// Check if already added
		if ( formKits.some( ( k ) => k.kitId === selectedAddKit ) ) {
			toast.error( 'Este kit ya está agregado al laboratorio.' );
			return;
		}

		const match = catalogKits.find( ( k ) => k.id === selectedAddKit );
		if ( match ) {
			formKits = [
				...formKits,
				{
					kitId    : selectedAddKit,
					quantity : 1,
					kit      : {
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

	function removeKitFromForm( id : string ) : void {
		formKits = formKits.filter( ( k ) => k.kitId !== id );
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

	$effect( () => {
		$globalLoadingStore = labMutation.isPending;
		return () => {
			$globalLoadingStore = false;
		};
	} );

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
		formData.append( 'dimensions', formDimensions );
		formData.append( 'categoryId', formCategoryId );
		formData.append( 'active', String( formActive ) );

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

		labMutation.mutate( { isEditing, editingId, formData } );
	}
</script>

<DashboardModal
	{ show }
	title={ isEditing ? 'Modificar Laboratorio Móvil' : 'Crear Nuevo Laboratorio' }
	onClose={ onCancel }
	maxWidth="max-w-2xl"
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 font-bold text-text-muted">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Name -->
				<div class="space-y-1.5">
					<label for="lab-name">Nombre del Laboratorio</label>
					<input
						id="lab-name"
						type="text"
						bind:value={ formName }
						placeholder="Ej: Laboratorio Móvil de Física"
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
					/>
				</div>

				<!-- SKU -->
				<div class="space-y-1.5">
					<label for="lab-sku">SKU Identificador</label>

                    <input
						id="lab-sku"
						type="text"
						bind:value={ formSku }
						placeholder="Ej: CLAB-001"
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Dimensions -->
				<div class="space-y-1.5">
					<label for="dim-length">Dimensiones (Largo x Ancho x Alto en metros)</label>

                    <div class="grid grid-cols-3 gap-2">
						<input
							id="dim-length"
							type="number"
							step="0.1"
							min="0"
							bind:value={ dimLength }
							placeholder="Largo"
							class="w-full rounded-xl border border-brand/15 bg-input px-3 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
						/>

                        <input
							id="dim-width"
							type="number"
							step="0.1"
							min="0"
							bind:value={ dimWidth }
							placeholder="Ancho"
							class="w-full rounded-xl border border-brand/15 bg-input px-3 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
						/>

                        <input
							id="dim-height"
							type="number"
							step="0.1"
							min="0"
							bind:value={ dimHeight }
							placeholder="Alto"
							class="w-full rounded-xl border border-brand/15 bg-input px-3 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
						/>
					</div>
				</div>

				<!-- Category Select -->
				<div class="space-y-1.5">
					<label for="lab-cat">Categoría Científica</label>

                    <Select
						options={ categories }
						bind:value={ formCategoryId }
						multiple={ false }
						placeholder="Seleccionar categoría..."
					/>
				</div>
			</div>

			<!-- Description -->
			<div class="space-y-1.5">
				<label for="lab-desc">Descripción Completa del Laboratorio</label>

                <textarea
					id="lab-desc"
					bind:value={ formDescription }
					placeholder="Describa la infraestructura técnica, conexiones eléctricas, suministro de agua, etc..."
					rows="3"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card resize-none"
				></textarea>
			</div>

			<!-- DUAL SELECTOR IN FORM: PRODUCTS AND KITS -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- PRODUCTS RELATION -->
				<div class="space-y-3 rounded-2xl border border-brand/15 bg-surface/20 p-4 flex flex-col h-[280px]">
					<span class="text-[10px] uppercase font-black tracking-wider text-brand">Productos / Insumos Individuales</span>

					<div class="flex gap-1.5">
						<Select
							options={ mappedProducts }
							bind:value={ selectedAddProd }
							multiple={ false }
							placeholder="Seleccionar producto..."
						/>

                        <button
							type="button"
							onclick={ addProductToForm }
							class="rounded-xl border border-brand bg-brand/10 hover:bg-brand hover:text-surface-dark px-3 py-2 transition-colors font-bold uppercase text-[10px]"
						>
							+
						</button>
					</div>

					<div class="flex-1 overflow-y-auto space-y-2 border-t border-brand/5 pt-2">
						{#each formProducts as item ( item.productId )}
							<div class="flex items-center justify-between rounded-xl bg-input p-2 border border-brand/5 text-[10px]">
								<div class="space-y-0.5 max-w-[60%]">
									<span class="font-bold text-text truncate block">{ item.product?.name || 'Insumo' }</span>
								</div>

                                <div class="flex items-center gap-2">
									<input
										type="number"
										min="1"
										bind:value={ item.quantity }
										class="w-10 text-center rounded-lg border border-brand/15 bg-card py-0.5 text-text font-bold"
									/>

                                    <button
										type="button"
										onclick={ () => removeProductFromForm( item.productId ) }
										class="text-red-400 font-bold"
									>
										×
									</button>
								</div>
							</div>
						{:else}
							<div class="text-center py-8 text-text-muted text-[10px]">Sin insumos agregados.</div>
						{/each}
					</div>
				</div>

				<!-- KITS RELATION -->
				<div class="space-y-3 rounded-2xl border border-brand/15 bg-surface/20 p-4 flex flex-col h-[280px]">
					<span class="text-[10px] uppercase font-black tracking-wider text-brand">Kits Pedagógicos Integrados</span>

					<div class="flex gap-1.5">
						<Select
							options={ mappedKits }
							bind:value={ selectedAddKit }
							multiple={ false }
							placeholder="Seleccionar kit..."
						/>

                        <button
							type="button"
							onclick={ addKitToForm }
							class="rounded-xl border border-brand bg-brand/10 hover:bg-brand hover:text-surface-dark px-3 py-2 transition-colors font-bold uppercase text-[10px]"
						>
							+
						</button>
					</div>

					<div class="flex-1 overflow-y-auto space-y-2 border-t border-brand/5 pt-2">
						{#each formKits as item ( item.kitId )}
							<div class="flex items-center justify-between rounded-xl bg-input p-2 border border-brand/5 text-[10px]">
								<div class="space-y-0.5 max-w-[60%]">
									<span class="font-bold text-text truncate block">{ item.kit?.name || 'Kit' }</span>
								</div>

                                <div class="flex items-center gap-2">
									<input
										type="number"
										min="1"
										bind:value={ item.quantity }
										class="w-10 text-center rounded-lg border border-brand/15 bg-card py-0.5 text-text font-bold"
									/>

                                    <button
										type="button"
										onclick={ () => removeKitFromForm( item.kitId ) }
										class="text-red-400 font-bold"
									>
										×
									</button>
								</div>
							</div>
						{:else}
							<div class="text-center py-8 text-text-muted text-[10px]">Sin kits agregados.</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Image Dropzone Area -->
			<div class="space-y-1.5 border-t border-brand/5 pt-3">
				<span class="text-[10px] uppercase font-black tracking-wider text-brand">Imágenes del Laboratorio</span>

                <FileUploader
					bind:files={ uploaderFiles }
					bind:filesInfo={ uploaderFilesInfo }
				/>
			</div>

			<!-- Active Checkbox -->
			<div class="flex items-center gap-3 pt-2">
				<input
					id="lab-active"
					type="checkbox"
					bind:checked={ formActive }
					class="accent-brand h-4 w-4 cursor-pointer"
				/>

                <label for="lab-active" class="cursor-pointer select-none">Habilitar en Catálogo Público</label>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-3 border-t border-brand/10 pt-4">
				<button
					type="button"
					onclick={ onCancel }
					disabled={ labMutation.isPending }
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-3 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancelar
				</button>

                <button
					type="submit"
					disabled={ labMutation.isPending }
					class="rounded-xl bg-brand px-5 py-3 font-bold uppercase tracking-wider text-surface-dark shadow-card hover:bg-brand-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{ labMutation.isPending ? 'Guardando...' : 'Guardar Laboratorio' }
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
