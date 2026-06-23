<script lang="ts">
	import { untrack } from 'svelte';

	import {
        formatRut,
        validateRut,
        validateEmail
    }                           from '$lib/utils/string';
    import type {
        Quote,
        QuoteSavePayload
    }                           from '$lib/types/quotes';
	import ConfirmationModal    from '$lib/components/shared/ConfirmationModal.svelte';
	import ProductSelectManager from '$lib/components/shared/ProductSelectManager.svelte';
	import KitSelectManager     from '$lib/components/shared/KitSelectManager.svelte';
	import LabSelectManager     from '$lib/components/shared/LabSelectManager.svelte';
	import InputText            from '$lib/components/shared/Inputs/InputText.svelte';
	import RichTextEditor       from '$lib/components/editor/RichTextEditor.svelte';
	import DashboardModal       from '../../components/DashboardModal.svelte';


	interface ProductRelation {
		productId : string;
		quantity  : number;
		product?  : { id : string; name : string; sku : string };
	}


	interface KitRelation {
		kitId    : string;
		quantity : number;
		kit?     : { id : string; name : string; sku : string };
	}


	interface LabRelation {
		mobileLabId : string;
		quantity    : number;
		mobileLab?  : { id : string; name : string; sku : string };
	}


	interface Props {
		show        : boolean;
		isEditing   : boolean;
		initialData : Quote | null;
		onSave      : ( payload : QuoteSavePayload ) => void;
		onCancel    : ( ) => void;
	}

	let {
		show,
		isEditing,
		initialData,
		onSave,
		onCancel,
	} : Props = $props();

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formCompanyName = $state( '' );
	let formRut         = $state( '' );
	let formEmail       = $state( '' );
	let formContactName = $state( '' );
	let formAddress     = $state( '' );
	let formAdminNotes  = $state( '' );

	// Relations lists
	let formProducts = $state< ProductRelation[] >( [ ] );
	let formKits     = $state< KitRelation[] >( [ ] );
	let formLabs     = $state< LabRelation[] >( [ ] );

	// Error states
	let companyNameError = $state( '' );
	let rutError         = $state( '' );
	let emailError       = $state( '' );
	let contactNameError = $state( '' );
	let addressError     = $state( '' );
	let itemsError       = $state( '' );

	let showWarningConfirm = $state( false );

	// Sync initial data on open
	let initialProductsRelation = $derived(
		initialData?.items
			.filter( ( item ) => item.type === 'product' )
			.map( ( item ) => ( { productId : item.id } ) ) || [ ]
	);

	let initialKitsRelation = $derived(
		initialData?.items
			.filter( ( item ) => item.type === 'kit' )
			.map( ( item ) => ( { kitId : item.id } ) ) || [ ]
	);

	let initialLabsRelation = $derived(
		initialData?.items
			.filter( ( item ) => item.type === 'mobileLab' )
			.map( ( item ) => ( { mobileLabId : item.id } ) ) || [ ]
	);

	$effect( ( ) => {
		if ( show && initialData ) {
			formCompanyName = initialData.clientData.companyName;
			formRut         = initialData.clientData.rut;
			formEmail       = initialData.clientData.email;
			formContactName = initialData.clientData.contactName;
			formAddress     = initialData.clientData.address || '';
			formAdminNotes  = initialData.adminNotes || '';

			formProducts = initialData.items
				.filter( ( item ) => item.type === 'product' )
				.map( ( item ) => ( {
					productId : item.id,
					quantity  : item.quantity,
					product   : { id : item.id, name : item.name, sku : '' },
				} ) );

			formKits = initialData.items
				.filter( ( item ) => item.type === 'kit' )
				.map( ( item ) => ( {
					kitId    : item.id,
					quantity : item.quantity,
					kit      : { id : item.id, name : item.name, sku : '' },
				} ) );

			formLabs = initialData.items
				.filter( ( item ) => item.type === 'mobileLab' )
				.map( ( item ) => ( {
					mobileLabId : item.id,
					quantity    : item.quantity,
					mobileLab   : { id : item.id, name : item.name, sku : '' },
				} ) );

			companyNameError = '';
			rutError         = '';
			emailError       = '';
			contactNameError = '';
			addressError     = '';
			itemsError       = '';
		} else if ( show && !initialData ) {
			formCompanyName = '';
			formRut         = '';
			formEmail       = '';
			formContactName = '';
			formAddress     = '';
			formAdminNotes  = '';
			formProducts    = [ ];
			formKits        = [ ];
			formLabs        = [ ];

			companyNameError = '';
			rutError         = '';
			emailError       = '';
			contactNameError = '';
			addressError     = '';
			itemsError       = '';
		}
	} );

	// Reactive RUT Formatting and Real-time Validation
	$effect( ( ) => {
		const raw = formRut;
		untrack( ( ) => {
			const formatted = formatRut( raw );
			if ( formatted !== raw ) {
				formRut = formatted;
			}
			if ( formRut.length >= 8 ) {
				if ( !validateRut( formRut ) ) {
					rutError = 'RUT inválido';
				} else {
					rutError = '';
				}
			} else {
				rutError = '';
			}
		} );
	} );

	// Relation managers removal handlers
	function removeProduct( id : string ) : void {
		formProducts = formProducts.filter( ( p ) => p.productId !== id );
	}

	function removeKit( id : string ) : void {
		formKits = formKits.filter( ( k ) => k.kitId !== id );
	}

	function removeLab( id : string ) : void {
		formLabs = formLabs.filter( ( l ) => l.mobileLabId !== id );
	}

	// Compare items lists to detect changes in items/quantities
	function hasItemsChanged( ) : boolean {
		if ( !isEditing || !initialData ) {
			return false;
		}

		const initialProducts = ( initialData.items || [ ] )
			.filter( ( item ) => item.type === 'product' )
			.map( ( item ) => `${ item.id }:${ item.quantity }` )
			.sort();

		const currentProducts = formProducts
			.map( ( p ) => `${ p.productId }:${ p.quantity }` )
			.sort();

		const initialKits = ( initialData.items || [ ] )
			.filter( ( item ) => item.type === 'kit' )
			.map( ( item ) => `${ item.id }:${ item.quantity }` )
			.sort();

		const currentKits = formKits
			.map( ( k ) => `${ k.kitId }:${ k.quantity }` )
			.sort();

		const initialLabs = ( initialData.items || [ ] )
			.filter( ( item ) => item.type === 'mobileLab' )
			.map( ( item ) => `${ item.id }:${ item.quantity }` )
			.sort();

		const currentLabs = formLabs
			.map( ( l ) => `${ l.mobileLabId }:${ l.quantity }` )
			.sort();

		const productsChanged = JSON.stringify( initialProducts ) !== JSON.stringify( currentProducts );
		const kitsChanged     = JSON.stringify( initialKits ) !== JSON.stringify( currentKits );
		const labsChanged     = JSON.stringify( initialLabs ) !== JSON.stringify( currentLabs );

		return productsChanged || kitsChanged || labsChanged;
	}

	function handleSubmit( event : Event ) : void {
		event.preventDefault( );

		companyNameError = '';
		rutError         = '';
		emailError       = '';
		contactNameError = '';
		addressError     = '';
		itemsError       = '';

		let isValid = true;

		if ( !formCompanyName.trim( ) ) {
			companyNameError = 'El nombre de empresa es obligatorio';
			isValid          = false;
		}

		if ( !formRut.trim( ) ) {
			rutError = 'El RUT es obligatorio';
			isValid  = false;
		} else if ( !validateRut( formRut ) ) {
			rutError = 'El RUT ingresado no es válido';
			isValid  = false;
		}

		if ( !formEmail.trim( ) ) {
			emailError = 'El email es obligatorio';
			isValid    = false;
		} else if ( !validateEmail( formEmail ) ) {
			emailError = 'El email ingresado no es válido';
			isValid    = false;
		}

		if ( !formContactName.trim( ) ) {
			contactNameError = 'El nombre de contacto es obligatorio';
			isValid          = false;
		}

		if ( !formAddress.trim( ) ) {
			addressError = 'La dirección es obligatoria';
			isValid      = false;
		}

		const totalCount = formProducts.length + formKits.length + formLabs.length;
		if ( totalCount === 0 ) {
			itemsError = 'Debe seleccionar al menos un producto, kit o laboratorio';
			isValid    = false;
		}

		if ( !isValid ) return;

		// Check if email notification warning is required
		const notify = !isEditing || hasItemsChanged( );

		if ( notify ) {
			showWarningConfirm = true;
		} else {
			triggerSave( );
		}
	}

	function handleConfirmWarning( ) : void {
		showWarningConfirm = false;
		triggerSave( );
	}

	function triggerSave( ) : void {
		const payload : QuoteSavePayload = {
			clientData : {
				companyName : formCompanyName.trim( ),
				rut         : formRut.trim( ),
				address     : formAddress.trim( ),
				email       : formEmail.trim( ),
				contactName : formContactName.trim( ),
			},
			items      : {
				products   : formProducts.map( ( p ) => ( { id : p.productId, quantity : p.quantity } ) ),
				kits       : formKits.map( ( k ) => ( { id : k.kitId, quantity : k.quantity } ) ),
				mobileLabs : formLabs.map( ( l ) => ( { id : l.mobileLabId, quantity : l.quantity } ) ),
			},
			adminNotes : formAdminNotes.trim( ) || null,
		};
		onSave( payload );
	}
</script>

<DashboardModal
	show            = { show }
	title           = { isEditing ? 'Editar Cotización' : 'Nueva Cotización' }
	onClose         = { onCancel }
	maxWidth        = "max-w-5xl"
	body            = { modalBody }
/>

{#snippet modalBody()}
	<form onsubmit={ handleSubmit } class="flex flex-col gap-4 select-none w-full max-w-full overflow-x-hidden">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-full overflow-x-hidden">
			<!-- Left column: Client Details and Notes -->
			<div class="space-y-4">
				<fieldset class="border border-brand/10 p-4 rounded-2xl bg-surface/10 space-y-4">
					<legend class="px-2 font-display text-[10px] font-black uppercase text-brand tracking-widest">
						Datos del Cliente
					</legend>

					<div class="space-y-1">
						<label for="company-name" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							Empresa / Cliente *
						</label>
						<InputText
							id          = "company-name"
							bind:value  = { formCompanyName }
							error       = { companyNameError }
							placeholder = "Empresa Globalcet S.A."
						/>
					</div>

					<div class="space-y-1">
						<label for="rut-input" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							RUT *
						</label>
						<InputText
							id          = "rut-input"
							bind:value  = { formRut }
							error       = { rutError }
							placeholder = "77.777.777-7"
						/>
					</div>

					<div class="space-y-1">
						<label for="email-input" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							Email de contacto *
						</label>
						<InputText
							id          = "email-input"
							bind:value  = { formEmail }
							error       = { emailError }
							placeholder = "contacto@globalcet.cl"
						/>
					</div>

					<div class="space-y-1">
						<label for="contact-name" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							Nombre de contacto *
						</label>
						<InputText
							id          = "contact-name"
							bind:value  = { formContactName }
							error       = { contactNameError }
							placeholder = "Juan Pérez"
						/>
					</div>

					<div class="space-y-1">
						<label for="address-input" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							Dirección de despacho *
						</label>
						<InputText
							id          = "address-input"
							bind:value  = { formAddress }
							error       = { addressError }
							placeholder = "Av. Providencia 1234, Oficina 501"
						/>
					</div>
				</fieldset>

				<fieldset class="border border-brand/10 p-4 rounded-2xl bg-surface/10 space-y-4">
					<legend class="px-2 font-display text-[10px] font-black uppercase text-brand tracking-widest">
						Notas Administrativas
					</legend>
					<div class="space-y-1">
						<span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							Notas internas
						</span>
						<RichTextEditor
							bind:html={ formAdminNotes }
							placeholder="Notas internas para control administrativo de la cotización..."
						/>
					</div>
				</fieldset>
			</div>

			<!-- Right column: Select Managers -->
			<div class="space-y-4">
				<fieldset class="border border-brand/10 p-4 rounded-2xl bg-surface/10 space-y-4 flex flex-col h-full">
					<legend class="px-2 font-display text-[10px] font-black uppercase text-brand tracking-widest">
						Ítems Asociados *
					</legend>

					{#if ( itemsError )}
						<div class="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[10px] font-bold text-red-400 uppercase tracking-wider text-center shrink-0">
							{ itemsError }
						</div>
					{/if}

					<div class="space-y-4 max-h-full overflow-y-auto pr-1 flex-1">
						<!-- PRODUCTS RELATION -->
						<ProductSelectManager
							bind:items           = { formProducts }
							isEditing            = { isEditing }
							initialDataRelations = { initialProductsRelation }
							onRemove             = { removeProduct }
						/>

						<!-- KITS RELATION -->
						<KitSelectManager
							bind:items           = { formKits }
							isEditing            = { isEditing }
							initialDataRelations = { initialKitsRelation }
							onRemove             = { removeKit }
						/>

						<!-- LABS RELATION -->
						<LabSelectManager
							bind:items           = { formLabs }
							isEditing            = { isEditing }
							initialDataRelations = { initialLabsRelation }
							onRemove             = { removeLab }
						/>
					</div>
				</fieldset>
			</div>
		</div>

		<!-- Footer Actions -->
		<div class="flex items-center justify-end gap-3 border-t border-brand/10 pt-4 shrink-0">
			<button
				type="button"
				onclick={ onCancel }
				class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-2.5 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-colors cursor-pointer"
			>
				Cancelar
			</button>
			<button
				type="submit"
				class="rounded-xl bg-brand border border-brand text-surface-dark px-5 py-2.5 font-bold uppercase tracking-wider hover:bg-brand-dark hover:border-brand-dark transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,230,118,0.2)]"
			>
				Guardar
			</button>
		</div>
	</form>
{/snippet}

<!-- Warning Confirmation Modal -->
<ConfirmationModal
	show        = { showWarningConfirm }
	title       = "Notificación al Cliente"
	message     = { isEditing ? 'Ha modificado los productos/kits de la cotización. Esto enviará una actualización por correo al cliente. ¿Desea confirmar?' : 'Al crear esta cotización, se enviará una notificación por correo al cliente con el detalle. ¿Desea confirmar?' }
	confirmText = "Confirmar y Enviar"
	cancelText  = "Cancelar"
	onConfirm   = { handleConfirmWarning }
	onCancel    = { ( ) => showWarningConfirm = false }
/>
