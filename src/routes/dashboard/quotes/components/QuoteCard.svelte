<script lang="ts">
	import {
        Pencil,
        Calendar,
        Users,
        Mail,
        FileText,
        ClipboardList
    } from '@lucide/svelte';

	import {
        type Quote,
        type QuoteStatus
    }                           from '$lib/types/quotes';
    import QuoteStatusBadge     from './QuoteStatusBadge.svelte';
    import QuoteStatusSelector  from './QuoteStatusSelector.svelte';


	interface Props {
		quote          : Quote;
		onEdit         : ( quote : Quote ) => void;
		onStatusChange : ( quote : Quote, newStatus : QuoteStatus ) => void;
	}


	let { quote, onEdit, onStatusChange } : Props = $props();


    const formattedDate = $derived(
		new Date( quote.createdAt ).toLocaleDateString( 'es-CL', {
			day    : '2-digit',
			month  : 'short',
			year   : 'numeric',
			hour   : '2-digit',
			minute : '2-digit',
		} )
	);


    const totalItems = $derived(
		quote.items.reduce( ( acc, item ) => acc + item.quantity, 0 )
	);
</script>

<div
	class="group relative flex flex-col justify-between rounded-2xl border border-brand/10 bg-card/60 p-5 shadow-card hover:shadow-card-hover hover:border-brand/35 backdrop-blur-md transition-all duration-300 space-y-4"
>
	<!-- Header -->
	<div class="flex items-start justify-between gap-2 border-b border-brand/5 pb-3">
		<div class="space-y-0.5">
			<span class="font-display text-xs font-black uppercase tracking-widest text-brand">
				{ quote.quoteNumber }
			</span>

            <div class="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold">
				<Calendar class="size-3" />
				<span>{ formattedDate }</span>
			</div>
		</div>

        <QuoteStatusBadge status={ quote.status } />
	</div>

	<!-- Body: Client Info -->
	<div class="flex-1 space-y-2 text-xs">
		<h4 class="font-display font-extrabold text-sm text-text group-hover:text-brand transition-colors line-clamp-1">
			{ quote.clientData.companyName }
		</h4>

		<div class="space-y-1.5 font-semibold text-text-muted">
			<div class="flex items-center gap-2">
				<Users class="size-3.5 shrink-0 text-brand/60" />
				<span class="truncate">{ quote.clientData.contactName } | { quote.clientData.rut }</span>
			</div>

            <div class="flex items-center gap-2">
				<Mail class="size-3.5 shrink-0 text-brand/60" />
				<span class="truncate">{ quote.clientData.email }</span>
			</div>

            {#if ( quote.clientData.address )}
				<div class="flex items-center gap-2">
					<FileText class="size-3.5 shrink-0 text-brand/60" />
					<span class="truncate">{ quote.clientData.address }</span>
				</div>
			{/if}
		</div>

		<!-- Items Count Summary -->
		<div class="flex items-center gap-2 pt-2 text-[11px] font-bold text-brand uppercase tracking-wider">
			<ClipboardList class="size-4" />
			<span>{ totalItems } { totalItems === 1 ? 'Ítem cotizado' : 'Ítems cotizados' }</span>
		</div>

		<!-- Admin Notes if exist -->
		{#if ( quote.adminNotes )}
			<div class="mt-2 rounded-xl bg-surface/40 border border-brand/5 p-2.5 text-[11px] text-text-muted italic line-clamp-2">
				"{ quote.adminNotes }"
			</div>
		{/if}
	</div>

	<!-- Footer Actions -->
	<div class="flex items-center gap-2 border-t border-brand/5 pt-3 justify-between relative">
		<!-- Edit Button -->
		<button
			type="button"
			onclick={ ( ) => onEdit( quote ) }
			class="flex items-center gap-1.5 rounded-xl border border-brand/15 bg-brand/5 px-3 py-2 text-xs font-bold text-brand hover:bg-brand hover:text-surface-dark transition-all duration-300 cursor-pointer"
		>
			<Pencil class="size-3" />
			<span>Editar</span>
		</button>

		<!-- Status Changer dropdown -->
		<QuoteStatusSelector
			status         = { quote.status }
			onStatusChange = { ( newStatus ) => onStatusChange( quote, newStatus ) }
			placement      = "top"
		/>
	</div>
</div>
