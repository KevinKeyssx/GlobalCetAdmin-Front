<script lang="ts">
	// ─── Svelte 5 - Commercial Terms Page ────────────────────────────────────────
	// An elegant, responsive, and interactive portal designed to display CET Chile
	// SpA's commercial terms. Divided in easy-to-read interactive tabs.

	import { fade } from 'svelte/transition';

	interface TermSection {
		title       : string;
		description : string;
	}

	interface TermCategory {
		id          : string;
		title       : string;
		icon        : string;
		sections    : TermSection[];
	}

	let activeCategoryTab: string = $state( 'dispatch' );

	const categories: Record< string, TermCategory > = {
		dispatch : {
			id       : 'dispatch',
			title    : 'Oferta & Despacho',
			icon     : 'truck',
			sections : [
				{
					title       : 'Alcance Comercial',
					description : 'Las Condiciones Comerciales y Contractuales establecidas en la presente cotización formarán parte integrante de la Orden de Compra o Contrato entre CET Chile SpA y la empresa Compradora. En caso de existir diferencias en la interpretación de alguna de las disposiciones, prevalecerán las establecidas en esta cotización. Cualquier variación dejará la oferta sin efecto.'
				},
				{
					title       : 'Formalización de la Aceptación',
					description : 'La formalización de la venta se entenderá como tal cuando el cliente envíe su Orden de Compra indicando el número de la cotización a nuestro correo. CET Chile SpA se reserva el derecho de rechazar la Orden de Compra del cliente si esta no contiene el monto total de lo cotizado, si existen diferencias con lo ofrecido, o por variaciones del stock disponible o venta previa, en cuyo caso se enviará una nueva cotización.'
				},
				{
					title       : 'Moneda, Precios y Tipo de Cambio',
					description : 'El valor cotizado se expresa en pesos chilenos ( CLP ) o dólares americanos ( USD ) según se indique expresamente. Los precios son válidos únicamente al adquirir la totalidad de lo ofertado. En el caso de cotizaciones en dólares, se aplicará el tipo de cambio oficial que certifique el Banco Central de Chile para el día de despacho o facturación.'
				},
				{
					title       : 'Plazo y Condiciones de Entrega',
					description : 'El plazo de entrega se contará desde la recepción de la Orden de Compra y el Acuse de Recibo correspondiente emitido por CET Chile SpA. El cumplimiento de plazos queda sujeto a la oportuna entrega de documentación, pagos, abonos, permisos necesarios o licitaciones. Las fechas son estimativas y no constituyen una condición esencial del contrato.'
				},
				{
					title       : 'Multas y Derechos de Almacenaje',
					description : 'La cotización no contempla la aceptación de ningún tipo de multas. Si el despacho se retrasa por requerimiento del comprador excediendo el plazo acordado, este deberá declarar por escrito su autorización para cargar a su cuenta, por cada mes comenzado, derechos de almacenaje de un 0,5% del precio neto del suministro, facturado antes del despacho.'
				}
			]
		},
		warranties : {
			id       : 'warranties',
			title    : 'Instalación & Garantías',
			icon     : 'shield-check',
			sections : [
				{
					title       : 'Instalación y Puesta en Marcha',
					description : 'La instalación y puesta en marcha de los equipos suministrados debe ser realizada de acuerdo con las instrucciones de los estándares de CET Chile SpA, bajo condiciones de trabajo adecuadas y con estricto cumplimiento de prevención de riesgos. De no cumplirse estas pautas, no se garantiza el correcto funcionamiento ni los tiempos de instalación.'
				},
				{
					title       : 'Manuales de Equipos',
					description : 'En la eventualidad de que el cliente no disponga de los manuales de los equipos, deberá solicitarlos formalmente a CET Chile SpA mediante correo electrónico a ventas@globalcet.cl para asegurar una manipulación adecuada y conforme a las pautas del fabricante.'
				},
				{
					title       : 'Condiciones de la Garantía de Equipos',
					description : 'La garantía cubre defectos de fabricación o fallas de materiales. Se excluyen piezas sometidas a desgaste, contaminación por agentes peligrosos, sobrecarga, impericia técnica, uso indebido, o condiciones climáticas o de altura extremas. No cubre costos de montaje/desmontaje, lucro cesante, accidentes, incendios, derrames ni mano de obra correctora menor. La reparación prorroga la garantía solo para la pieza reemplazada.'
				}
			]
		},
		responsibility : {
			id       : 'responsibility',
			title    : 'Especificaciones & Responsabilidad',
			icon     : 'scale',
			sections : [
				{
					title       : 'Especificaciones Técnicas y Embalaje',
					description : 'Todos los requerimientos de operación indicados en la cotización y manuales ( tales como alimentación eléctrica, conexiones a tierra, caudales, presión, gravedad específica, temperatura, etc. ) deben ser rigurosamente cumplidos por la instalación del cliente. El embalaje estándar es el del fabricante; embalajes especiales se cotizarán aparte.'
				},
				{
					title       : 'Exclusiones por Fuerza Mayor o Caso Fortuito',
					description : 'CET Chile SpA queda exenta de responsabilidad ante retrasos o pérdidas causadas por eventos de Fuerza Mayor o Caso Fortuito ajenos a su negligencia, incluyendo huelgas, desastres naturales, incidentes marítimos o aéreos, demoras de aduana, terremotos, cortes eléctricos, incendios o problemas climatológicos.'
				},
				{
					title       : 'Anulación de Pedidos e Idioma',
					description : 'No se aceptarán anulaciones de Órdenes de Compra si los suministros ya fueron despachados o fabricados a pedido. En casos de excepción, el comprador pagará la liquidación completa de fletes, seguros y costos de fabricación. Toda la documentación técnica se entrega en idioma inglés, a menos que el fabricante disponga de versiones en español.'
				},
				{
					title       : 'Límite Máximo de Responsabilidad',
					description : 'CET Chile SpA no asume responsabilidades por lucro cesante, pérdidas de ingresos o daños indirectos de cualquier naturaleza. La responsabilidad máxima acumulada de la compañía frente al comprador y sus clientes, con ocasión de este contrato ( contractual o extracontractual ), no excederá en ningún caso el precio neto neto pagado por el producto específico.'
				}
			]
		}
	};
</script>

<svelte:head>
	<title>Condiciones Comerciales y Contractuales | CET Chile SpA / GlobalCET</title>
	<meta name="description" content="Revise las condiciones comerciales, políticas de despacho, plazos de entrega, instalación, puesta en marcha y términos de garantía de CET Chile SpA." />
</svelte:head>

<main class="relative min-h-screen overflow-hidden pb-16">
	<!-- ─── Dynamic Background Glows ───────────────────────────────────────────── -->
	<div class="pointer-events-none absolute -top-40 -left-20 h-[ 600px ] w-[ 600px ] rounded-full bg-brand/5 blur-[ 120px ]"></div>
	<div class="pointer-events-none absolute top-1/3 -right-20 h-[ 500px ] w-[ 500px ] rounded-full bg-brand-bright/5 blur-[ 100px ]"></div>
	<div class="pointer-events-none absolute bottom-10 left-1/4 h-[ 400px ] w-[ 400px ] rounded-full bg-brand/5 blur-[ 90px ]"></div>

	<!-- ─── HERO SECTION ───────────────────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 pt-16 pb-12 sm:px-8 lg:pt-20">
		<div class="max-w-4xl mx-auto text-center space-y-6">
			<span class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand backdrop-blur-md shadow-card">
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
				</span>
				Marco Contractual Corporativo
			</span>

			<div class="space-y-4">
				<h1 class="font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl md:text-6xl leading-tight">
					Condiciones
					<br />
					<span class="bg-linear-to-r from-brand via-brand-bright to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
						Comerciales & Venta
					</span>
				</h1>
				<p class="text-xs font-black text-text-muted uppercase tracking-[ 0.2em ]">
					CET Chile SpA — Ciencia, Educación, Tecnología
				</p>
				<p class="max-w-3xl mx-auto text-base font-medium leading-relaxed text-text-muted sm:text-lg">
					Nuestras operaciones se rigen por un conjunto de bases y términos comerciales transparentes, estructurados para asegurar la excelencia en la provisión de materiales, instrumentación científica y desarrollos educativos en todo el territorio chileno.
				</p>
			</div>
		</div>

		<!-- Conceptual Map Infographic (main.avif) - Placed under the text and significantly enlarged -->
		<div class="mx-auto max-w-5xl mt-12 flex justify-center">
			<div class="relative w-full flex items-center justify-center">
				<div class="absolute inset-0 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>
				
				<!-- Large Infographic Card Frame -->
				<div class="group relative w-full overflow-hidden rounded-3xl border border-brand/10 bg-white p-4 sm:p-6 shadow-card transition-all duration-500 hover:border-brand/30 hover:scale-[ 1.01 ] hover:shadow-card-hover animate-float">
					<div class="overflow-hidden rounded-2xl bg-white flex items-center justify-center">
						<img
							src="/commercial-terms/main.avif"
							alt="Infografía de Condiciones Comerciales CET Chile SpA"
							class="h-auto w-full max-h-[ 600px ] object-contain transition-transform duration-700 group-hover:scale-[ 1.005 ]"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── INTERACTIVE TABBED TERMS SECTION ───────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 border-t border-brand/10 mt-12">
		<!-- Dynamic Tab Switcher Layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
			
			<!-- Left side category list -->
			<div class="flex flex-col gap-3 lg:col-span-4">
				<div class="space-y-2 mb-4">
					<span class="text-xs font-black uppercase tracking-[ 0.25em ] text-brand">Índice Temático</span>
					<h2 class="font-display text-2xl font-extrabold text-text">Estructura Comercial</h2>
					<p class="text-xs text-text-muted">Consulte de manera ágil los términos organizados por áreas haciendo clic en cada pestaña.</p>
				</div>

				{#each Object.entries( categories ) as [ key, val ] }
					<button
						onclick={ ( ) => { activeCategoryTab = key; } }
						class="
							w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group
							{ activeCategoryTab === key 
								? 'bg-brand/10 border-brand text-brand shadow-md scale-[ 1.01 ]' 
								: 'bg-card border-brand/5 text-text-muted hover:bg-card/70 hover:border-brand/20 hover:text-text' 
							}
						"
					>
						<div class="flex items-center gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-input border border-brand/10 shadow-xs">
								{#if val.icon === 'truck' }
									<svg class="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<rect x="1" y="3" width="15" height="13" />
										<polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
										<circle cx="5.5" cy="18.5" r="2.5" />
										<circle cx="18.5" cy="18.5" r="2.5" />
									</svg>
								{:else if val.icon === 'shield-check' }
									<svg class="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
										<polyline points="9 11 11 13 15 9" />
									</svg>
								{:else}
									<svg class="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
										<path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4" />
										<circle cx="6.5" cy="12.5" r="1.5" />
										<circle cx="10.5" cy="12.5" r="1.5" />
									</svg>
								{/if}
							</div>
							<div class="space-y-0.5">
								<p class="text-xs font-bold text-text uppercase tracking-wider">{ val.title }</p>
							</div>
						</div>
						<svg class="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				{/each}
			</div>

			<!-- Right side Tab Content Panel with dynamic terms -->
			<div class="lg:col-span-8 space-y-6">
				{#key activeCategoryTab}
					<div in:fade={ { duration : 200 } } class="space-y-6">
						{#each categories[ activeCategoryTab ].sections as section, i}
							<article class="
								group relative flex flex-col justify-between overflow-hidden rounded-3xl
								border border-brand/10 bg-card p-8
								shadow-card transition-all duration-300
								hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-card-hover
							">
								<!-- Number Badge & Title header -->
								<div class="flex items-start gap-4">
									<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand text-xs font-black shadow-xs">
										{ i + 1 }
									</span>
									<div class="space-y-2">
										<h3 class="font-display text-lg font-bold text-brand leading-snug">
											{ section.title }
										</h3>
										<p class="text-xs sm:text-sm leading-relaxed text-text-muted">
											{ section.description }
										</p>
									</div>
								</div>
							</article>
						{/each}
					</div>
				{/key}
			</div>
		</div>
	</section>

	<!-- ─── OFFICIAL CORPORATE TRUST SEAL CALLOUT ──────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 pt-12 sm:px-8">
		<div class="relative overflow-hidden rounded-3xl border border-brand/10 bg-card px-8 py-12 shadow-card lg:px-16 lg:py-16">
			<div class="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-brand/5 blur-3xl"></div>
			
			<div class="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
				<div class="space-y-6 lg:col-span-8">
					<div class="flex items-center gap-3">
						<span class="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1 text-[ 9px ] font-black uppercase tracking-widest text-brand border border-brand/20 shadow-xs">
							Garantía CET Chile SpA
						</span>
					</div>
					<h3 class="font-display text-2xl font-extrabold tracking-tight text-text sm:text-4xl leading-tight">
						Respaldo y Compromiso
						<br />
						<span class="bg-linear-to-r from-brand via-brand-bright to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
							Comercial Certificado
						</span>
					</h3>
					<p class="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl">
						Nuestras condiciones contractuales garantizan que cada cotización sea respetada íntegramente de acuerdo con lo detallado en los manuales oficiales de cada equipamiento científico. Brindamos soporte técnico directo, repuestos genuinos y trazabilidad metodológica para todo Chile.
					</p>
					
					<div class="flex flex-wrap items-center gap-4 pt-2">
						<a
							href="mailto:ventas@globalcet.cl"
							class="
								flex items-center justify-center gap-2 rounded-xl bg-brand/10 border border-brand/20 px-4 py-3 text-xs font-black uppercase tracking-wider text-brand
								shadow-xs transition-all duration-300
								hover:bg-brand hover:text-surface-dark hover:border-brand
							"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
								<polyline points="22,6 12,13 2,6" />
							</svg>
							ventas@globalcet.cl
						</a>
						<span class="text-xs text-text-muted font-bold">Licitaciones y SLEP / Convenios</span>
					</div>
				</div>
				
				<!-- Column for seal official Trust sticker graphic -->
				<div class="flex justify-center lg:col-span-4">
					<div class="relative w-full max-w-[ 220px ] aspect-square flex items-center justify-center p-4 rounded-full bg-white dark:bg-input border border-brand/10 shadow-card animate-float">
						<img
							src="/commercial-terms/sello.avif"
							alt="Garantía de Confianza CET Chile SpA"
							class="h-full w-full object-contain"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	@keyframes float {
		0% {
			transform : translateY( 0px ) rotate( 0deg );
		}
		50% {
			transform : translateY( -8px ) rotate( 0.5deg );
		}
		100% {
			transform : translateY( 0px ) rotate( 0deg );
		}
	}

	.animate-float {
		animation : float 5s ease-in-out infinite;
	}
</style>