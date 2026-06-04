<script lang="ts">
	// ─── GlobalCET Home Page ──────────────────────────────────────────────────────
	// An elegant, minimalist landing page with strong biochemistry aesthetics.
</script>

<svelte:head>
	<title>GlobalCET | Portal de Administración & Control de Inventario</title>
	<meta name="description" content="Portal administrativo de soluciones bioquímicas GlobalCET. Suministre y gestione reactivos de alta pureza, material de vidrio certificado, kits de diagnóstico y laboratorios móviles autónomos de alta tecnología." />
</svelte:head>

<main class="relative min-h-screen overflow-hidden">
	<!-- ─── Dynamic background elements ────────────────────────────────────────── -->
	<div class="pointer-events-none absolute -top-40 -left-20 h-[600px] w-[600px] rounded-full bg-brand/5 blur-[120px] dark:bg-brand/10"></div>
	<div class="pointer-events-none absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-brand-bright/5 blur-[100px] dark:bg-brand-bright/8"></div>
	<div class="pointer-events-none absolute bottom-10 left-1/4 h-[400px] w-[400px] rounded-full bg-brand/5 blur-[90px]"></div>

	<!-- ─── Hero Section ───────────────────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 pt-24 pb-16 sm:px-8 lg:pt-32 lg:pb-24">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 lg:items-center">
			<!-- Hero Text -->
			<div class="space-y-8 lg:col-span-7">
				<!-- Brand Pill -->
				<span class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-4 py-1.5 font-bold uppercase tracking-widest text-brand backdrop-blur-md shadow-card">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
					</span>
					Portal del Administrador
				</span>

				<div class="space-y-4">
					<h1 class="font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
						Control
						<br />
						<span class="bg-linear-to-r from-brand via-brand-bright to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
							Catálogo & Inventario
						</span>
					</h1>
					<p class="max-w-2xl text-base font-medium leading-relaxed text-text-muted sm:text-lg">
						Panel centralizado de control para la administración global de insumos, materiales de borosilicato, reactivos analíticos, kits de laboratorio y laboratorios móviles autónomos de GlobalCET.
					</p>
				</div>

				<!-- Hero CTA Actions -->
				<div class="flex flex-wrap items-center gap-4">
					<a
						id="hero-cta-dashboard"
						href="/dashboard"
						class="rounded-xl bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright hover:shadow-lg"
					>
						Panel de Control
					</a>
					<a
						id="hero-cta-about"
						href="#features"
						class="rounded-xl border border-brand/20 bg-surface/30 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-brand backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand/10 hover:border-brand/45"
					>
						Nuestra Propuesta
					</a>
				</div>

				<!-- Trust Elements -->
				<div class="pt-6 border-t border-brand/10">
					<div class="grid grid-cols-3 gap-6">
						<div>
							<p class="text-xl font-bold text-text font-display">100%</p>
							<p class="font-semibold text-text-muted uppercase tracking-wider">Pureza Certificada</p>
						</div>

                        <div>
							<p class="text-xl font-bold text-text font-display">ISO 9001</p>
							<p class="font-semibold text-text-muted uppercase tracking-wider">Estándar Global</p>
						</div>

                        <div>
							<p class="text-xl font-bold text-text font-display">(OA)</p>
							<p class="font-semibold text-text-muted uppercase tracking-wider">Objetivos de apredizaje</p>
						</div>

                        <div>
							<p class="text-xl font-bold text-text font-display">(PME)</p>
							<p class="font-semibold text-text-muted uppercase tracking-wider">Procesos de mejora continúa, fortalecimiento de aprendizaje de los estudiante</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Animated Molecular / Bio Illustration (SVG) -->
			<div class="flex justify-center lg:col-span-5">
				<div class="relative w-full max-w-md aspect-square flex items-center justify-center">
					<!-- Glow behind -->
					<div class="absolute inset-0 bg-brand/10 rounded-full blur-3xl animate-pulse"></div>

					<!-- Native SVG Molecular Structure representation -->
                    <img src="/logo/logo.avif" alt="GlobalCET" class="h-full w-full object-contain" />

					<!-- floating badges -->
					<div class="absolute -top-6 -right-2 bg-card border border-brand/20 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider text-brand shadow-card backdrop-blur-sm animate-bounce duration-4000">
						H2O + Reactivos
					</div>

                    <div class="absolute -bottom-4 -left-6 bg-card border border-brand/20 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider text-brand-bright shadow-card backdrop-blur-sm animate-bounce duration-3000" style="animation-delay: 1.5s;">
						Purity level &gt; 99.9%
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── Core Pillars Section (Features Grid) ───────────────────────────────── -->
	<section id="features" class="relative border-t border-brand/10 bg-surface/10 px-6 py-20 lg:py-28">
		<div class="mx-auto max-w-7xl">
			<!-- Section Header -->
			<div class="mx-auto max-w-3xl text-center space-y-4 mb-16">
				<h2 class="font-black uppercase tracking-[0.25em] text-brand">Nuestras Divisiones</h2>
				<p class="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
					Sistemas Integrados para el Progreso Científico
				</p>
				<p class="text-base text-text-muted max-w-xl mx-auto">
					Desarrollamos, distribuimos insumos bajo los controles de calidad más rigurosos del sector del área de la ciencia.
				</p>
			</div>

			<!-- Features Cards Grid -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
				<!-- Pillar 1: Equipos & Reactivos -->
				<article class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
					<div class="space-y-6">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M4.5 16.5c-1.5 1.25-2.5 3-2.5 4.5h20c0-1.5-1-3.25-2.5-4.5" />
								<path d="M12 2v16M9 8h6M8 12h8" />
								<path d="M12 2C8 6 6.5 10 6.5 15c0 .5 0 1 .5 1.5M12 2c4 4 5.5 8 5.5 13 0 .5 0 1-.5 1.5" />
							</svg>
						</div>
						<div class="space-y-2">
							<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">Equipos & Reactivos</h3>
							<p class="text-sm leading-relaxed text-text-muted">
								Reactivos técnicos, PA, material de vidrio (Borosilicato 3.3). Instrumentos de medición y análisis, para sus laboratorios.
							</p>
						</div>
					</div>
					<div class="mt-8 border-t border-brand/5 pt-4">
						<a href="/filters" class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand group-hover:underline">
							Ver Equipos
							<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</a>
					</div>
				</article>

				<!-- Pillar 2: Kits Moleculares -->
				<article class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
					<div class="space-y-6">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-bright/10 text-brand-bright transition-all duration-300 group-hover:bg-brand-bright group-hover:text-surface-dark">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="7" height="9" rx="1" />
								<rect x="14" y="3" width="7" height="5" rx="1" />
								<rect x="14" y="12" width="7" height="9" rx="1" />
								<rect x="3" y="16" width="7" height="5" rx="1" />
							</svg>
						</div>

                        <div class="space-y-2">
							<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">Kits de laboratorios</h3>

                            <p class="text-sm leading-relaxed text-text-muted">
                                Herramientas pedagógicas, ideales para el aula, diseñadas para transformar la teoría en experimentos prácticos mediente la metodología (ciencia y tecnología).
							</p>
						</div>
					</div>

                    <div class="mt-8 border-t border-brand/5 pt-4">
						<a href="/filters" class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand-bright group-hover:underline">
							Ver Kits
							<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</a>
					</div>
				</article>

				<!-- Pillar 3: Laboratorios Móviles -->
				<article class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
					<div class="space-y-6">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="3" width="20" height="14" rx="2" />
								<line x1="8" y1="21" x2="16" y2="21" />
								<line x1="12" y1="17" x2="12" y2="21" />
							</svg>
						</div>

                        <div class="space-y-2">
							<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">Laboratorios Móviles</h3>

                            <p class="text-sm leading-relaxed text-text-muted">
                                Instalación completamente equipada, la cual se desplaza hacia diferentes puntos, para realizar análisis, ensayos o actividades educativas. Consiste en un carro tecnológico diseñado para moverse dentro del recinto. Cualquier lugar se convierte en ciencia.
							</p>
						</div>
					</div>

                    <div class="mt-8 border-t border-brand/5 pt-4">
						<a href="/filters" class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand group-hover:underline">
							Ver Laboratorios

                            <svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</a>
					</div>
				</article>

                <article class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
					<div class="space-y-6">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="3" width="20" height="14" rx="2" />
								<line x1="8" y1="21" x2="16" y2="21" />
								<line x1="12" y1="17" x2="12" y2="21" />
							</svg>
						</div>

                        <div class="space-y-2">
							<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">Nodo Labs</h3>

                            <p class="text-sm leading-relaxed text-text-muted">
                                Son iniciativas cientificas, educativas. Laboratorios de educación digital y prototipado rápido hacia la educación para potenciar la innovación y la formatión técnico prefesional. Posee equipamiento de punta, con enfoque pedagógico para problemas reales en su entorno mediante la tecnología.
                            </p>
						</div>
					</div>

                    <div class="mt-8 border-t border-brand/5 pt-4">
						<a href="/filters" class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand group-hover:underline">
							Ver NodoLabs

                            <svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</a>
					</div>
				</article>
			</div>
		</div>
	</section>

	<!-- ─── Interactive Search CTA Banner ──────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-20">
		<div class="relative overflow-hidden rounded-3xl border border-brand/15 bg-card/40 px-8 py-12 shadow-card backdrop-blur-md lg:px-16 lg:py-16">
			<!-- Grid Background inside Card -->
			<div class="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,var(--color-brand)_0%,transparent_75%)]"></div>

			<div class="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
				<div class="lg:col-span-7 space-y-4">
					<h3 class="font-display text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
						¿Buscas un reactivo, insumo o equipo específico?
					</h3>
					<p class="text-sm leading-relaxed text-text-muted">
						Accede a nuestro buscador avanzado con filtros integrados y cotizador automatizado. Encuentra especificaciones químicas de precisión, dimensiones de laboratorios y componentes de kits al instante.
					</p>
				</div>
				<div class="flex flex-col sm:flex-row gap-4 lg:col-span-5 lg:justify-end">
					<a
						id="cta-search-explore"
						href="/filters"
						class="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-4 font-black uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright"
					>
						Abrir Buscador Inteligente
					</a>
					<a
						id="cta-search-contact"
						href="/contacto"
						class="inline-flex items-center justify-center rounded-xl border border-brand/20 bg-surface/30 px-6 py-4 font-black uppercase tracking-wider text-brand backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand/10"
					>
						Contactar Soporte Técnico
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── Value Proposition Section ────────────────────────────────────────── -->
	<section class="border-t border-brand/10 px-6 py-20 lg:py-28">
		<div class="mx-auto max-w-7xl">
			<div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
				<!-- Column text -->
				<div class="space-y-8">
					<div class="space-y-4">
						<span class="font-black uppercase tracking-[0.25em] text-brand-bright">Calidad Sin Concesiones</span>
						<h2 class="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
							El Estándar Científico de GlobalCET
						</h2>
						<p class="text-base leading-relaxed text-text-muted">
							En el mundo de la bioquímica, la precisión no es opcional. Un mínimo error de pureza en un reactivo o una desviación térmica en un contenedor puede alterar meses de investigación. En GlobalCET, mitigamos el riesgo científico.
						</p>
					</div>

					<div class="space-y-6">
						<!-- Point 1 -->
						<div class="flex items-start gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
								<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</div>
							<div class="space-y-1">
								<h4 class="font-bold text-text text-sm">Control de Pureza Analítica</h4>
								<p class="text-text-muted leading-relaxed">Cada lote de reactivos cuenta con certificación cromatográfica de espectrometría garantizada.</p>
							</div>
						</div>

						<!-- Point 2 -->
						<div class="flex items-start gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
								<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</div>
							<div class="space-y-1">
								<h4 class="font-bold text-text text-sm">Borosilicato 3.3 de Precisión</h4>
								<p class="text-text-muted leading-relaxed">Materiales de vidrio diseñados para resistir shocks térmicos elevados y resistir la corrosión ácida.</p>
							</div>
						</div>

						<!-- Point 3 -->
						<div class="flex items-start gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
								<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</div>
							<div class="space-y-1">
								<h4 class="font-bold text-text text-sm">Diseño de Ingeniería de Campo</h4>
								<p class="text-text-muted leading-relaxed">Laboratorios y kits validados por biólogos y químicos expertos para asegurar su usabilidad.</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Column illustration (SVG chemistry laboratory flask detail) -->
				<div class="flex justify-center">
					<div class="relative w-full max-w-sm aspect-square bg-card border border-brand/10 rounded-3xl shadow-card p-8 flex items-center justify-center overflow-hidden">
						<!-- Decorative chemistry grids -->
						<div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(var(--color-brand)_1px,transparent_1px)] bg-size-[16px_16px]"></div>

						<!-- flask animated SVG -->
						<svg
							class="w-3/5 h-3/5 text-brand"
							viewBox="0 0 200 200"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<!-- Flask Body -->
							<path
								d="M100 40 L100 80 L60 160 C50 180 65 190 85 190 L115 190 C135 190 150 180 140 160 L100 80 Z"
								stroke="currentColor"
								stroke-width="5"
								stroke-linejoin="round"
								stroke-linecap="round"
							/>
							<line x1="85" y1="40" x2="115" y2="40" stroke="currentColor" stroke-width="6" stroke-linecap="round" />

							<!-- Liquid Level (animated/filled SVG) -->
							<path
								d="M75 130 L125 130 L135 150 C140 160 135 170 120 170 L80 170 C65 170 60 160 65 150 Z"
								fill="var(--color-brand-bright)"
								class="opacity-40"
							/>
							<path
								d="M75 130 C85 125 95 135 105 130 C115 125 120 132 125 130"
								stroke="var(--color-brand-bright)"
								stroke-width="3"
								stroke-linecap="round"
							/>

							<!-- Floating Bubbles -->
							<circle cx="100" cy="110" r="4" fill="var(--color-brand)" class="animate-bounce" />
							<circle cx="90" cy="95" r="3" fill="var(--color-brand-bright)" class="animate-bounce" style="animation-delay: 0.5s;" />
							<circle cx="112" cy="100" r="5" fill="var(--color-brand)" class="animate-bounce" style="animation-delay: 1s;" />
							<circle cx="100" cy="70" r="2.5" fill="currentColor" class="animate-pulse" />

							<!-- Measurement tick marks -->
							<line x1="90" y1="150" x2="105" y2="150" stroke="currentColor" stroke-width="2" class="opacity-60" />
							<line x1="94" y1="130" x2="106" y2="130" stroke="currentColor" stroke-width="2" class="opacity-60" />
							<line x1="98" y1="110" x2="102" y2="110" stroke="currentColor" stroke-width="2" class="opacity-60" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>
