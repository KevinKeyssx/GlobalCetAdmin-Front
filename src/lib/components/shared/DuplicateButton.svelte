<script lang="ts">
	import { Copy }             from '@lucide/svelte';
	import { useQueryClient }   from '@tanstack/svelte-query';
	import toast                from 'svelte-french-toast';

	import ConfirmationModal                from './ConfirmationModal.svelte';
	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { METHOD }                       from '$lib/services/http-codes';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';


	interface Props {
		item            : any;
		itemType        : 'product' | 'kit' | 'lab';
		class?          : string;
		title?          : string;
		confirmTitle?   : string;
		confirmMessage? : string;
		onSuccess?      : ( ) => void | Promise< void >;
	}


	let {
		item,
		itemType,
		class: customClass  = "flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-all duration-200 hover:bg-brand hover:text-surface-dark disabled:opacity-50 disabled:cursor-not-allowed",
		title               = "Duplicar",
		confirmTitle        = "¿Duplicar elemento?",
		confirmMessage      = "¿Está seguro de que desea duplicar este registro? Se creará una copia idéntica en el sistema.",
		onSuccess
	} : Props = $props();


	const queryClient = useQueryClient();

	let isPending    = $state( false );
	let showConfirm  = $state( false );
	let pendingEvent = $state< MouseEvent | null >( null );


	function handleButtonClick( e : MouseEvent ) : void {
		e.preventDefault();
		e.stopPropagation();
		pendingEvent = e;
		showConfirm  = true;
	}

	async function handleConfirm() : Promise< void > {
		showConfirm = false;
		isPending   = true;

		let apiType  = '';
		let label    = '';
		let queryKey = '';

		if ( itemType === 'lab' ) {
			apiType  = 'mobile-lab';
			label    = 'Laboratorio móvil';
			queryKey = 'admin-labs';
		} else if ( itemType === 'kit' ) {
			apiType  = 'kit';
			label    = 'Kit';
			queryKey = 'admin-kits';
		} else if ( itemType === 'product' ) {
			apiType  = 'product';
			label    = 'Producto';
			queryKey = 'admin-products';
		}

		try {
			const response = await connectRequest< any >( {
				endpoint   : `${ INTERNAL_ENDPOINTS.DUPLICATE.BASE }?type=${ apiType }&id=${ item.id }`,
				method     : METHOD.POST,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al duplicar: ${ response.message }` );
				return;
			}

			toast.success( `${ label } duplicado con éxito.` );
			queryClient.invalidateQueries( { queryKey : [ queryKey ] } );

			if ( onSuccess ) {
				await onSuccess();
			}
		} catch ( err ) {
			toast.error( 'Error de red al intentar duplicar.' );
		} finally {
			isPending = false;
			pendingEvent = null;
		}
	}

	function handleCancel() : void {
		showConfirm  = false;
		pendingEvent = null;
	}
</script>

<button
	type     = "button"
	onclick  = { handleButtonClick }
	disabled = { isPending }
	class    = { customClass }
	title    = { title }
>
	{#if ( isPending )}
		<div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
	{:else}
		<Copy size={ 14 } />
	{/if}
</button>

<ConfirmationModal
	show      = { showConfirm }
	title     = { confirmTitle }
	message   = { confirmMessage }
	onConfirm = { handleConfirm }
	onCancel  = { handleCancel }
/>
