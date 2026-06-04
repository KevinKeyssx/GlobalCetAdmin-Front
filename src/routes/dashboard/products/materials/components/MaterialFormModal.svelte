<script lang="ts">
	import toast from 'svelte-french-toast';

	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { METHOD }                     from '$lib/services/http-codes';
	import { globalLoadingStore }         from '$lib/state/loading';
	import DashboardModal                 from '../../../components/DashboardModal.svelte';
	import Select                         from '$lib/components/shared/Select.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface MaterialFormProps {
		show        : boolean;
		isEditing   : boolean;
		editingId   : string;
		initialData : MaterialInitial | null;
		onSave      : () => void;
		onCancel    : () => void;
	}

	interface MaterialInitial {
		name               : string;
		slug               : string;
		description        : string;
		autoclavable       : boolean;
		maxTemperature     : number;
		acidResistance     : string;
		alkalineResistance : string;
		active             : boolean;
	}

	let {
		show,
		isEditing,
		editingId,
		initialData,
		onSave,
		onCancel,
	} : MaterialFormProps = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formName               = $state( '' );
	let formSlug               = $state( '' );
	let formDescription        = $state( '' );
	let formAutoclavable       = $state( false );
	let formMaxTemp            = $state( 120 );
	let formAcidResistance     = $state( 'excellent' );
	let formAlkalineResistance = $state( 'good' );
	let formActive             = $state( true );

	const resistanceOptions = [
		{ id : 'excellent', name : 'Excelente' },
		{ id : 'good',      name : 'Buena' },
		{ id : 'fair',      name : 'Aceptable' },
		{ id : 'poor',      name : 'Baja' },
	];

	// ─── Sync initial data when modal opens ───────────────────────────────────────
	$effect( () => {
		if ( show && initialData ) {
			formName               = initialData.name;
			formSlug               = initialData.slug;
			formDescription        = initialData.description;
			formAutoclavable       = initialData.autoclavable;
			formMaxTemp            = initialData.maxTemperature;
			formAcidResistance     = initialData.acidResistance;
			formAlkalineResistance = initialData.alkalineResistance;
			formActive             = initialData.active;
		} else if ( show && !initialData ) {
			formName               = '';
			formSlug               = '';
			formDescription        = '';
			formAutoclavable       = false;
			formMaxTemp            = 120;
			formAcidResistance     = 'excellent';
			formAlkalineResistance = 'good';
			formActive             = true;
		}
	} );

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	async function handleSubmit( e : Event ) : Promise<void> {
		e.preventDefault();

		if ( !formName.trim() ) {
			toast.error( 'El nombre del material es requerido.' );
			return;
		}

		$globalLoadingStore = true;
		const payload = {
			name               : formName,
			slug               : formSlug || formName.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /(^-|-$)/g, '' ),
			description        : formDescription,
			autoclavable       : formAutoclavable,
			maxTemperature     : Number( formMaxTemp ) || 100,
			chemicalResistance : {
				acid     : formAcidResistance,
				alkaline : formAlkalineResistance,
			},
			active             : formActive,
		};

		try {
			const endpoint = isEditing ? `products/materials?id=${ editingId }` : 'products/materials';
			const method   = isEditing ? METHOD.PUT : METHOD.POST;

			const response = await connectRequest< any >( {
				endpoint,
				method,
				body       : payload,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error: ${ response.message }` );
				return;
			}

			toast.success( isEditing ? 'Material modificado con éxito.' : 'Material agregado con éxito.' );

			onSave();
		} catch ( err : any ) {
			toast.error( 'Error de red al intentar guardar el material.' );
		} finally {
			$globalLoadingStore = false;
		}
	}
</script>

<DashboardModal
	{ show }
	title={ isEditing ? 'Modificar Material' : 'Agregar Nuevo Material' }
	onClose={ onCancel }
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 font-bold text-text-muted">
			<!-- Name -->
			<div class="space-y-1.5">
				<label for="material-name">Nombre del Material</label>
				<input
					id="material-name"
					type="text"
					bind:value={ formName }
					placeholder="Ej: Vidrio de Borosilicato 3.3"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
				/>
			</div>

			<!-- Slug -->
			<div class="space-y-1.5">
				<label for="material-slug">Slug (URL identificador)</label>
				<input
					id="material-slug"
					type="text"
					bind:value={ formSlug }
					placeholder="Ej: borosilicato-3-3"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
				/>
			</div>

			<!-- Description -->
			<div class="space-y-1.5">
				<label for="material-desc">Descripción</label>
				<textarea
					id="material-desc"
					bind:value={ formDescription }
					placeholder="Escriba las especificaciones o usos recomendados..."
					rows="3"
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card resize-none"
				></textarea>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<!-- Autoclavable -->
				<div class="flex items-center gap-3 rounded-xl border border-brand/10 bg-input p-3">
					<input
						id="material-auto"
						type="checkbox"
						bind:checked={ formAutoclavable }
						class="accent-brand h-4 w-4 cursor-pointer"
					/>
					<label for="material-auto" class="cursor-pointer select-none">¿Es Autoclavable?</label>
				</div>

				<!-- Max Temp -->
				<div class="space-y-1.5">
					<label for="material-temp">Temperatura Máxima (°C)</label>
					<input
						id="material-temp"
						type="number"
						bind:value={ formMaxTemp }
						class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card"
					/>
				</div>
			</div>

			<!-- Chemical Resistance -->
			<div class="space-y-2 border-t border-brand/5 pt-3">
				<span class="text-[10px] uppercase font-black tracking-wider text-brand">Resistencia Química</span>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="acid-res">Frente a Ácidos</label>
						<Select
							options={ resistanceOptions }
							bind:value={ formAcidResistance }
							multiple={ false }
							placeholder="Seleccionar resistencia..."
						/>
					</div>

					<div class="space-y-1.5">
						<label for="alkaline-res">Frente a Alcalinos</label>
						<Select
							options={ resistanceOptions }
							bind:value={ formAlkalineResistance }
							multiple={ false }
							placeholder="Seleccionar resistencia..."
						/>
					</div>
				</div>
			</div>

			<!-- Active checkbox -->
			<div class="flex items-center gap-3 pt-2">
				<input
					id="material-active"
					type="checkbox"
					bind:checked={ formActive }
					class="accent-brand h-4 w-4 cursor-pointer"
				/>
				<label for="material-active" class="cursor-pointer select-none">Habilitar en Catálogo</label>
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
					Guardar
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
