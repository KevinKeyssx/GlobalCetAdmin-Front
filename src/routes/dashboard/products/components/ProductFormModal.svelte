<script lang="ts">
	import toast from 'svelte-french-toast';

	import FileUploader, { type UploadedFileItem } from '$lib/components/shared/FileUploader.svelte';
	import { globalLoadingStore }                   from '$lib/state/loading';
	import DashboardModal                           from '../../components/DashboardModal.svelte';

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
		subcategories : Array<{ id : string; name : string }>;
	}

	interface ProductInitial {
		name          : string;
		sku           : string;
		description   : string;
		materialId    : string;
		subcategoryId : string;
		active        : boolean;
		technicalSpecs: string;
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
	let formSpecs         = $state( '{"color":"verde"}' );
	const specsPlaceholder = 'Ej: {"color":"rojo", "size":"L"}';

	// File Uploader state
	let uploaderFiles     = $state< UploadedFileItem[] >( [] );
	let uploaderFilesInfo = $state( '' );

	// ─── Sync data on open ────────────────────────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName          = initialData.name;
			formSku           = initialData.sku;
			formDescription   = initialData.description;
			formMaterialId    = initialData.materialId || ( materials[ 0 ]?.id || '' );
			formSubcategoryId = initialData.subcategoryId || '';
			formActive        = initialData.active;
			formSpecs         = initialData.technicalSpecs || '{"color":"verde"}';
			uploaderFiles     = [];
			uploaderFilesInfo = '';
		} else if ( show && !initialData ) {
			formName          = '';
			formSku           = '';
			formDescription   = '';
			formMaterialId    = materials[ 0 ]?.id || '';
			
			const firstSub = categories.flatMap( ( c ) => c.subcategories || [] )[ 0 ];
			formSubcategoryId = firstSub?.id || '';

			formActive        = true;
			formSpecs         = '{"color":"verde"}';
			uploaderFiles     = [];
			uploaderFilesInfo = '';
		}
	} );

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
			formData.append( 'materialId', formMaterialId );
			formData.append( 'subcategoryId', formSubcategoryId );
			formData.append( 'active', String( formActive ) );
			formData.append( 'includeImages', 'true' );
			formData.append( 'includeKits', 'false' );
			formData.append( 'includeMobileLabs', 'false' );
			formData.append( 'technical_specs', formSpecs );

			// Sync file items
			formData.append( 'imagesInfo', uploaderFilesInfo || '[]' );

			uploaderFiles.forEach( ( u ) => {
				formData.append( 'files', u.file );
			} );

			const endpoint = isEditing ? `products?id=${ editingId }` : 'products';
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

			toast.success( isEditing ? 'Producto editado con éxito.' : 'Producto creado con éxito.', {
				style : 'background: #111f18; color: #00e676; border: 1px solid rgba(0, 230, 118, 0.2); font-family: Outfit;',
			} );

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
	title={ isEditing ? 'Modificar Producto' : 'Crear Nuevo Producto' }
	onClose={ onCancel }
	maxWidth="max-w-2xl"
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 text-xs font-bold text-text-muted">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Name -->
				<div class="space-y-1.5">
					<label for="prod-name">Nombre del Producto</label>
					<input
						id="prod-name"
						type="text"
						bind:value={ formName }
						placeholder="Ej: Vaso de Precipitado 250ml"
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-xs text-text outline-none focus:border-brand focus:bg-card"
					/>
				</div>

				<!-- SKU -->
				<div class="space-y-1.5">
					<label for="prod-sku">SKU Identificador</label>
					<input
						id="prod-sku"
						type="text"
						bind:value={ formSku }
						placeholder="Ej: CPRODUCT-002"
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-xs text-text outline-none focus:border-brand focus:bg-card"
					/>
				</div>
			</div>

			<!-- Description -->
			<div class="space-y-1.5">
				<label for="prod-desc">Descripción Completa</label>
				<textarea
					id="prod-desc"
					bind:value={ formDescription }
					placeholder="Describa el grado de pureza, dimensiones o aplicación pedagógica..."
					rows="3"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-xs text-text outline-none focus:border-brand focus:bg-card resize-none"
				></textarea>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Material select -->
				<div class="space-y-1.5">
					<label for="prod-material">Material</label>
					<select
						id="prod-material"
						bind:value={ formMaterialId }
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-xs text-text outline-none focus:border-brand focus:bg-card"
					>
						{#each materials as mat ( mat.id )}
							<option value={ mat.id }>{ mat.name }</option>
						{/each}
					</select>
				</div>

				<!-- Subcategory select -->
				<div class="space-y-1.5">
					<label for="prod-subcat">Subcategoría</label>
					<select
						id="prod-subcat"
						bind:value={ formSubcategoryId }
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-xs text-text outline-none focus:border-brand focus:bg-card"
					>
						{#each categories as cat ( cat.id )}
							<optgroup label={ cat.name }>
								{#each ( cat.subcategories || [] ) as sub ( sub.id )}
									<option value={ sub.id }>{ sub.name }</option>
								{/each}
							</optgroup>
						{/each}
					</select>
				</div>
			</div>

			<!-- Technical specs (JSON format) -->
			<div class="space-y-1.5">
				<label for="prod-specs">Especificaciones Técnicas (Formato JSON)</label>
				<textarea
					id="prod-specs"
					bind:value={ formSpecs }
					placeholder={ specsPlaceholder }
					rows="2"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-xs font-mono text-text outline-none focus:border-brand focus:bg-card"
				></textarea>
			</div>

			<!-- Custom Shared File Uploader (Dropzone area) -->
			<div class="space-y-1.5 border-t border-brand/5 pt-3">
				<span class="text-[10px] uppercase font-black tracking-wider text-brand">Carga de Imágenes Catálogo</span>
				<FileUploader
					bind:files={ uploaderFiles }
					bind:filesInfo={ uploaderFilesInfo }
				/>
			</div>

			<!-- Active checkbox -->
			<div class="flex items-center gap-3 pt-2">
				<input
					id="prod-active"
					type="checkbox"
					bind:checked={ formActive }
					class="accent-brand h-4 w-4 cursor-pointer"
				/>
				<label for="prod-active" class="cursor-pointer select-none">Habilitar en Catálogo Público</label>
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
					Guardar Producto
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
