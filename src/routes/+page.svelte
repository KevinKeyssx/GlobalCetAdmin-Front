<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto }    from '$app/navigation';

	function handleKeyDown( event : KeyboardEvent ) : void {
		if ( event.key === 'Enter' ) {
			goto( resolve( '/dashboard' ) );
		}
	}
</script>

<svelte:window onkeydown={ handleKeyDown } />

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
						href={ resolve( '/dashboard' ) }
						class="group/btn relative overflow-hidden rounded-xl bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright hover:shadow-lg flex items-center gap-2"
					>
						<span>Panel de Control</span>
						<kbd class="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-surface-dark/20 bg-surface-dark/10 px-1.5 font-mono text-[10px] font-medium text-surface-dark/75 transition-colors group-hover/btn:border-surface-dark/30 group-hover/btn:bg-surface-dark/15">
							Enter ↵
						</kbd>
					</a>
					<a
						id="hero-cta-about"
						href="#features"
						class="rounded-xl border border-brand/20 bg-surface/30 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-brand backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand/10 hover:border-brand/45"
					>
						Módulos de Gestión
					</a>
				</div>

				<!-- Trust Elements -->
				<div class="pt-6 border-t border-brand/10">
					<div class="grid grid-cols-3 gap-6">
						<div>
							<p class="text-xl font-bold text-text font-display">API 2.0</p>
							<p class="font-semibold text-text-muted uppercase tracking-wider text-[10px]">Sincronización API</p>
						</div>

						<div>
							<p class="text-xl font-bold text-text font-display">360°</p>
							<p class="font-semibold text-text-muted uppercase tracking-wider text-[10px]">Control de Catálogo</p>
						</div>

						<div>
							<p class="text-xl font-bold text-text font-display">ADMIN</p>
							<p class="font-semibold text-text-muted uppercase tracking-wider text-[10px]">Portal Restringido</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Animated Molecular / Bio Illustration (SVG) -->
			<div class="flex justify-center lg:col-span-5">
				<a
					href={ resolve( '/dashboard' ) }
					class="group/logo relative w-full max-w-md aspect-square flex items-center justify-center transition-all duration-500 hover:scale-[1.03]"
				>
					<!-- Glow behind -->
					<div class="absolute inset-0 bg-brand/10 rounded-full blur-3xl transition-all duration-500 group-hover/logo:bg-brand/20 group-hover/logo:blur-2xl"></div>

					<!-- Native SVG Molecular Structure representation -->
					<img src="/logo/logo.avif" alt="GlobalCET" class="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(5,150,105,0.15)] transition-all duration-500 group-hover/logo:drop-shadow-[0_0_25px_rgba(5,150,105,0.3)]" />

					<!-- floating badges -->
					<div class="absolute -top-6 -right-2 bg-card border border-brand/20 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider text-brand shadow-card backdrop-blur-sm animate-bounce duration-4000">
						Admin Activo
					</div>

					<div class="absolute -bottom-4 -left-6 bg-card border border-brand/20 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider text-brand-bright shadow-card backdrop-blur-sm animate-bounce duration-3000" style="animation-delay: 1.5s;">
						Catálogo Sincronizado
					</div>
				</a>
			</div>
		</div>
	</section>

	<!-- ─── Core Pillars Section (Features Grid) ───────────────────────────────── -->
	<section id="features" class="relative border-t border-brand/10 bg-surface/10 px-6 py-20 lg:py-28">
		<div class="mx-auto max-w-7xl">
			<!-- Section Header -->
			<div class="mx-auto max-w-3xl text-center space-y-4 mb-16">
				<h2 class="font-black uppercase tracking-[0.25em] text-brand">Módulos de Gestión</h2>
				<p class="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
					Herramientas Administrativas de GlobalCET
				</p>
				<p class="text-base text-text-muted max-w-xl mx-auto">
					Administre de manera centralizada el catálogo completo, las fichas técnicas, las imágenes en la nube y las relaciones estructurales.
				</p>
			</div>

			<!-- Features Cards Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Pillar 1: Catálogo de Productos -->
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
							<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">Catálogo & Reactivos</h3>
							<p class="text-sm leading-relaxed text-text-muted">
								Administre los reactivos químicos, materiales de vidrio de borosilicato, especificaciones técnicas de precisión y visibilidad de catálogo.
							</p>
						</div>
					</div>
					<div class="mt-8 border-t border-brand/5 pt-4">
						<a href={ resolve( '/dashboard/products' ) } class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand group-hover:underline">
							Gestionar Productos
							<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</a>
					</div>
				</article>

				<!-- Pillar 2: Kits de Laboratorio -->
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
							<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">Kits de Laboratorio</h3>
							<p class="text-sm leading-relaxed text-text-muted">
								Defina la composición de kits didácticos, asocie reactivos específicos e insumos científicos para guías pedagógicas del aula.
							</p>
						</div>
					</div>

					<div class="mt-8 border-t border-brand/5 pt-4">
						<a href={ resolve( '/dashboard/kits' ) } class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand-bright group-hover:underline">
							Gestionar Kits
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
								Establezca dimensiones y asocie tanto insumos individuales como kits temáticos completos a cada estación científica móvil.
							</p>
						</div>
					</div>

					<div class="mt-8 border-t border-brand/5 pt-4">
						<a href={ resolve( '/dashboard/mobile-labs' ) } class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand group-hover:underline">
							Gestionar Labs
							<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</a>
					</div>
				</article>

                <!-- Pillar 4: Clasificaciones -->
				<article class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
					<div class="space-y-6">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-surface-dark">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
								<line x1="7" y1="7" x2="7.01" y2="7" stroke-width="3" stroke-linecap="round" />
							</svg>
						</div>

						<div class="space-y-2">
							<h3 class="font-display text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand">Estructura & Categorías</h3>
							<p class="text-sm leading-relaxed text-text-muted">
								Defina la jerarquía de categorías y subcategorías que organiza el catálogo público de productos, kits y laboratorios.
							</p>
						</div>
					</div>

					<div class="mt-8 border-t border-brand/5 pt-4">
						<a href={ resolve( '/dashboard/products/categories' ) } class="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-brand group-hover:underline">
							Gestionar Categorías
							<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</a>
					</div>
				</article>
			</div>
		</div>
	</section>
</main>
