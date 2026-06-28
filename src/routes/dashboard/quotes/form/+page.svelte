<script lang="ts">
	import { untrack }  from 'svelte';
	import { page }     from '$app/state';
	import { resolve }  from '$app/paths';
	import { goto }     from '$app/navigation';

	import {
		createMutation,
		createQuery,
		useQueryClient
	}               from '@tanstack/svelte-query';
	import toast    from 'svelte-french-toast';

	import {
		formatRut,
		validateRut,
		validateEmail
	}                                       from '$lib/utils/string';
	import type {
		Quote,
		QuoteSavePayload
	}                                       from '$lib/types/quotes';
	import ConfirmationModal                from '$lib/components/shared/ConfirmationModal.svelte';
	import ProductSelectManager             from '$lib/components/shared/ProductSelectManager.svelte';
	import KitSelectManager                 from '$lib/components/shared/KitSelectManager.svelte';
	import LabSelectManager                 from '$lib/components/shared/LabSelectManager.svelte';
	import InputText                        from '$lib/components/shared/Inputs/InputText.svelte';
	import RichTextEditor                   from '$lib/components/editor/RichTextEditor.svelte';
	import HeaderPage                       from '$lib/components/shared/HeaderPage.svelte';
	import PageContainer                    from '$lib/components/shared/PageContainer.svelte';
	import { globalLoadingStore }           from '$lib/state/loading';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';
	import { METHOD }                       from '$lib/services/http-codes';
	import { isFormDirty, getErrorMessage } from '$lib/utils/form';


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

	// ─── Reactively get ID and Mode from URL ──────────────────────────────────────
	const quoteId   = $derived( page.url.searchParams.get( 'id' ) || '' );
	const isEditing = $derived( !!quoteId );

	// ─── Form Fields ──────────────────────────────────────────────────────────────
	let formCompanyName = $state( '' );
	let formRut         = $state( '' );
	let formEmail       = $state( '' );
	let formContactName = $state( '' );
	let formAddress     = $state( '' );
	let formAdminNotes  = $state( '' );

	// Relations lists
	let formProducts = $state< ProductRelation[] >( [] );
	let formKits     = $state< KitRelation[] >( [] );
	let formLabs     = $state< LabRelation[] >( [] );

	// Error states
	let companyNameError = $state( '' );
	let rutError         = $state( '' );
	let emailError       = $state( '' );
	let contactNameError = $state( '' );
	let addressError     = $state( '' );
	let itemsError       = $state( '' );

	let showWarningConfirm = $state( false );
	let showCancelConfirm  = $state( false );

	// ─── TanStack Query Client & Queries ──────────────────────────────────────────
	const queryClient = useQueryClient();

	const quoteQuery = createQuery(() => ({
		queryKey : [ 'edit-quote', quoteId ],
		queryFn  : async () : Promise< Quote > => {
			const response = await connectRequest< Quote >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.QUOTES.GET_ONE }?id=${ quoteId }`,
				isInternal : true,
			});

			if ( isApiError( response )) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled  : isEditing,
	}));

	const initialData = $derived( quoteQuery.data || null );

	const initialProductsRelation = $derived(
		initialData?.items
			.filter( ( item ) => item.type === 'product' )
			.map( ( item ) => ( { productId : item.id } ) ) || []
	);

	const initialKitsRelation = $derived(
		initialData?.items
			.filter( ( item ) => item.type === 'kit' )
			.map( ( item ) => ( { kitId : item.id } ) ) || []
	);

	const initialLabsRelation = $derived(
		initialData?.items
			.filter( ( item ) => item.type === 'mobileLab' )
			.map( ( item ) => ( { mobileLabId : item.id } ) ) || []
	);

	// ─── Mapped Initial Data for isFormDirty ──────────────────────────────────────
	const initialDataMapped = $derived.by( () => {
		if ( !initialData ) return null;

		return {
			name         : '',
			sku          : '',
			description  : '',
			active       : true,
			companyName  : initialData.clientData.companyName,
			rut          : initialData.clientData.rut,
			email        : initialData.clientData.email,
			contactName  : initialData.clientData.contactName,
			address      : initialData.clientData.address || '',
			adminNotes   : initialData.adminNotes || '',
			products     : initialData.items
				.filter( ( item ) => item.type === 'product' )
				.map( ( item ) => ( { productId : item.id, quantity : item.quantity } ) ),
			kits         : [
				...initialData.items
					.filter( ( item ) => item.type === 'kit' )
					.map( ( item ) => ( { kitId : item.id, quantity : item.quantity } ) ),
				...initialData.items
					.filter( ( item ) => item.type === 'mobileLab' )
					.map( ( item ) => ( { kitId : item.id, quantity : item.quantity } ) ),
			],
		};
	} );

	// ─── Sync data on open/load ───────────────────────────────────────────────────
	let loadedId = $state( '' );

	$effect( () => {
		if ( isEditing && initialData && loadedId !== quoteId ) {
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

			loadedId = quoteId;
		} else if ( !isEditing && loadedId !== '' ) {
			formCompanyName = '';
			formRut         = '';
			formEmail       = '';
			formContactName = '';
			formAddress     = '';
			formAdminNotes  = '';
			formProducts    = [];
			formKits        = [];
			formLabs        = [];

			companyNameError = '';
			rutError         = '';
			emailError       = '';
			contactNameError = '';
			addressError     = '';
			itemsError       = '';

			loadedId = '';
		}
	} );

	// ─── Reactive RUT Formatting and Real-time Validation ─────────────────────────
	$effect( () => {
		const raw = formRut;
		untrack( () => {
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

	// ─── Relation managers removal handlers ───────────────────────────────────────
	function removeProduct( id : string ) : void {
		formProducts = formProducts.filter( ( p ) => p.productId !== id );
	}

	function removeKit( id : string ) : void {
		formKits = formKits.filter( ( k ) => k.kitId !== id );
	}

	function removeLab( id : string ) : void {
		formLabs = formLabs.filter( ( l ) => l.mobileLabId !== id );
	}

	// ─── Compare items lists to detect changes in items/quantities ────────────────
	function hasItemsChanged() : boolean {
		if ( !isEditing || !initialData ) {
			return false;
		}

		const initialProducts = ( initialData.items || [] )
			.filter( ( item ) => item.type === 'product' )
			.map( ( item ) => `${ item.id }:${ item.quantity }` )
			.sort();

		const currentProducts = formProducts
			.map( ( p ) => `${ p.productId }:${ p.quantity }` )
			.sort();

		const initialKits = ( initialData.items || [] )
			.filter( ( item ) => item.type === 'kit' )
			.map( ( item ) => `${ item.id }:${ item.quantity }` )
			.sort();

		const currentKits = formKits
			.map( ( k ) => `${ k.kitId }:${ k.quantity }` )
			.sort();

		const initialLabs = ( initialData.items || [] )
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

	// ─── Shared Utilities Bindings ────────────────────────────────────────────────
	const isDirty = $derived.by( () => {
		return isFormDirty(
			{
				name         : '',
				sku          : '',
				description  : '',
				active       : true,
				currentPrice : null,
				currentStock : null,
				minStock     : null,
				maxStock     : null,
				files        : [],
				companyName  : formCompanyName,
				rut          : formRut,
				email        : formEmail,
				contactName  : formContactName,
				address      : formAddress,
				adminNotes   : formAdminNotes,
				products     : formProducts.map( ( p ) => ( { productId : p.productId, quantity : p.quantity } ) ),
				kits         : [
					...formKits.map( ( k ) => ( { kitId : k.kitId, quantity : k.quantity } ) ),
					...formLabs.map( ( l ) => ( { kitId : l.mobileLabId, quantity : l.quantity } ) ),
				],
			},
			initialDataMapped,
			isEditing
		);
	} );

	function handleCancel() : void {
		if ( isDirty ) {
			showCancelConfirm = true;
		} else {
			goto( resolve( '/dashboard/quotes' ) );
		}
	}

	function confirmCancel() : void {
		showCancelConfirm = false;
		goto( resolve( '/dashboard/quotes' ) );
	}

	function closeCancelConfirm() : void {
		showCancelConfirm = false;
	}

	// ─── TanStack Query Mutations ─────────────────────────────────────────────────
	const saveMutation = createMutation( () => ( {
		mutationFn : async ( { isEditing, id, payload } : { isEditing : boolean; id : string; payload : QuoteSavePayload } ) : Promise< Quote > => {
			const endpoint = isEditing
				? `${ INTERNAL_ENDPOINTS.QUOTES.UPDATE }?id=${ id }`
				: `${ INTERNAL_ENDPOINTS.QUOTES.CREATE }`;

			const response = await connectRequest< Quote >( {
				endpoint,
				method     : isEditing ? METHOD.PATCH : METHOD.POST,
				body       : payload,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				throw new Error( response.message || 'Error al guardar la cotización.' );
			}
			return response;
		},
		onSuccess  : ( data ) => {
			toast.success( isEditing ? 'Cotización actualizada correctamente.' : 'Cotización creada correctamente.' );
			queryClient.invalidateQueries( { queryKey : [ 'admin-quotes' ] } );
			if ( isEditing && quoteId ) {
				queryClient.setQueryData( [ 'edit-quote', quoteId ], data );
				queryClient.invalidateQueries( { queryKey : [ 'edit-quote', quoteId ] } );
			}
			goto( resolve( '/dashboard/quotes' ) );
		},
		onError    : ( error : any ) => {
			console.error( 'Error al guardar cotización:', error );
			toast.error( getErrorMessage( error, 'Error al guardar.' ) );
		},
	} ) );

	$effect( () => {
		$globalLoadingStore = saveMutation.isPending || quoteQuery.isFetching;
		return () => {
			$globalLoadingStore = false;
		};
	} );

	// ─── Submit Handlers ──────────────────────────────────────────────────────────
	function handleSubmit( e : Event ) : void {
		e.preventDefault();

		companyNameError = '';
		rutError         = '';
		emailError       = '';
		contactNameError = '';
		addressError     = '';
		itemsError       = '';

		let isValid = true;

		if ( !formCompanyName.trim() ) {
			companyNameError = 'El nombre de empresa es obligatorio';
			isValid          = false;
		}

		if ( !formRut.trim() ) {
			rutError = 'El RUT es obligatorio';
			isValid  = false;
		} else if ( !validateRut( formRut ) ) {
			rutError = 'El RUT ingresado no es válido';
			isValid  = false;
		}

		if ( !formEmail.trim() ) {
			emailError = 'El email es obligatorio';
			isValid    = false;
		} else if ( !validateEmail( formEmail ) ) {
			emailError = 'El email ingresado no es válido';
			isValid    = false;
		}

		if ( !formContactName.trim() ) {
			contactNameError = 'El nombre de contacto es obligatorio';
			isValid          = false;
		}

		if ( !formAddress.trim() ) {
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
		const notify = !isEditing || hasItemsChanged();

		if ( notify ) {
			showWarningConfirm = true;
		} else {
			triggerSave();
		}
	}

	function handleConfirmWarning() : void {
		showWarningConfirm = false;
		triggerSave();
	}

	function triggerSave() : void {
		const payload : QuoteSavePayload = {
			clientData : {
				companyName : formCompanyName.trim(),
				rut         : formRut.trim(),
				address     : formAddress.trim(),
				email       : formEmail.trim(),
				contactName : formContactName.trim(),
			},
			items      : {
				products   : formProducts.map( ( p ) => ( { id : p.productId, quantity : p.quantity } ) ),
				kits       : formKits.map( ( k ) => ( { id : k.kitId, quantity : k.quantity } ) ),
				mobileLabs : formLabs.map( ( l ) => ( { id : l.mobileLabId, quantity : l.quantity } ) ),
			},
			adminNotes : formAdminNotes.trim() || null,
		};

		saveMutation.mutate( {
			isEditing,
			id : quoteId,
			payload,
		} );
	}

	const breadcrumbItems = $derived( [
		{ label : 'Dashboard',    href : resolve( '/dashboard' ) },
		{ label : 'Cotizaciones', href : resolve( '/dashboard/quotes' ) },
		{ label : isEditing ? 'Modificar Cotización' : 'Crear Cotización' }
	] );
</script>

<svelte:head>
	<title>{ isEditing ? 'Modificar Cotización' : 'Crear Nueva Cotización' } - GlobalCET</title>
</svelte:head>

<PageContainer>
    <!-- Navigation & Header -->
    <HeaderPage
        title            = { isEditing ? 'Modificar Cotización' : 'Crear Nueva Cotización' }
        description      = { isEditing ? 'Actualice los datos del cliente, notas administrativas e ítems asociados de la cotización seleccionada.' : 'Complete el siguiente formulario para registrar una nueva cotización en el sistema de GlobalCET.' }
        breadcrumb       = { breadcrumbItems }
        showCancelButton = { true }
        oncancel         = { handleCancel }
        formId           = "quote-form"
        isPending        = { saveMutation.isPending }
    />

    {#if ( isEditing && quoteQuery.isPending )}
        <div class="flex min-h-[400px] items-center justify-center rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card p-12">
            <div class="flex flex-col items-center gap-4">
                <div class="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>

                <p class="font-display text-xs font-black uppercase tracking-widest text-brand animate-pulse">
                    Cargando datos de la cotización...
                </p>
            </div>
        </div>
    {:else if ( isEditing && quoteQuery.isError )}
        <div class="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/15 bg-card/60 backdrop-blur-md shadow-card p-12 text-center text-text-muted">
            <p class="text-red-400 font-bold uppercase tracking-wider">Error al cargar la cotización</p>

            <p class="text-xs">{ quoteQuery.error?.message || 'Ocurrió un error inesperado al consultar los datos.' }</p>

            <a
                href={ resolve( '/dashboard/quotes' ) }
                class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-2.5 font-bold uppercase tracking-wider text-brand hover:bg-brand/10 transition-colors cursor-pointer"
            >
                Volver a la lista
            </a>
        </div>
    {:else}
        <form
            id="quote-form"
            onsubmit={ handleSubmit }
            class="flex flex-col gap-5 text-[0.8125rem] font-semibold text-text-muted -mt-3 md:mt-0"
        >
            <!-- ── Two-panel grid ── -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <!-- ── LEFT PANEL: Client Details and Notes ── -->
                <div class="flex flex-col gap-3">
                    <fieldset class="border border-brand/10 p-4 rounded-2xl bg-surface/10">
                        <legend class="px-2 font-display text-[10px] font-black uppercase text-brand tracking-widest">
                            Datos del Cliente
                        </legend>

                        <div class="space-y-1 mb-4">
                            <label for="company-name" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                                Empresa / Cliente *
                            </label>
                            <InputText
                                id          = "company-name"
                                bind:value  = { formCompanyName }
                                bind:error  = { companyNameError }
                                placeholder = "Empresa Globalcet S.A."
                            />
                        </div>

                        <div class="space-y-1 mb-4">
                            <label for="rut-input" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                                RUT *
                            </label>
                            <InputText
                                id          = "rut-input"
                                bind:value  = { formRut }
                                bind:error  = { rutError }
                                placeholder = "77.777.777-7"
                            />
                        </div>

                        <div class="space-y-1 mb-4">
                            <label for="email-input" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                                Email de contacto *
                            </label>
                            <InputText
                                id          = "email-input"
                                bind:value  = { formEmail }
                                bind:error  = { emailError }
                                placeholder = "contacto@globalcet.cl"
                            />
                        </div>

                        <div class="space-y-1 mb-4">
                            <label for="contact-name" class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                                Nombre de contacto *
                            </label>
                            <InputText
                                id          = "contact-name"
                                bind:value  = { formContactName }
                                bind:error  = { contactNameError }
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
                                bind:error  = { addressError }
                                placeholder = "Av. Providencia 1234, Oficina 501"
                            />
                        </div>
                    </fieldset>

                    <fieldset class="border border-brand/10 p-4 rounded-2xl bg-surface/10">
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

                <!-- ── RIGHT PANEL: Select Managers ── -->
                <div class="flex flex-col gap-3">
                    <fieldset class="border border-brand/10 p-4 rounded-2xl bg-surface/10 flex flex-col h-full">
                        <legend class="px-2 font-display text-[10px] font-black uppercase text-brand tracking-widest">
                            Ítems Asociados *
                        </legend>

                        {#if ( itemsError )}
                            <div class="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[10px] font-bold text-red-400 uppercase tracking-wider text-center shrink-0 mb-4">
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
        </form>
    {/if}
</PageContainer>

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

<!-- Warning Confirmation Modal -->
<ConfirmationModal
	show        = { showWarningConfirm }
	title       = "Notificación al Cliente"
	message     = { isEditing ? 'Ha modificado los productos/kits de la cotización. Esto enviará una actualización por correo al cliente. ¿Desea confirmar?' : 'Al crear esta cotización, se enviará una notificación por correo al cliente con el detalle. ¿Desea confirmar?' }
	confirmText = "Confirmar y Enviar"
	cancelText  = "Cancelar"
	onConfirm   = { handleConfirmWarning }
	onCancel    = { () => showWarningConfirm = false }
/>
