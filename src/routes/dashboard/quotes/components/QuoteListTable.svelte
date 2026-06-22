<script lang="ts">
	import { Pencil, ChevronDown, Calendar, ClipboardList } from '@lucide/svelte';
	import QuoteStatusBadge from './QuoteStatusBadge.svelte';
	import { QUOTE_STATUS_MAP, type Quote, type QuoteStatus } from '$lib/types/quotes';

	interface Props {
		quotes         : Quote[];
		onEdit         : ( quote : Quote ) => void;
		onStatusChange : ( quote : Quote, newStatus : QuoteStatus ) => void;
	}

	let { quotes, onEdit, onStatusChange } : Props = $props();

	let activeDropdownId = $state< string | null >( null );

	function toggleDropdown( id : string, event : MouseEvent ) : void {
		event.stopPropagation();
		activeDropdownId = activeDropdownId === id ? null : id;
	}

	function selectStatus( quote : Quote, status : QuoteStatus ) : void {
		activeDropdownId = null;
		if ( status !== quote.status ) {
			onStatusChange( quote, status );
		}
	}

	function handleOutsideClick( event : MouseEvent ) : void {
		const target = event.target as HTMLElement;
		if ( activeDropdownId && !target.closest( '.status-dropdown-container' ) ) {
			activeDropdownId = null;
		}
	}

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

<svelte:window onclick={ handleOutsideClick } />

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
				{@const isDropdownOpen = activeDropdownId === quote.id}
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
							<div class="relative status-dropdown-container">
								<button
									type="button"
									onclick={ ( e ) => toggleDropdown( quote.id, e ) }
									class="flex h-8 px-2.5 items-center gap-1 rounded-lg border border-brand/15 bg-surface/30 text-text-muted hover:bg-brand/10 hover:text-text transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-wider"
									title="Cambiar Estado"
								>
									<span>Estado</span>
									<ChevronDown class="size-3 transition-transform duration-200 { isDropdownOpen ? 'rotate-180 text-brand' : '' }" />
								</button>

								{#if ( isDropdownOpen )}
									<div
										class="absolute right-0 top-full mt-1.5 z-55 min-w-[130px] rounded-xl border border-brand/10 bg-card/95 p-1 shadow-lg backdrop-blur-md flex flex-col gap-0.5"
									>
										{#each Object.keys( QUOTE_STATUS_MAP ) as st}
											{@const isSelected = st === quote.status}
											<button
												type="button"
												onclick={ ( ) => selectStatus( quote, st as QuoteStatus ) }
												class="flex w-full items-center px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all duration-200 cursor-pointer { isSelected ? 'bg-brand/15 text-brand font-bold' : 'text-text-muted hover:bg-brand/5 hover:text-text' }"
											>
												{ QUOTE_STATUS_MAP[ st as QuoteStatus ] }
											</button>
										{/each}
									</div>
								{/if}
							</div>
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
