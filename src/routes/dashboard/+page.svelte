<script lang="ts">
	import { onMount }  from 'svelte';
	import { slide }    from 'svelte/transition';

    import toast from 'svelte-french-toast';

	import connectRequest, { isApiError }   from '$lib/services/fetch.service';
	import type { GlobalSearchTotalsResponse } from '$lib/types/search';
	import { globalLoadingStore }           from '$lib/state/loading';
	import { INTERNAL_ENDPOINTS }           from '$lib/utils/endpoints';

	// ─── Local State (Svelte 5 Runes) ─────────────────────────────────────────────
	let activeSection = $state( 'productos' );
	let stats         = $state< GlobalSearchTotalsResponse | null >( null );

	// ─── Fetch live metrics from global-search ────────────────────────────────────
	async function loadStats( ) : Promise<void> {
		$globalLoadingStore = true;
		try {
			const response = await connectRequest< GlobalSearchTotalsResponse >( {
				endpoint   : INTERNAL_ENDPOINTS.GLOBAL_SEARCH.TOTALS,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( 'No se pudo conectar al servidor de base de datos de GlobalCET. Por favor, inicie el backend.', {
					duration : 6000,
				} );
				return;
			}

			stats = response;

			toast.success( 'Conexión con el servidor establecida. Datos actualizados.', {
				duration : 3000,
			} );
		} catch ( e ) {
			toast.error( 'Error de red: El servidor de GlobalCET está desconectado. Asegúrese de que esté encendido.', {
				duration : 6000,
			} );
		} finally {
			$globalLoadingStore = false;
		}
	}

	onMount( ( ) => {
		loadStats();
	} );

	function toggleSection( section : string ) : void {
		activeSection = activeSection === section ? '' : section;
	}
</script>

<svelte:head>
	<title>Panel de Administración GlobalCET</title>
	<meta name="description" content="Gestione sus productos, reactivos, kits moleculares y laboratorios de ciencias." />
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-12 lg:py-16">
	<div class="relative mx-auto max-w-5xl space-y-12">
		<!-- ─── Dashboard Header ─────────────────────────────────────────────────── -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand/15 pb-8">
			<div class="space-y-2">
				<span class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-3 py-1 font-bold uppercase tracking-widest text-brand backdrop-blur-md">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
					</span>
					Portal del Administrador
				</span>
				<h1 class="font-display text-4xl font-black tracking-tight text-text sm:text-5xl">
					Panel de Control Global
				</h1>
				<p class="text-sm leading-relaxed text-text-muted max-w-xl">
					Bienvenido al núcleo de gestión de catálogo de GlobalCET. Seleccione una división científica a continuación para agregar, modificar o eliminar registros del inventario.
				</p>
			</div>

			<!-- Refresh stats button -->
			<button
				onclick={ loadStats }
				class="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/20 bg-surface/30 px-5 py-3 font-bold uppercase tracking-wider text-brand backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand/10 hover:border-brand/45"
			>
				<svg class="h-4 w-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
				</svg>
				Sincronizar Servidor
			</button>
		</div>

		<!-- ─── Global Live Metrics Cards ────────────────────────────────────────── -->
		{#if stats }
			<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<!-- Products Card -->
				<div class="rounded-2xl border border-brand/10 bg-card/60 backdrop-blur-md p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 space-y-4">
					<div class="flex items-center gap-3 border-b border-brand/10 pb-3">
						<div class="text-xl">📦</div>
						<h3 class="font-display font-black text-text uppercase tracking-wider text-xs">División de Productos</h3>
					</div>
					<ul class="space-y-3.5 text-xs font-semibold">
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Productos</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.products.catalog.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.products.catalog.inactive } inact.</span>
							</div>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Materiales</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.products.materials.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.products.materials.inactive } inact.</span>
							</div>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Categorías</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.products.categories.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.products.categories.inactive } inact.</span>
							</div>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Subcategorías</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.products.subCategories.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.products.subCategories.inactive } inact.</span>
							</div>
						</li>
					</ul>
				</div>

				<!-- Kits Card -->
				<div class="rounded-2xl border border-brand/10 bg-card/60 backdrop-blur-md p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 space-y-4">
					<div class="flex items-center gap-3 border-b border-brand/10 pb-3">
						<div class="text-xl">🧬</div>
						<h3 class="font-display font-black text-text uppercase tracking-wider text-xs">División de Kits</h3>
					</div>
					<ul class="space-y-3.5 text-xs font-semibold">
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Kits Diagnóstico</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.kits.catalog.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.kits.catalog.inactive } inact.</span>
							</div>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Categorías</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.kits.categories.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.kits.categories.inactive } inact.</span>
							</div>
						</li>
					</ul>
				</div>

				<!-- Mobile Labs Card -->
				<div class="rounded-2xl border border-brand/10 bg-card/60 backdrop-blur-md p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 space-y-4">
					<div class="flex items-center gap-3 border-b border-brand/10 pb-3">
						<div class="text-xl">🚛</div>
						<h3 class="font-display font-black text-text uppercase tracking-wider text-xs">Laboratorios Móviles</h3>
					</div>
					<ul class="space-y-3.5 text-xs font-semibold">
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Laboratorios</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.mobileLabs.catalog.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.mobileLabs.catalog.inactive } inact.</span>
							</div>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-text-muted">Categorías</span>
							<div class="flex items-center gap-2">
								<span class="text-emerald-500 font-bold">{ stats.mobileLabs.categories.active } act.</span>
								<span class="text-red-500 font-bold">{ stats.mobileLabs.categories.inactive } inact.</span>
							</div>
						</li>
					</ul>
				</div>
			</section>
		{:else}
			<div class="flex justify-center py-8">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
			</div>
		{/if}

		<!-- ─── Interactive Accordion Navigation Hub ────────────────────────────── -->
		<section class="space-y-4">
			<!-- 1. Productos Accordion -->
			<div class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card transition-all duration-300 hover:border-brand/25">
				<button
					onclick={ ( ) => toggleSection( 'productos' ) }
					class="flex w-full items-center justify-between px-6 py-5 text-left outline-none"
				>
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="16" />
								<line x1="8" y1="12" x2="16" y2="12" />
							</svg>
						</div>
						<div>
							<h3 class="font-display text-lg font-black text-text uppercase tracking-wide">
								División de Productos, Reactivos & Materiales
							</h3>
							<p class="text-text-muted">
								Administre los insumos individuales, especificaciones de borosilicato, materiales y subcategorías.
							</p>
						</div>
					</div>
					<svg
						class="h-5 w-5 text-text-muted transition-transform duration-300 { activeSection === 'productos' ? 'rotate-180 text-brand' : '' }"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				{#if ( activeSection === 'productos' ) }
					<div transition:slide={ { duration : 350 } } class="border-t border-brand/10 bg-brand/5 p-6">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<!-- Link: Administrar Productos -->
							<a
								href="/dashboard/products"
								class="group flex flex-col justify-between rounded-xl border border-brand/10 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
							>
								<div class="space-y-2">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
										📦
									</div>
									<h4 class="font-display text-base font-bold text-text group-hover:text-brand transition-colors">
										Administrar Productos
									</h4>
									<p class="text-text-muted leading-relaxed">
										Cree, edite o elimine reactivos químicos de precisión, frascos erlenmeyer y equipos de medición de laboratorio.
									</p>
								</div>
								<div class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand">
									Gestionar listado
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="9 18 15 12 9 6" />
									</svg>
								</div>
							</a>

							<!-- Link: Administrar Materiales -->
							<a
								href="/dashboard/products/materials"
								class="group flex flex-col justify-between rounded-xl border border-brand/10 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
							>
								<div class="space-y-2">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
										🔬
									</div>
									<h4 class="font-display text-base font-bold text-text group-hover:text-brand transition-colors">
										Administrar Materiales
									</h4>
									<p class="text-text-muted leading-relaxed">
										Configure las propiedades analíticas de materiales, tales como Borosilicato 3.3, Acero Inoxidable y sus coeficientes térmicos.
									</p>
								</div>
								<div class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand">
									Gestionar materiales
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="9 18 15 12 9 6" />
									</svg>
								</div>
							</a>

							<!-- Link: Administrar Categorías -->
							<a
								href="/dashboard/products/categories"
								class="group flex flex-col justify-between rounded-xl border border-brand/10 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
							>
								<div class="space-y-2">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
										🏷️
									</div>
									<h4 class="font-display text-base font-bold text-text group-hover:text-brand transition-colors">
										Administrar Categorías
									</h4>
									<p class="text-text-muted leading-relaxed">
										Organice la estructura del catálogo creando categorías madre (ej. Reactivos) y subcategorías (ej. Ácidos PA).
									</p>
								</div>
								<div class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand">
									Gestionar categorías
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="9 18 15 12 9 6" />
									</svg>
								</div>
							</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- 2. Kits Accordion -->
			<div class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card transition-all duration-300 hover:border-brand/25">
				<button
					onclick={ ( ) => toggleSection( 'kits' ) }
					class="flex w-full items-center justify-between px-6 py-5 text-left outline-none"
				>
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="7" height="9" rx="1" />
								<rect x="14" y="3" width="7" height="5" rx="1" />
								<rect x="14" y="12" width="7" height="9" rx="1" />
								<rect x="3" y="16" width="7" height="5" rx="1" />
							</svg>
						</div>
						<div>
							<h3 class="font-display text-lg font-black text-text uppercase tracking-wide">
								División de Kits de Laboratorio
							</h3>
							<p class="text-text-muted">
								Gestione las colecciones y kits pedagógicos configurando agrupaciones de insumos específicos.
							</p>
						</div>
					</div>
					<svg
						class="h-5 w-5 text-text-muted transition-transform duration-300 { activeSection === 'kits' ? 'rotate-180 text-brand' : '' }"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				{#if ( activeSection === 'kits' ) }
					<div transition:slide={ { duration : 350 } } class="border-t border-brand/10 bg-brand/5 p-6">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<!-- Link: Administrar Kits -->
							<a
								href="/dashboard/kits"
								class="group flex flex-col justify-between rounded-xl border border-brand/10 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
							>
								<div class="space-y-2">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
										🧬
									</div>
									<h4 class="font-display text-base font-bold text-text group-hover:text-brand transition-colors">
										Administrar Kits
									</h4>
									<p class="text-text-muted leading-relaxed">
										Cree kits para ciencias (Química Básica, Biología de Células) integrando productos individuales y definiendo cantidades exactas de insumos.
									</p>
								</div>
								<div class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand">
									Gestionar kits
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="9 18 15 12 9 6" />
									</svg>
								</div>
							</a>

							<!-- Link: Administrar Categorías de Kits -->
							<a
								href="/dashboard/kits/categories"
								class="group flex flex-col justify-between rounded-xl border border-brand/10 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
							>
								<div class="space-y-2">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
										📂
									</div>
									<h4 class="font-display text-base font-bold text-text group-hover:text-brand transition-colors">
										Categorías de Kits
									</h4>
									<p class="text-text-muted leading-relaxed">
										Administre las divisiones y áreas pedagógicas (ej. Física Mecánica, Bioquímica Molecular) bajo las cuales se catalogan los kits.
									</p>
								</div>
								<div class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand">
									Gestionar categorías
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="9 18 15 12 9 6" />
									</svg>
								</div>
							</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- 3. Laboratorios Móviles Accordion -->
			<div class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card transition-all duration-300 hover:border-brand/25">
				<button
					onclick={ ( ) => toggleSection( 'labs' ) }
					class="flex w-full items-center justify-between px-6 py-5 text-left outline-none"
				>
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
							<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="3" width="20" height="14" rx="2" />
								<line x1="8" y1="21" x2="16" y2="21" />
								<line x1="12" y1="17" x2="12" y2="21" />
							</svg>
						</div>
						<div>
							<h3 class="font-display text-lg font-black text-text uppercase tracking-wide">
								División de Laboratorios Móviles
							</h3>
							<p class="text-text-muted">
								Administre los laboratorios móbiles , tecnológicos e infraestructura integradora.
							</p>
						</div>
					</div>
					<svg
						class="h-5 w-5 text-text-muted transition-transform duration-300 { activeSection === 'labs' ? 'rotate-180 text-brand' : '' }"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				{#if ( activeSection === 'labs' ) }
					<div transition:slide={ { duration : 350 } } class="border-t border-brand/10 bg-brand/5 p-6">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<!-- Link: Administrar Laboratorios -->
							<a
								href="/dashboard/mobile-labs"
								class="group flex flex-col justify-between rounded-xl border border-brand/10 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
							>
								<div class="space-y-2">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
										🚛
									</div>
									<h4 class="font-display text-base font-bold text-text group-hover:text-brand transition-colors">
										Administrar Laboratorios
									</h4>
									<p class="text-text-muted leading-relaxed">
										Registre laboratorios móviles, configurando dimensiones, kits y productos individuales integrados de fábrica.
									</p>
								</div>
								<div class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand">
									Gestionar laboratorios
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="9 18 15 12 9 6" />
									</svg>
								</div>
							</a>

							<!-- Link: Administrar Categorías de Laboratorios -->
							<a
								href="/dashboard/mobile-labs/categories"
								class="group flex flex-col justify-between rounded-xl border border-brand/10 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
							>
								<div class="space-y-2">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
										🏢
									</div>
									<h4 class="font-display text-base font-bold text-text group-hover:text-brand transition-colors">
										Categorías de Laboratorios
									</h4>
									<p class="text-text-muted leading-relaxed">
										Configure las categorias de los laboratorios móbiles.
									</p>
								</div>
								<div class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand">
									Gestionar categorías
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="9 18 15 12 9 6" />
									</svg>
								</div>
							</a>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>

<style>
	.animate-spin-slow {
		animation: spin 8s linear infinite;
	}
	@keyframes spin {
		from { transform: rotate(0deg); }
		to   { transform: rotate(360deg); }
	}
</style>
