<script lang="ts">
	// ─── Svelte 5 - Code of Ethics Page ──────────────────────────────────────────
	// An elegant, modern, and responsive portal designed to display CET Chile SpA's
	// ethical principles, using a layout aligned with the premium look of the site.

	import { fade, slide } from 'svelte/transition';

	interface LawDetail {
		title       : string;
		code        : string;
		description : string;
		icon        : string;
		bullets     : string[];
	}

	let activeLawTab: string = $state( 'karin' );

	const laws: Record< string, LawDetail > = {
		karin : {
			title       : 'Prevención del Acoso y Violencia',
			code        : 'Ley Karin ( N° 21.643 )',
			description : 'Establece un marco estricto de prevención, investigación y sanción del acoso laboral, sexual y la violencia en el trabajo en Chile, garantizando espacios dignos y seguros.',
			icon        : 'shield-heart',
			bullets     : [
				'Protocolos activos de prevención frente a riesgos psicosociales en el trabajo.',
				'Canales de denuncia interna 100% confidenciales, seguros y libres de represalias.',
				'Apoyo inmediato, resguardo de privacidad y asistencia psicológica y legal.',
				'Compromiso ineludible con la dignidad, el respeto y la equidad de género en toda la organización.'
			]
		},
		data : {
			title       : 'Protección de Datos & Privacidad',
			code        : 'Ley N° 19.628',
			description : 'Regula el tratamiento y resguardo de datos de carácter personal en Chile. Garantiza la confidencialidad absoluta de la información escolar y comercial.',
			icon        : 'lock',
			bullets     : [
				'Cifrado y protección estricta de bases de datos de alumnos, docentes e instituciones.',
				'Prohibición total de divulgación o comercialización de información educativa o personal.',
				'Advertencias de confidencialidad mandatorias en toda la infraestructura de correos corporativos.',
				'Custodia segura de metodologías de enseñanza y propiedad intelectual de los kits escolares.'
			]
		},
		property : {
			title       : 'Resguardo de la Propiedad Intelectual',
			code        : 'Derechos de Autor & Patentes',
			description : 'Protege la autoría intelectual de las 20 guías de trabajo digitalizadas y metodologías de laboratorio exclusivas creadas por el equipo pedagógico de CET Chile.',
			icon        : 'award',
			bullets     : [
				'Registro oficial y protección legal contra el plagio o reproducción no autorizada.',
				'Garantía de originalidad científica en todos los insumos y kits escolares provistos.',
				'Uso exclusivo bajo licencias institucionales para colegios, escuelas y SLEP.',
				'Trazabilidad metodológica en la entrega de manuales para profesores y alumnos.'
			]
		}
	};
</script>

<svelte:head>
	<title>Código de Ética y Conducta Corporativa | CET Chile SpA / GlobalCET</title>
	<meta name="description" content="Conozca el Código de Ética y Conducta Corporativa de CET Chile SpA. Pilares fundamentales de integridad, legalidad, responsabilidad social y equidad en ciencia y educación en Chile." />
</svelte:head>

<main class="relative min-h-screen overflow-hidden py-12">
	<!-- ─── Dynamic Background Glows ───────────────────────────────────────────── -->
	<div class="pointer-events-none absolute -top-40 -left-20 h-[ 600px ] w-[ 600px ] rounded-full bg-brand/5 blur-[ 120px ]"></div>
	<div class="pointer-events-none absolute top-1/3 -right-20 h-[ 500px ] w-[ 500px ] rounded-full bg-brand-bright/5 blur-[ 100px ]"></div>
	<div class="pointer-events-none absolute bottom-10 left-1/4 h-[ 400px ] w-[ 400px ] rounded-full bg-brand/5 blur-[ 90px ]"></div>

	<!-- ─── HERO SECTION ───────────────────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 pt-16 pb-12 sm:px-8 lg:pt-20">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 lg:items-center">
			
			<!-- Hero Text Info -->
			<div class="space-y-6 lg:col-span-7">
				<span class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand backdrop-blur-md shadow-card">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
					</span>
					Marco de Conducta Profesional
				</span>

				<div class="space-y-4">
					<h1 class="font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl md:text-6xl leading-tight">
						Código de Ética &
						<br />
						<span class="bg-linear-to-r from-brand via-brand-bright to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
							Conducta Corporativa
						</span>
					</h1>
					<p class="text-xs font-black text-text-muted uppercase tracking-[ 0.2em ]">
						CET Chile SpA — Ciencia, Educación, Tecnología
					</p>
					<p class="max-w-2xl text-base font-medium leading-relaxed text-text-muted sm:text-lg">
						Para interpretar el Código de Ética y Conducta de la Empresa <strong class="text-text font-bold">CET Chile SpA</strong>, es fundamental analizar el documento oficial que rige a la organización. Con una modificación relevante el <strong class="text-brand font-bold">08 de junio de 2021</strong>, este marco asegura que todas nuestras operaciones se realicen bajo los más rigurosos estándares éticos, legales y de responsabilidad profesional en Chile.
					</p>
				</div>
			</div>

			<!-- Conceptual Map Illustration (Shield) with Floating Animation -->
			<div class="flex justify-center lg:col-span-5">
				<div class="relative w-full max-w-md aspect-square flex items-center justify-center">
					<div class="absolute inset-0 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>
					
					<!-- Floating Shield Card Frame -->
					<div class="group relative overflow-hidden rounded-3xl border border-brand/10 bg-white p-3 shadow-card transition-all duration-500 hover:border-brand/30 hover:scale-[ 1.02 ] hover:shadow-card-hover animate-float">
						<div class="overflow-hidden rounded-2xl bg-white flex items-center justify-center p-4 max-h-[ 460px ]">
							<img
								src="/code-ethics/shield.avif"
								alt="Mapa Conceptual del Código de Ética CET Chile SpA"
								class="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[ 1.01 ]"
							/>
						</div>
						<div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/5 to-transparent h-12 pointer-events-none"></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── FUNDAMENTAL PILLARS SECTION ────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 border-t border-brand/10 mt-12">
		<!-- Section Header -->
		<div class="mx-auto max-w-3xl text-center space-y-4 mb-16">
			<h2 class="text-xs font-black uppercase tracking-[ 0.25em ] text-brand">Nuestros Ejes</h2>
			<p class="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
				Pilares Fundamentales de la Organización
			</p>
		</div>

		<!-- Three Pillars Grid -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			
			<!-- Card 1: Compromiso con la Integridad y Legalidad -->
			<article class="
				group relative flex flex-col justify-between overflow-hidden rounded-3xl
				border border-brand/10 bg-card p-8
				shadow-card transition-all duration-300
				hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover
			">
				<div class="space-y-6">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark">
						<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
						</svg>
					</div>

					<div class="space-y-4">
						<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">
							Compromiso con la Integridad & Legalidad
						</h3>
						<p class="text-xs leading-relaxed text-text-muted">
							Aseguramos que todas las operaciones de <strong class="text-text font-semibold">CET Chile SpA</strong> se realicen bajo estándares éticos y legales estrictos, adhiriendo a la normativa legal vigente del Estado chileno.
						</p>

						<div class="space-y-4 pt-4 border-t border-brand/5">
							<!-- Cumplimiento -->
							<div class="space-y-1">
								<h4 class="text-xs font-bold text-text uppercase tracking-wider">Cumplimiento Normativo</h4>
								<p class="text-[ 11px ] leading-relaxed text-text-muted">
									Adhesión absoluta a las leyes chilenas, especialmente aquellas vinculadas con la probidad y la transparencia en la prestación de servicios tecnológicos y educativos en el territorio nacional.
								</p>
							</div>

							<!-- Confidencialidad -->
							<div class="space-y-1">
								<h4 class="text-xs font-bold text-text uppercase tracking-wider">Confidencialidad Extrema</h4>
								<p class="text-[ 11px ] leading-relaxed text-text-muted">
									Existe un compromiso explícito con la protección de datos e información sensible de clientes, instituciones y metodologías de enseñanza. Todo uso o divulgación no autorizada está estrictamente prohibido.
								</p>
							</div>
						</div>
					</div>
				</div>
			</article>

			<!-- Card 2: Responsabilidad Social y Sostenibilidad -->
			<article class="
				group relative flex flex-col justify-between overflow-hidden rounded-3xl
				border border-brand/10 bg-card p-8
				shadow-card transition-all duration-300
				hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover
			">
				<div class="space-y-6">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark">
						<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" />
							<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
							<path d="M2 12h22" />
						</svg>
					</div>

					<div class="space-y-4">
						<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">
							Responsabilidad Social & Sostenibilidad
						</h3>
						<p class="text-xs leading-relaxed text-text-muted">
							Proyectamos una sólida identidad corporativa ligada a valores sociales, de equidad de género y de protección ambiental activa para un futuro sostenible.
						</p>

						<div class="space-y-4 pt-4 border-t border-brand/5">
							<!-- Sello Mujer -->
							<div class="space-y-1">
								<h4 class="text-xs font-bold text-text uppercase tracking-wider">Liderazgo & Sello Mujer</h4>
								<p class="text-[ 11px ] leading-relaxed text-text-muted">
									Nuestra organización se identifica como una empresa con <strong class="text-text font-semibold">"Sello Mujer" / "Safe Woman"</strong>, destacando su compromiso con la equidad de género en el liderazgo y la gestión comercial.
								</p>
							</div>

							<!-- Compromiso Planetario -->
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<h4 class="text-xs font-bold text-text uppercase tracking-wider">Compromiso Planetario</h4>

                                    <div class="h-10 w-auto overflow-hidden flex items-center justify-center">
										<img src="/code-ethics/gotin.avif" alt="Ciencia con Conciencia" class="h-full object-contain" />
									</div>
								</div>

                                <p class="text-[ 11px ] leading-relaxed text-text-muted">
									Bajo el lema institucional <strong class="text-brand font-bold">Ciencia con Conciencia</strong>, buscamos generar un impacto ecológico positivo o neutro a través de todos nuestros insumos y productos científicos-educativos.
								</p>
							</div>
						</div>
					</div>
				</div>
			</article>

			<!-- Card 3: Ética en la Innovación Educativa -->
			<article class="
				group relative flex flex-col justify-between overflow-hidden rounded-3xl
				border border-brand/10 bg-card p-8
				shadow-card transition-all duration-300
				hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover
			">
				<div class="space-y-6">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark">
						<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" />
							<path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" />
							<path d="M12 3v18" />
						</svg>
					</div>

					<div class="space-y-4">
						<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">
							Ética en la Innovación Educativa
						</h3>
						<p class="text-xs leading-relaxed text-text-muted">
							Como proveedores líderes de materiales educativos para instituciones de prestigio, la ética en el desarrollo y la entrega de recursos es un compromiso ineludible.
						</p>

						<div class="space-y-4 pt-4 border-t border-brand/5">
							<!-- Seguridad y Calidad -->
							<div class="space-y-1">
								<h4 class="text-xs font-bold text-text uppercase tracking-wider">Seguridad y Calidad Escolar</h4>
								<p class="text-[ 11px ] leading-relaxed text-text-muted">
									Garantizamos que todos los insumos entregados (lentes de protección, reactivos de laboratorio e instrumental soplado) cumplen con altos estándares de seguridad, acompañados de fichas técnicas.
								</p>
							</div>

							<!-- Propiedad Intelectual -->
							<div class="space-y-1">
								<h4 class="text-xs font-bold text-text uppercase tracking-wider">Propiedad Intelectual</h4>
								<p class="text-[ 11px ] leading-relaxed text-text-muted">
									Nuestras 20 guías de trabajo digitalizadas y metodologías propias son una parte central de nuestra conducta ética para evitar el plagio o el mal uso de nuestros desarrollos.
								</p>
							</div>
						</div>
					</div>
				</div>
			</article>
		</div>
	</section>

	<!-- ─── REGULATORY & LEGISLATION INTERACTIVE BLOCK (Ley Karin, Ley 19.628, etc.) ─ -->
	<section class="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 border-t border-brand/10">
		<div class="mx-auto max-w-3xl text-center space-y-4 mb-12">
			<span class="text-xs font-black uppercase tracking-[ 0.25em ] text-brand-bright">Marco Regulatorio Vigente</span>
			<h2 class="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
				Cumplimiento Legal & Normativa Chilena
			</h2>
			<p class="text-sm text-text-muted max-w-2xl mx-auto">
				Nuestras políticas están alineadas estrictamente con las directrices más exigentes de la legislación del Estado de Chile para resguardar la seguridad humana, los datos personales y la propiedad intelectual.
			</p>
		</div>

		<!-- Interactive Tab Switcher Layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start mt-8">
			
			<!-- Left side tabs list -->
			<div class="flex flex-col gap-3 lg:col-span-4">
				{#each Object.entries( laws ) as [ key, val ] }
					<button
						onclick={ ( ) => { activeLawTab = key; } }
						class="
							w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group
							{ activeLawTab === key 
								? 'bg-brand/10 border-brand text-brand shadow-md scale-[ 1.01 ]' 
								: 'bg-card/40 border-brand/5 text-text-muted hover:bg-card/70 hover:border-brand/20 hover:text-text' 
							}
						"
					>
						<div class="flex items-center gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-input border border-brand/10 shadow-xs">
								{#if val.icon === 'shield-heart' }
									<svg class="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
										<path d="M12 17s-2.5-2.5-2.5-4a2.5 2.5 0 0 1 5 0c0 1.5-2.5 4-2.5 4z" />
									</svg>
								{:else if val.icon === 'lock' }
									<svg class="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
										<path d="M7 11V7a5 5 0 0 1 10 0v4" />
									</svg>
								{:else}
									<svg class="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<circle cx="12" cy="8" r="7" />
										<polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
									</svg>
								{/if}
							</div>
							<div class="space-y-0.5">
								<p class="text-xs font-bold text-text uppercase tracking-wider">{ val.title }</p>
								<p class="text-[ 10px ] font-black text-brand-bright uppercase tracking-widest">{ val.code }</p>
							</div>
						</div>
						<svg class="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				{/each}
			</div>

			<!-- Right side Tab Content Panel with Glassmorphism -->
			<div class="lg:col-span-8">
				<div class="relative overflow-hidden rounded-3xl border border-brand/10 bg-card p-8 sm:p-10 shadow-card min-h-[ 340px ] flex flex-col justify-between">
					{#key activeLawTab}
						<div in:fade={ { duration : 200 } } class="space-y-6 relative z-10">
							<div class="flex flex-wrap items-center justify-between gap-4 border-b border-brand/5 pb-4">
								<div>
									<span class="inline-block rounded-md bg-brand-bright/10 text-brand-bright px-2.5 py-1 text-[ 9px ] font-black uppercase tracking-widest">
										Legislación Chilena Activa
									</span>
									<h3 class="font-display text-2xl font-extrabold text-text mt-1">
										{ laws[ activeLawTab ].title }
									</h3>
								</div>
								<span class="text-xs font-black uppercase tracking-widest bg-brand/10 text-brand px-3 py-1.5 rounded-full border border-brand/20 shadow-xs">
									{ laws[ activeLawTab ].code }
								</span>
							</div>

							<p class="text-sm leading-relaxed text-text-muted">
								{ laws[ activeLawTab ].description }
							</p>

							<div class="space-y-3">
								<h4 class="text-xs font-extrabold text-text uppercase tracking-wider">Compromisos Clave de CET Chile:</h4>
								<ul class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
									{#each laws[ activeLawTab ].bullets as bullet}
										<li class="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
											<svg class="h-4 w-4 shrink-0 text-brand mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
												<polyline points="20 6 9 17 4 12" />
											</svg>
											<span>{ bullet }</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					{/key}
				</div>
			</div>
		</div>
	</section>

	<!-- ─── RELATION WITH EDUCATIONAL COMMUNITY ────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 border-t border-brand/10">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 lg:items-center">
			
			<!-- Column for mascot graphics -->
			<div class="flex justify-center lg:col-span-5 order-last lg:order-first">
				<div class="relative w-full max-w-sm aspect-square bg-card/40 border border-brand/10 rounded-3xl shadow-card p-8 flex flex-col items-center justify-center overflow-hidden">
					<div class="relative w-full h-4/5 flex items-center justify-center">
						<img
							src="/code-ethics/gotin.avif"
							alt="Ilustración Ciencia con Conciencia - CET Chile SpA"
							class="h-full object-contain transition-transform duration-700 hover:scale-105"
						/>
					</div>
					<span class="text-xs font-bold text-brand uppercase tracking-wider mt-4">Ciencia con Conciencia®</span>
				</div>
			</div>

			<!-- Innovation details text -->
			<div class="space-y-6 lg:col-span-7">
				<span class="text-xs font-black uppercase tracking-[ 0.25em ] text-brand-bright">Alianzas Académicas</span>
				<h2 class="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
					Relación con la Comunidad Educativa
				</h2>
				<p class="text-base leading-relaxed text-text-muted">
					En <strong class="text-text font-bold">CET Chile SpA</strong> operamos en estrecha y permanente colaboración con el ecosistema formativo nacional: establecimientos de educación pública y privada, Servicios Locales de Educación Pública ( SLEP ), Centros de Formación Técnica ( CFT ), Institutos Profesionales ( IP ) y Universidades.
				</p>

				<div class="space-y-5 border-t border-brand/5 pt-5">
					<!-- Point 1 -->
					<div class="flex items-start gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
							<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						</div>
						<div class="space-y-1">
							<h4 class="font-bold text-text text-sm">Apoyo a la Convivencia Escolar</h4>
							<p class="text-xs text-text-muted leading-relaxed">
								Nuestros productos y servicios se alinean con los Reglamentos Internos de Convivencia Escolar ( RICE ) de nuestros clientes, apoyando normativas como el uso regulado de dispositivos electrónicos para resguardar la concentración y el bienestar del alumno.
							</p>
						</div>
					</div>

					<!-- Point 2 -->
					<div class="flex items-start gap-4 mt-2">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
							<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
								<line x1="2" y1="10" x2="22" y2="10" />
							</svg>
						</div>
						<div class="space-y-1">
							<h4 class="font-bold text-text text-sm">Transparencia Comercial Centralizada</h4>
							<p class="text-xs text-text-muted leading-relaxed">
								La gestión de cotizaciones y facturación ( ej. facturas por calculadoras científicas, equipamientos de laboratorio o insumos médicos ) se administra de manera centralizada y transparente a través de nuestra Gerencia Comercial y de contabilidad.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── REPORTING CHANNEL (CANAL DE DENUNCIAS / CONFIDENCIALIDAD) ──────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 border-t border-brand/10">
		<div class="relative overflow-hidden rounded-3xl border border-brand/10 bg-linear-to-br from-card/80 to-brand/5 p-8 sm:p-12 shadow-card backdrop-blur-md">
			<div class="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-brand/5 blur-3xl"></div>
			
			<div class="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
				<div class="space-y-4 lg:col-span-8">
					<span class="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand border border-brand/20 shadow-xs">
						Confidencialidad Absoluta
					</span>

                    <h3 class="font-display text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
						Canal de Denuncias & Consultas Éticas
					</h3>

                    <p class="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl">
						Para dar cumplimiento a la <strong class="text-brand font-bold">Ley Karin</strong> y resguardar la probidad institucional, mantenemos un canal digital directo y totalmente confidencial para reportar cualquier conducta contraria a nuestro código, así como resolver dudas éticas corporativas.
					</p>
				</div>

				<div class="flex flex-col items-stretch sm:items-center justify-center lg:col-span-4 space-y-2">
					<a
						id="ethics-canal-wsp"
						href="https://wa.me/56997841809"
						target="_blank"
						rel="noopener noreferrer"
						class="
							relative flex items-center justify-center gap-3 rounded-2xl bg-brand px-6 py-4 text-xs font-black uppercase tracking-wider text-surface-dark
							shadow-card transition-all duration-300 group overflow-hidden
							hover:-translate-y-0.5 hover:bg-brand-bright hover:shadow-card-hover
						"
					>
						<span class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
						</svg>

                        <span>Reportar Canal Confidencial</span>

                        <span class="absolute -right-1 -top-1 flex h-3 w-3">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-surface-dark opacity-75"></span>

                            <span class="relative inline-flex rounded-full h-3 w-3 bg-brand-bright"></span>
						</span>
					</a>

                    <p class="text-sm text-text-muted text-center uppercase tracking-widest font-black">
						Soporte Directo WhatsApp:
					</p>

                    <p>+56 9 9784 1809</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── CONFIDENCE GUARANTEE CALLOUT SECTION ───────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 pt-8 sm:px-8">
		<div class="relative overflow-hidden rounded-3xl border border-brand/10 bg-card px-8 py-10 shadow-card lg:px-16 lg:py-12">
			<div class="relative max-w-4xl mx-auto text-center space-y-4">
				<span class="text-[ 10px ] font-black uppercase tracking-[ 0.25em ] text-brand">Compromiso</span>
				<h3 class="font-display text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
					Garantía de Confianza Institucional
				</h3>
				<p class="text-xs sm:text-sm leading-relaxed text-text-muted">
					Este código de conducta no es simplemente una pauta interna para nuestros profesionales. Constituye una <strong class="text-text font-bold uppercase tracking-wide">Garantía de Confianza</strong> indiscutible para los colegios, institutos, SLEP y universidades que contratan a <strong class="text-text font-semibold">CET Chile SpA</strong>. Nos responsabilizamos plenamente de que la ciencia, la educación y la tecnología se entreguen de manera íntegra, segura, equitativa y plenamente legal en todo el territorio chileno.
				</p>
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
