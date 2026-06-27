<script lang="ts">
	import SoftSelect from '$lib/components/shared/Inputs/SoftSelect.svelte';
	import {
		QUOTE_STATUS_MAP,
		type QuoteStatus,
	} from '$lib/types/quotes';

	interface Props {
		status         : QuoteStatus;
		onStatusChange : ( newStatus : QuoteStatus ) => void;
		placement?     : 'top' | 'bottom';
	}

	let {
		status,
		onStatusChange,
		placement      = 'bottom',
	} : Props = $props();

	// Map QUOTE_STATUS_MAP keys to options for SoftSelect
	const options = Object.keys( QUOTE_STATUS_MAP ).map( ( key ) => ( {
		id   : key,
		name : QUOTE_STATUS_MAP[ key as QuoteStatus ],
	} ) );

	const isCancelled = $derived( status === 'CANCELLED' );

	let localValue = $state<QuoteStatus>( 'PENDING' );

	// Keep local state in sync when parent status changes (e.g. after successful mutation)
	$effect( ( ) => {
		localValue = status;
	} );

	// When user selects a new status via SoftSelect, trigger the callback
	$effect( ( ) => {
		if ( localValue !== status ) {
			onStatusChange( localValue as QuoteStatus );
			// Immediately revert localValue to status.
			// This ensures the local value remains in sync with the parent's actual state
			// if the user clicks "Cancel" in the confirmation modal.
			localValue = status;
		}
	} );
</script>

<div class="relative status-dropdown-container">
	<SoftSelect
		{ options }
		bind:value={ localValue }
		placeholder="Estado"
		label="Estado"
		disabled={ isCancelled }
		{ placement }
	/>
</div>
