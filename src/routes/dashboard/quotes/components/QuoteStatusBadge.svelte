<script lang="ts">
	import { QUOTE_STATUS_MAP, type QuoteStatus } from '$lib/types/quotes';

	interface Props {
		status : QuoteStatus;
	}

	let { status } : Props = $props();

	const label = $derived( QUOTE_STATUS_MAP[ status ] || status );

	const classes = $derived.by( ( ) => {
		switch ( status ) {
			case 'PENDING':
				return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
			case 'IN_REVIEW':
				return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
			case 'ACCEPTED':
				return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
			case 'REJECTED':
				return 'bg-red-500/10 border-red-500/20 text-red-400';
			case 'SENT_TO_CLIENT':
				return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
			case 'COMPLETED':
				return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
			case 'CANCELLED':
				return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
			default:
				return 'bg-brand/10 border-brand/20 text-brand';
		}
	} );
</script>

<span
	class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all duration-300 { classes }"
>
	{ label }
</span>
