<script lang="ts">
	// ─── Svelte 5 - Fundamentals Page ───────────────────────────────────────────
	// An elegant, responsive, and interactive portal designed to display CET Chile
	// SpA's fundamental ejes for science laboratory implementations.

	import { fade } from 'svelte/transition';

	interface FundamentSubPoint {
		title       : string;
		description : string;
	}

	interface FundamentPillar {
		id          : string;
		title       : string;
		subtitle    : string;
		icon        : string;
		subpoints   : FundamentSubPoint[];
	}

	let activeMainTab: string = $state( 'ejes' );

	const ejesPillars: FundamentPillar[] = [
		{
			id        : 'infra',
			title     : 'Infraestructura & Equipamiento',
			subtitle  : 'Base del material que es necesaria para que la ciencia ocurra.',
			icon      : 'building',
			subpoints : [
				{
					title       : 'Mobiliario Técnico',
					description : 'Mesones resistentes a químicos, lavabos con trampas de sedimentos y almacenamiento seguro para reactivos.'
				},
				{
					title       : 'Equipamiento Científico',
					description : 'Instrumentos de medición, microscopios, sensores digitales y kits experimentales.'
				},
				{
					title       : 'Suministros Críticos',
					description : 'Conexiones certificadas de gas, agua y electricidad, además de una ventilación adecuada según la normativa chilena.'
				}
			]
		},
		{
			id        : 'security',
			title     : 'Seguridad & Gestión de Riesgos',
			subtitle  : 'Crítico para proteger a los estudiantes y docentes.',
			icon      : 'shield-alert',
			subpoints : [
				{
					title       : 'Protocolos de Seguridad',
					description : 'Manuales de uso para cada equipo y procedimientos en caso de derrames o accidentes.'
				},
				{
					title       : 'Implementos de Protección Personal ( EPP )',
					description : 'Disponibilidad de antiparras, delantales, guantes y otros accesorios.'
				},
				{
					title       : 'Señalética y Emergencia',
					description : 'Extintores vigentes, duchas de emergencia, lavaojos y señalización de salidas de escape.'
				},
				{
					title       : 'Manejo de Residuos',
					description : 'Protocolos para la eliminación de desechos químicos o biológicos según el Reglamento del Ministerio de Salud.'
				}
			]
		},
		{
			id        : 'curriculum',
			title     : 'Currículum & Capacitación Docente',
			subtitle  : 'Un laboratorio sin uso pedagógico es solo una bodega. Transforma tecnología en aprendizaje.',
			icon      : 'graduation-cap',
			subpoints : [
				{
					title       : 'Alineación Curricular',
					description : 'Las experiencias de laboratorio deben estar vinculadas a los Objetivos de Aprendizaje ( OA ) del Ministerio de Educación ( Mineduc ).'
				},
				{
					title       : 'Capacitación Continua',
					description : 'Formación para los profesores en el uso de nuevas tecnologías, metodologías indagatorias y mantenimiento básico de los equipos.'
				},
				{
					title       : 'Recursos Didácticos',
					description : 'Guías de trabajo para estudiantes y manuales para el docente que faciliten la experimentación.'
				}
			]
		},
		{
			id        : 'innovation',
			title     : 'Innovación & Sostenibilidad',
			subtitle  : 'Este eje proyecta el laboratorio hacia el futuro y el impacto social. Ciencia con Conciencia.',
			icon      : 'leaf',
			subpoints : [
				{
					title       : 'Tecnología y Digitalización',
					description : 'Integración de herramientas STEAM, sensores de datos en tiempo real y recursos digitales.'
				},
				{
					title       : 'Sostenibilidad',
					description : 'Uso de reactivos de bajo impacto ambiental y fomento de la cultura del reciclaje dentro de la investigación científica.'
				},
				{
					title       : 'Mantenimiento Preventivo',
					description : 'Planificación de revisiones técnicas anuales para asegurar la vida útil de la inversión.'
				}
			]
		}
	];

	const guidePillars: FundamentPillar[] = [
		{
			id        : 'preparation',
			title     : 'Preparación & Seguridad',
			subtitle  : 'Inspección Previa: Antes de cualquier sesión, el docente o técnico debe verificar el estado de los reactivos y el funcionamiento de los equipos.',
			icon      : 'check-circle',
			subpoints : [
				{
					title       : 'Uso Obligatorio de EPP',
					description : 'No se inicia ninguna experiencia sin el uso de delantal, antiparras y guantes cuando el experimento lo requiera.'
				},
				{
					title       : 'Zona de Emergencia',
					description : 'Mantener siempre despejado el acceso al extintor, botiquín y estación lavaojos.'
				}
			]
		},
		{
			id        : 'behavior',
			title     : 'Comportamiento & Convivencia RICE',
			subtitle  : 'Normas de conducta y orden dentro del laboratorio de ciencias.',
			icon      : 'users',
			subpoints : [
				{
					title       : 'Ingreso Ordenado',
					description : 'Los estudiantes deben ingresar sin mochilas ni alimentos para evitar contaminaciones o accidentes.'
				},
				{
					title       : 'Manipulación Responsable',
					description : 'Queda estrictamente prohibido correr, jugar o manipular equipos sin la autorización directa del instructor.'
				},
				{
					title       : 'Reporte Inmediato',
					description : 'Cualquier derrame, rotura de material o falla eléctrica debe ser reportada al encargado de inmediato, sin miedo a represalias.'
				}
			]
		},
		{
			id        : 'rigor',
			title     : 'Rigor Científico & Pedagógico',
			subtitle  : 'El aprendizaje basado en la evidencia y el uso de tecnologías en el aula.',
			icon      : 'beaker',
			subpoints : [
				{
					title       : 'Registro de Datos',
					description : 'Fomentar el uso de la bitácora o guía de trabajo para registrar observaciones en tiempo real. La ciencia se basa en la evidencia.'
				},
				{
					title       : 'Uso de Tecnología',
					description : 'Las herramientas tecnológicas ( software, tablets ) deben usarse exclusivamente para fines académicos definidos en la guía de trabajo.'
				},
				{
					title       : 'Objetivo de Aprendizaje',
					description : 'Cada experimento debe comenzar con una breve explicación de por qué y para qué se realiza la actividad, conectándola con el currículum nacional.'
				}
			]
		},
		{
			id        : 'order',
			title     : 'Sostenibilidad, Orden & Impacto',
			subtitle  : 'Manejo y orden al término de la sesión experimental.',
			icon      : 'recycle',
			subpoints : [
				{
					title       : 'Gestión de Residuos',
					description : 'Clasificar los desechos según su naturaleza ( papel/cartón, vidrio roto, residuos químicos ) siguiendo el protocolo de la institución.'
				},
				{
					title       : 'Limpieza del Puesto',
					description : 'El laboratorio se entrega en las mismas o mejores condiciones de como se recibió. Mesones limpios y equipos desconectados.'
				},
				{
					title       : 'Cuidado del Inventario',
					description : 'Reportar insumos que estén por agotarse para asegurar la continuidad de las experiencias de los siguientes grupos.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>Ejes Fundamentales e Implementación de Laboratorios | CET Chile SpA / GlobalCET</title>
	<meta name="description" content="Conozca los ejes fundamentales para la implementación de laboratorios de ciencias y las guías de buenas prácticas de CET Chile SpA." />
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
				Metodología Pedagógica & Técnica
			</span>

			<div class="space-y-4">
				<h1 class="font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl md:text-6xl leading-tight">
					Implementación de
					<br />
					<span class="bg-linear-to-r from-brand via-brand-bright to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
						Laboratorios de Ciencias
					</span>
				</h1>
				<p class="text-xs font-black text-text-muted uppercase tracking-[ 0.2em ]">
					CET Chile SpA — Ciencia, Educación, Tecnología
				</p>
				<p class="max-w-3xl mx-auto text-base font-medium leading-relaxed text-text-muted sm:text-lg">
					Proporcionamos soluciones integrales para el desarrollo científico escolar. Nuestra metodología une la infraestructura física y el equipamiento especializado con la alineación curricular, seguridad activa y capacitación docente necesaria para transformar la tecnología en aprendizaje.
				</p>
			</div>
		</div>
	</section>

	<!-- ─── INTERACTIVE SECTOR SWITCHER ────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-5xl px-6 py-6 sm:px-8">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1.5 rounded-3xl bg-card border border-brand/10 shadow-card">
			<button
				onclick={ ( ) => { activeMainTab = 'ejes'; } }
				class="
					relative py-2 px-6 rounded-2xl transition-all duration-300 font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 group
					{ activeMainTab === 'ejes'
						? 'bg-brand text-surface-dark shadow-md scale-105'
						: 'text-text-muted hover:text-text hover:bg-brand/5'
					}
				"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
				<span>Ejes Fundamentales</span>
			</button>

			<button
				onclick={ ( ) => { activeMainTab = 'guide'; } }
				class="
					relative py-2 px-6 rounded-2xl transition-all duration-300 font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 group
					{ activeMainTab === 'guide'
						? 'bg-brand text-surface-dark shadow-md scale-105'
						: 'text-text-muted hover:text-text hover:bg-brand/5'
					}
				"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<line x1="16" y1="13" x2="8" y2="13" />
					<line x1="16" y1="17" x2="8" y2="17" />
					<polyline points="10 9 9 9 8 9" />
				</svg>
				<span>Guía de Buenas Prácticas</span>
			</button>
		</div>
	</section>

	<!-- ─── INTERACTIVE TAB CONTENT SHOWCASE ───────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-10 sm:px-8">
		{#key activeMainTab}
			<div in:fade={ { duration : 200 } } class="space-y-16">

				{#if activeMainTab === 'ejes'}
					<!-- ─── EJES FUNDAMENTALES VIEW ─── -->

					<!-- Conceptual Map Image 1 (fundamentals1.avif) - Placed Centered and Enlarged -->
					<div class="mx-auto max-w-4xl flex justify-center">
						<div class="relative w-full flex items-center justify-center">
							<div class="absolute inset-0 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>

							<!-- Large Map Frame -->
							<div class="group relative w-full overflow-hidden rounded-3xl bg-white  shadow-card transition-all duration-500 hover:border-brand/30 hover:scale-105 hover:shadow-card-hover animate-float">
								<div class="overflow-hidden rounded-2xl bg-white flex items-center justify-center p-3">
									<img
										src="/fundaments/fundamentals1.avif"
										alt="Ejes Fundamentales para la Implementación de Laboratorios de Ciencias"
										class="h-auto w-full max-h-[ 500px ] object-contain transition-transform duration-700 group-hover:scale-[ 1.005 ]"
									/>
								</div>
							</div>
						</div>
					</div>

					<div class="mx-auto max-w-3xl text-center space-y-2 mt-12">
						<span class="text-xs font-black uppercase tracking-[ 0.25em ] text-brand">Solución Integral</span>
						<h2 class="font-display text-2xl font-extrabold text-text sm:text-3xl">Cuatro Pilares Estratégicos</h2>
						<p class="text-xs sm:text-sm text-text-muted">Nuestra base metodológica detallada para una implementación científica exitosa.</p>
					</div>

					<!-- Pillars Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
						{#each ejesPillars as pillar}
							<article class="
								group relative flex flex-col justify-between overflow-hidden rounded-3xl
								border border-brand/10 bg-card p-8 sm:p-10
								shadow-card transition-all duration-300
								hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover
							">
								<div class="space-y-6">
									<!-- Header: Icon & Title -->
									<div class="flex items-center gap-4">
										<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark shadow-xs">
											{#if pillar.icon === 'building'}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
													<line x1="9" y1="22" x2="9" y2="16" />
													<line x1="15" y1="22" x2="15" y2="16" />
													<line x1="9" y1="16" x2="15" y2="16" />
													<path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01" />
												</svg>
											{:else if pillar.icon === 'shield-alert'}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
													<line x1="12" y1="8" x2="12" y2="12" />
													<line x1="12" y1="16" x2="12.01" y2="16" />
												</svg>
											{:else if pillar.icon === 'graduation-cap'}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M22 10v6M2 10l10-5 10 5-10 5z" />
													<path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
												</svg>
											{:else}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19L12 22Z" />
													<path d="M12 2V12H22" />
													<path d="M12 12L4.85857 19" />
												</svg>
											{/if}
										</div>
										<h3 class="font-display text-xl font-bold text-text group-hover:text-brand transition-colors duration-200">
											{ pillar.title }
										</h3>
									</div>

									<p class="text-xs leading-relaxed text-brand font-medium">
										{ pillar.subtitle }
									</p>

									<!-- Sub-points list -->
									<div class="space-y-4 pt-4 border-t border-brand/5">
										{#each pillar.subpoints as sub}
											<div class="space-y-1">
												<h4 class="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
													<span class="h-1.5 w-1.5 rounded-full bg-brand"></span>
													{ sub.title }
												</h4>
												<p class="text-[ 11px ] leading-relaxed text-text-muted">
													{ sub.description }
												</p>
											</div>
										{/each}
									</div>
								</div>
							</article>
						{/each}
					</div>

				{:else}
					<!-- ─── GUIA DE BUENAS PRACTICAS VIEW ─── -->

					<div class="mx-auto max-w-3xl text-center space-y-2">
						<span class="text-xs font-black uppercase tracking-[ 0.25em ] text-brand">Manual de Convivencia</span>
						<h2 class="font-display text-2xl font-extrabold text-text sm:text-3xl">Buenas Prácticas en el Laboratorio</h2>
						<p class="text-xs sm:text-sm text-text-muted">Normas de rigurosidad científica, comportamiento RICE y seguridad preventiva.</p>
					</div>

					<!-- Grids of guide rules -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
						{#each guidePillars as pillar}
							<article class="
								group relative flex flex-col justify-between overflow-hidden rounded-3xl
								border border-brand/10 bg-card p-8 sm:p-10
								shadow-card transition-all duration-300
								hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover
							">
								<div class="space-y-6">
									<!-- Header Icon & Title -->
									<div class="flex items-center gap-4">
										<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark shadow-xs">
											{#if pillar.icon === 'check-circle'}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
													<polyline points="22 4 12 14.01 9 11.01" />
												</svg>
											{:else if pillar.icon === 'users'}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
													<circle cx="9" cy="7" r="4" />
													<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
													<path d="M16 3.13a4 4 0 0 1 0 7.75" />
												</svg>
											{:else if pillar.icon === 'beaker'}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3M6 14h12M12 3v11" />
												</svg>
											{:else}
												<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
												</svg>
											{/if}
										</div>
										<h3 class="font-display text-xl font-bold text-text group-hover:text-brand transition-colors duration-200">
											{ pillar.title }
										</h3>
									</div>

									<p class="text-xs leading-relaxed text-brand font-medium">
										{ pillar.subtitle }
									</p>

									<!-- Sub-points checklist -->
									<div class="space-y-4 pt-4 border-t border-brand/5">
										{#each pillar.subpoints as sub}
											<div class="space-y-1">
												<h4 class="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
													<svg class="h-3.5 w-3.5 text-brand shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
														<polyline points="20 6 9 17 4 12" />
													</svg>
													{ sub.title }
												</h4>
												<p class="text-[ 11px ] leading-relaxed text-text-muted pl-6">
													{ sub.description }
												</p>
											</div>
										{/each}
									</div>
								</div>
							</article>
						{/each}
					</div>

					<!-- Conceptual Map Image 2 (fundamentals2.avif) - Placed Centered and Enlarged at the bottom -->
					<div class="mx-auto max-w-4xl flex justify-center mt-16">
						<div class="relative w-full flex items-center justify-center">
							<div class="absolute inset-0 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>

							<!-- Large Map Frame -->
							<div class="group relative w-full overflow-hidden rounded-3xl  bg-white shadow-card transition-all duration-500 hover:border-brand/30 hover:scale-105 hover:shadow-card-hover animate-float">
								<div class="overflow-hidden rounded-2xl bg-white flex items-center justify-center p-3">
									<img
										src="/fundaments/fundamentals2.avif"
										alt="Guía de Buenas Prácticas en el Laboratorio de Ciencias"
										class="h-auto w-full max-h-[ 500px ] object-contain transition-transform duration-700 group-hover:scale-[ 1.005 ]"
									/>
								</div>
							</div>
						</div>
					</div>
				{/if}

			</div>
		{/key}
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