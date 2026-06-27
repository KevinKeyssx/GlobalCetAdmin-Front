<script lang="ts">
	import toast                            from 'svelte-french-toast';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import { globalLoadingStore }           from '$lib/state/loading';
	import DashboardModal                   from '../../../components/DashboardModal.svelte';
	import InputText                        from '$lib/components/shared/Inputs/InputText.svelte';
	import TextArea                         from '$lib/components/shared/Inputs/TextArea.svelte';
	import InputNumber                      from '$lib/components/shared/Inputs/InputNumber.svelte';
	import Switch                           from '$lib/components/shared/Inputs/Switch.svelte';
	import SoftSelect                       from '$lib/components/shared/Inputs/SoftSelect.svelte';

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
		maxTemperature     : number | null;
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
	let formDescription        = $state( '' );
	let formAutoclavable       = $state( false );
	let formMaxTemp            = $state<number | string>( '' );
	let formAcidResistance     = $state( 'excellent' );
	let formAlkalineResistance = $state( 'good' );
	let formActive             = $state( true );

	// Error states
	let nameError              = $state( '' );

	const resistanceOptions = [
		{ id : 'excellent', name : 'Excelente' },
		{ id : 'good',      name : 'Buena' },
		{ id : 'fair',      name : 'Aceptable' },
		{ id : 'poor',      name : 'Baja' },
	];

	// ─── Sync initial data when modal opens ───────────────────────────────────────
	$effect( ( ) => {
		if ( show && initialData ) {
			formName               = initialData.name;
			formDescription        = initialData.description;
			formAutoclavable       = initialData.autoclavable;
			formMaxTemp            = initialData.maxTemperature ? initialData.maxTemperature : '';
			formAcidResistance     = initialData.acidResistance;
			formAlkalineResistance = initialData.alkalineResistance;
			formActive             = initialData.active;
			nameError              = '';
		} else if ( show && !initialData ) {
			formName               = '';
			formDescription        = '';
			formAutoclavable       = false;
			formMaxTemp            = '';
			formAcidResistance     = 'excellent';
			formAlkalineResistance = 'good';
			formActive             = true;
			nameError              = '';
		}
	} );

	// ─── TanStack Query client & mutation ─────────────────────────────────────────
	const queryClient = useQueryClient();

	const materialMutation = createMutation( ( ) => ( {
		mutationFn : async ( payload : any ) : Promise< any > => {
			const endpoint = isEditing ? `${ INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.BASE }?id=${ editingId }` : INTERNAL_ENDPOINTS.PRODUCTS.MATERIALS.BASE;
			const method   = isEditing ? METHOD.PUT : METHOD.POST;

			const response = await connectRequest< any >( {
				endpoint,
				method,
				body       : payload,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message );
			}

			return response;
		},
		onSuccess  : ( ) => {
			toast.success( isEditing ? 'Material modificado con éxito.' : 'Material agregado con éxito.' );
			queryClient.invalidateQueries( { queryKey : [ 'materials' ] } );
			onSave();
		},
		onError    : ( error : any ) => {
			toast.error( error.message || 'Error al guardar el material.' );
		},
	} ) );

	$effect( ( ) => {
		$globalLoadingStore = materialMutation.isPending;
		return ( ) => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Submit Handler ───────────────────────────────────────────────────────────
	function handleSubmit( e : Event ) : void {
		e.preventDefault();

		nameError = '';
		let hasError = false;

		if ( !formName.trim() ) {
			nameError = 'El nombre es obligatorio.';
			hasError  = true;
		}

		if ( hasError ) {
			return;
		}

		const payload = {
			name               : formName,
			description        : formDescription,
			autoclavable       : formAutoclavable,
			maxTemperature     : formMaxTemp !== '' ? Number( formMaxTemp ) : null,
			chemicalResistance : {
				acid     : formAcidResistance,
				alkaline : formAlkalineResistance,
			},
			active             : formActive,
		};

		materialMutation.mutate( payload );
	}
</script>

<DashboardModal
	{ show }
	title={ isEditing ? 'Modificar Material' : 'Agregar Nuevo Material' }
	onClose={ onCancel }
	overflowVisible={ true }
>
	{#snippet body()}
		<form onsubmit={ handleSubmit } class="space-y-4 font-bold text-text-muted">
			<!-- Name -->
			<div class="space-y-1.5">
				<label for="material-name">Nombre del Material</label>
				<InputText
					id="material-name"
					bind:value={ formName }
					error={ nameError }
					placeholder="Ej: Vidrio de Borosilicato 3.3"
				/>
			</div>

			<!-- Description -->
			<div class="space-y-1.5">
				<label for="material-desc">Descripción</label>
				<TextArea
					id="material-desc"
					bind:value={ formDescription }
					placeholder="Escriba las especificaciones o usos recomendados..."
					rows={ 3 }
					class="w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card resize-none"
				/>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Autoclavable -->
				<div class="flex items-center justify-between rounded-xl border border-brand/10 bg-surface/30 p-3.5 px-4 h-[62px] self-end">
					<span class="select-none">¿Es Autoclavable?</span>
					<Switch
						bind:checked  = { formAutoclavable }
						id            = "material-autoclavable"
						labelActive   = "Sí"
						labelInactive = "No"
					/>
				</div>

				<!-- Max Temp -->
				<div class="space-y-1.5">
					<label for="material-temp">Temperatura Máxima (°C)</label>
					<InputNumber
						bind:value={ formMaxTemp }
						class="w-full h-9 rounded-xl"
						width="w-full flex-1 text-[14px] font-mono"
					/>
				</div>
			</div>

			<!-- Chemical Resistance -->
			<span class="text-[10px] uppercase font-black tracking-wider text-brand">Resistencia Química</span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                <div class="space-y-1.5">
                    <label for="acid-res">Frente a Ácidos</label>
                    <SoftSelect
                        options={ resistanceOptions }
                        bind:value={ formAcidResistance }
                        placeholder="Seleccionar resistencia..."
                    />
                </div>

                <div class="space-y-1.5">
                    <label for="alkaline-res">Frente a Alcalinos</label>
                    <SoftSelect
                        options={ resistanceOptions }
                        bind:value={ formAlkalineResistance }
                        placeholder="Seleccionar resistencia..."
                    />
                </div>
            </div>

			<!-- Active checkbox -->
			<div class="flex items-center justify-between pt-2">
				<span class="cursor-pointer select-none">Habilitar en Catálogo</span>
				<Switch
					bind:checked  = { formActive }
					id            = "material-active"
					labelActive   = "Habilitado"
					labelInactive = "Deshabilitado"
				/>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-3 border-t border-brand/10 pt-4">
				<button
					type="button"
					onclick={ onCancel }
					disabled={ materialMutation.isPending }
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-3 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-colors disabled:opacity-50"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={ materialMutation.isPending }
					class="rounded-xl bg-brand px-5 py-3 font-bold uppercase tracking-wider text-surface-dark shadow-card hover:bg-brand-bright transition-colors disabled:opacity-50"
				>
					{ materialMutation.isPending ? 'Guardando...' : 'Guardar' }
				</button>
			</div>
		</form>
	{/snippet}
</DashboardModal>
