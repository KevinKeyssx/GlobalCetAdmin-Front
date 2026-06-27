<script lang="ts">
	import { Pencil, Calendar, ClipboardList } from '@lucide/svelte';

    import QuoteStatusBadge             from './QuoteStatusBadge.svelte';
	import QuoteStatusSelector          from './QuoteStatusSelector.svelte';
	import type { Quote, QuoteStatus }  from '$lib/types/quotes';

	interface Props {
		quotes         : Quote[];
		onEdit         : ( quote : Quote ) => void;
		onStatusChange : ( quote : Quote, newStatus : QuoteStatus ) => void;
	}


    let { quotes, onEdit, onStatusChange } : Props = $props();


    function formatDate( dateStr : string ) : string {
		return new Date( dateStr ).toLocaleDateString( 'es-CL', {
			day   : '2-digit',
			month : 'short',
			year  : 'numeric',
		} );
	}


    function countTotalItems( items : any[] ) : number {
		return items.reduce( ( acc, it ) => acc + it.quantity, 0 );
	}
</script>

<div class="overflow-x-auto rounded-2xl border border-brand/10 bg-card/40 backdrop-blur-md">
	<table class="w-full text-left border-collapse text-xs">
		<thead>
			<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
				<th class="px-6 py-4">Nº Cotización</th>
				<th class="px-6 py-4">Cliente / Empresa</th>
				<th class="px-6 py-4">Contacto</th>
				<th class="px-6 py-4">Ítems</th>
				<th class="px-6 py-4">Estado</th>
				<th class="px-6 py-4 text-right">Acciones</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-brand/10 font-semibold text-text-muted">
			{#each quotes as quote ( quote.id )}
				<tr class="hover:bg-brand/5 transition-colors duration-150">
					<!-- Quote Number & Date -->
					<td class="px-6 py-4">
						<div class="font-display font-black text-brand uppercase tracking-wider">
							{ quote.quoteNumber }
						</div>
						<div class="flex items-center gap-1 mt-0.5 text-[10px] text-text-muted font-normal">
							<Calendar class="size-3" />
							<span>{ formatDate( quote.createdAt ) }</span>
						</div>
					</td>

					<!-- Client Company -->
					<td class="px-6 py-4 text-text font-bold">
						{ quote.clientData.companyName }
					</td>

					<!-- Contact Details -->
					<td class="px-6 py-4">
						<div class="font-bold text-text-muted">{ quote.clientData.contactName }</div>
						<div class="text-[10px] text-text-muted font-normal truncate max-w-xs">{ quote.clientData.email }</div>
					</td>

					<!-- Total Items Count -->
					<td class="px-6 py-4">
						<div class="flex items-center gap-1.5 font-bold text-brand uppercase text-[10px] tracking-wide">
							<ClipboardList class="size-3.5" />
							<span>{ countTotalItems( quote.items ) } uds.</span>
						</div>
					</td>

					<!-- Status Badge -->
					<td class="px-6 py-4">
						<QuoteStatusBadge status={ quote.status } />
					</td>

					<!-- Actions -->
					<td class="px-6 py-4 text-right">
						<div class="flex items-center justify-end gap-2 relative">
							<!-- Edit Button -->
							<button
								type="button"
								onclick={ ( ) => onEdit( quote ) }
								class="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand hover:bg-brand hover:text-surface-dark transition-all duration-200 cursor-pointer"
								title="Editar Cotización"
							>
								<Pencil size={ 13 } />
							</button>

							<!-- Status Dropdown Trigger -->
							<QuoteStatusSelector
								status         = { quote.status }
								onStatusChange = { ( newStatus ) => onStatusChange( quote, newStatus ) }
								placement      = "top"
							/>
						</div>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="6" class="px-6 py-10 text-center text-text-muted italic">
						No se encontraron cotizaciones.
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
