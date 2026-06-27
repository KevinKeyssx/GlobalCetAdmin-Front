<script lang="ts">
	import { fade, fly } from 'svelte/transition';

    import { Chart }        from 'chart.js/auto';
	import { createQuery }  from '@tanstack/svelte-query';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';


    interface Props {
		show     : boolean;
		itemId   : string;
		itemType : 'product' | 'kit' | 'lab';
		onClose  : ( ) => void;
	}


    let {
		show = $bindable(),
		itemId,
		itemType,
		onClose
	} : Props = $props();


	const priceHistoryQuery = createQuery( ( ) => ( {
		queryKey : [ 'price-history', itemId, itemType ],
		queryFn  : async ( ) : Promise< Array<{ id : string; price : number; validFrom : string }> > => {
			const params = new URLSearchParams( {
				id   : itemId,
				type : itemType,
			});

			const response = await connectRequest<Array<{ id : string; price : number; validFrom : string }>>({
				endpoint   : `${ INTERNAL_ENDPOINTS.PRICE_HISTORY.GET_PRICES }?${ params.toString() }`,
				isInternal : true,
			});

			if ( isApiError( response )) {
				throw new Error( response.message );
			}

			return response;
		},
		enabled  : !!( show && itemId && itemType ),
	}));


	const history       = $derived( priceHistoryQuery.data || [] );
	const isLoading     = $derived( priceHistoryQuery.isPending );
	const error         = $derived( priceHistoryQuery.error ? ( priceHistoryQuery.error as any ).message : '' );
	const sortedHistory = $derived( [ ...history ].reverse() );

	let isMobile      = $state( true );
	let canvasElement : HTMLCanvasElement | null = $state( null );
	let chartInstance : Chart | null = null;


	$effect( ( ) => {
		if ( typeof window !== 'undefined' ) {
			const mediaQuery = window.matchMedia( '(max-width: 767px)' );
			isMobile = mediaQuery.matches;

			const listener = ( e : MediaQueryListEvent ) => {
				isMobile = e.matches;
			};
			mediaQuery.addEventListener( 'change', listener );
			return ( ) => mediaQuery.removeEventListener( 'change', listener );
		}
	} );

	$effect( ( ) => {
		if ( canvasElement && history && history.length > 1 ) {
			if ( chartInstance ) {
				chartInstance.destroy();
				chartInstance = null;
			}

			const brandColor = typeof window !== 'undefined'
				? getComputedStyle( document.documentElement ).getPropertyValue( '--color-brand-bright' ).trim() || '#10b981'
				: '#10b981';

			const labels = history.map( ( entry ) => formatLabelDate( entry.validFrom ) );
			const data = history.map( ( entry ) => entry.price );

			chartInstance = new Chart( canvasElement, {
				type : 'line',
				data : {
					labels,
					datasets : [
						{
							label            : 'Precio',
							data,
							stepped          : true,
							fill             : false,
							borderColor      : brandColor,
							backgroundColor  : brandColor,
							pointBorderColor : '#ffffff',
							pointBorderWidth : 2,
							pointRadius      : 5,
							pointHoverRadius : 7,
							tension          : 0,
						}
					]
				},
				options : {
					responsive          : true,
					maintainAspectRatio : false,
					plugins : {
						legend : {
							display : false,
						},
						tooltip : {
							callbacks : {
								label : ( context ) => {
									const value = context.parsed.y ?? 0;
									return ` Precio: ${ formatCurrency( value ) }`;
								}
							}
						}
					},
					scales : {
						y : {
							ticks : {
								callback : ( value ) => formatCurrency( Number( value ) ),
							},
							grid : {
								color : 'rgba(148, 163, 184, 0.1)',
							}
						},
						x : {
							grid : {
								display : false,
							}
						}
					}
				}
			} );
		}

		return ( ) => {
			if ( chartInstance ) {
				chartInstance.destroy();
				chartInstance = null;
			}
		};
	} );

	function formatLabelDate( dateStr : string ) : string {
		const d = new Date( dateStr );
		const day = d.getDate();
		const monthNames = [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic' ];
		const month = monthNames[ d.getMonth() ];
		const year = d.getFullYear();
		return `${ day } ${ month } ${ year }`;
	}

	function formatCurrency( amount : number ) : string {
		return new Intl.NumberFormat( 'es-CL', {
			style                 : 'currency',
			currency              : 'CLP',
			minimumFractionDigits : 0,
		} ).format( amount );
	}

	function formatDateTime( dateStr : string ) : { date : string; time : string } {
		const d = new Date( dateStr );
		const day = d.getDate().toString().padStart( 2, '0' );
		const month = ( d.getMonth() + 1 ).toString().padStart( 2, '0' );
		const year = d.getFullYear();
		const hours = d.getHours().toString().padStart( 2, '0' );
		const minutes = d.getMinutes().toString().padStart( 2, '0' );
		const seconds = d.getSeconds().toString().padStart( 2, '0' );
		return {
			date : `${ day }/${ month }/${ year }`,
			time : `${ hours }:${ minutes }:${ seconds }`
		};
	}
</script>

{#if ( show )}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class   = "fixed inset-0 z-100 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
		onclick = { onClose }
		role    = "presentation"
		transition:fade = { { duration : 200 } }
	></div>

	<div
		class      = "fixed z-100 bg-card/70 backdrop-blur-xl border-brand/10 shadow-2xl flex flex-col overflow-hidden transition-all duration-300
			top-0 right-0 bottom-0 w-full max-w-lg border-l
			md:top-auto md:left-0 md:right-0 md:bottom-0 md:h-[65vh] lg:h-[40vh] md:w-full md:max-w-none md:rounded-t-3xl md:border-t md:border-l-0"
		transition:fly = { isMobile ? { x : 400, duration : 300 } : { y : 400, duration : 300 } }
	>
		<div class="border-b border-brand/10 p-6 shrink-0">
			<div class="flex items-center justify-between w-full max-w-7xl mx-auto">
				<div class="flex flex-col gap-1">
					<h3 class="font-display text-lg font-black text-brand uppercase tracking-wider">
						Historial de Precios
					</h3>
					<span class="text-xs text-text-muted">
						{ itemType === 'product' ? 'Producto' : itemType === 'kit' ? 'Kit' : 'Laboratorio Móvil' }
					</span>
				</div>

				<button
					onclick    = { onClose }
					class      = "h-8 w-8 flex items-center justify-center rounded-lg border border-brand/15 bg-input text-text-muted hover:text-brand transition-colors cursor-pointer"
					aria-label = "Cerrar panel"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto custom-scrollbar p-6">
			<div class="w-full max-w-7xl mx-auto">
				{#if ( isLoading )}
					<div class="flex flex-col items-center justify-center py-20 space-y-3">
						<div class="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
						<span class="text-xs text-text-muted">Cargando historial de precios...</span>
					</div>
				{:else if ( error )}
					<div class="rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center text-xs text-red-400">
						{ error }
					</div>
				{:else if ( history.length <= 1 )}
					<div class="flex flex-col items-center justify-center py-16 text-center space-y-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="space-y-1">
							<p class="text-sm font-bold text-text">No se registran variaciones de precio anteriores para este ítem.</p>
							{#if ( history.length === 1 )}
								<p class="text-xs text-text-muted">Precio actual: <strong class="text-brand-bright">{ formatCurrency( history[ 0 ].price ) }</strong> desde el { formatDateTime( history[ 0 ].validFrom ).date }</p>
							{/if}
						</div>
					</div>
				{:else}
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
						<!-- Chart Container -->
						<div class="bg-card border border-brand/10 p-5 rounded-2xl shadow-card h-fit">
							<span class="block text-[10px] font-black uppercase tracking-wider text-brand/70 mb-4">
								Evolución Temporal del Precio
							</span>
							<div class="h-72 w-full relative">
								<canvas bind:this={ canvasElement }></canvas>
							</div>
						</div>

						<!-- Detailed Breakdown Table -->
						<div class="space-y-3">
							<!-- <span class="block text-[10px] font-black uppercase tracking-wider text-brand/70">
								Desglose de Cambios
							</span> -->

							<div class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60">
								<div class="max-h-[360px] overflow-y-auto custom-scrollbar">
									<table class="w-full text-left border-collapse">
										<thead class="sticky top-0 z-10 bg-card border-b border-brand/15">
											<tr class="text-[10px] font-black uppercase tracking-widest text-text-muted">
												<th class="px-4 py-3">Precio</th>
												<th class="px-4 py-3">Fecha de Vigencia</th>
												<th class="px-4 py-3 text-right">Hora Exacta</th>
											</tr>
										</thead>
										<tbody class="divide-y divide-brand/10 font-semibold text-xs text-text">
											{#each sortedHistory as entry, idx ( entry.id )}
												{@const dt = formatDateTime( entry.validFrom )}
												<tr class="hover:bg-brand/5 transition-colors duration-150">
													<td class="px-4 py-3 font-mono font-bold text-brand-bright">
														{ formatCurrency( entry.price ) }
													</td>
													<td class="px-4 py-3 text-text-muted">
														{ dt.date }
													</td>
													<td class="px-4 py-3 text-right text-text-muted font-mono">
														{ dt.time }
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width : 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background : transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background    : color-mix( in srgb, var( --color-brand ) 20%, transparent );
		border-radius : 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background : var( --color-brand );
	}
</style>
