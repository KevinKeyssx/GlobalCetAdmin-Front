<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const videoUrl = $derived( data.videoUrl );
</script>

<svelte:head>
	<title>Nuestra Infraestructura y Centros de Operación | GlobalCET</title>
	<meta name="description" content="Explora las instalaciones de última generación de CET Chile SpA / GlobalCET. Almacenamiento certificado, control de calidad científico y logística de alta eficiencia." />
</svelte:head>

<main class="relative min-h-screen overflow-hidden py-12">
	<!-- ─── Dynamic Background Glows ───────────────────────────────────────────── -->
	<div class="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-brand/5 blur-3xl"></div>
	<div class="pointer-events-none absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-brand-bright/5 blur-3xl"></div>
	<div class="pointer-events-none absolute bottom-10 left-1/4 h-80 w-80 rounded-full bg-brand/5 blur-3xl"></div>

	<!-- ─── HERO SECTION ───────────────────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 pt-16 pb-12 sm:px-8 lg:pt-20">
		<div class="mx-auto max-w-4xl text-center space-y-6 animate-fade-in-up">
			<span class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand backdrop-blur-md shadow-card">
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
				</span>
				Capacidad Logística Avanzada
			</span>

			<h1 class="font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl md:text-6xl leading-tight">
				Infraestructura Operativa
				<br />
				<span class="bg-linear-to-r from-brand via-brand-bright to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
					GlobalCET
				</span>
			</h1>

			<p class="mx-auto max-w-2xl text-base font-medium leading-relaxed text-text-muted sm:text-lg">
				Nuestras instalaciones centrales en Chile están equipadas con tecnología de vanguardia para la custodia, validación científica y distribución de insumos educativos de alta precisión.
			</p>
		</div>
	</section>

	<!-- ─── CINEMATIC VIDEO SHOWCASE ───────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-5xl px-6 py-6 sm:px-8 animate-fade-in-up">
		<div class="group relative overflow-hidden rounded-3xl bg-black video-glow transition-all duration-500 hover:scale-[ 1.005 ]">
			<!-- Video Player with fallback controls -->
			{#if ( videoUrl ) }
				<video
					src={ videoUrl }
					autoplay
					muted
					loop
					playsinline
					controls
					class="w-full h-auto aspect-video object-cover relative z-10"
				>
					<track kind="captions" />
				</video>
			{:else}
				<div class="flex flex-col items-center justify-center py-32 text-center text-text-muted space-y-4">
					<span class="text-4xl">⚠️</span>
					<p class="text-sm font-bold">Video de infraestructura temporalmente no disponible</p>
				</div>
			{/if}

			<!-- Bottom Widescreen Accent glow -->
			<div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 via-black/0 to-transparent h-20 pointer-events-none z-25"></div>
		</div>

		<!-- video description subtitle card -->
		<div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-brand/10 bg-card/65 p-4 backdrop-blur-md">
			<div class="flex items-center gap-3">
				<span class="text-lg">📹</span>
				<div>
					<h3 class="text-xs font-black uppercase tracking-wider text-text">Recorrido Virtual HD</h3>
					<p class="text-[ 11px ] font-medium text-text-muted">Centro de Control, Almacén y Distribución GlobalCET</p>
				</div>
			</div>
			<div class="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[ 10px ] font-black uppercase tracking-widest text-brand border border-brand/20">
				<span class="relative flex h-1.5 w-1.5">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
					<span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand"></span>
				</span>
				Transmisión Activa
			</div>
		</div>
	</section>

	<!-- ─── METRICS & CAPABILITIES SECTION ────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 border-t border-brand/10 mt-16 animate-fade-in-up">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			
			<!-- Metric 1 -->
			<div class="group relative overflow-hidden rounded-2xl border border-brand/10 bg-card p-6 shadow-card transition-all duration-300 hover:border-brand/35">
				<div class="relative z-10 space-y-2">
					<span class="block text-3xl font-black text-brand tracking-tight">1,200+ m²</span>
					<span class="block text-xs font-black uppercase tracking-wider text-text">Superficie Operativa</span>
					<p class="text-[ 11px ] leading-relaxed text-text-muted font-medium">
						Espacio diseñado para el almacenamiento seguro, control térmico de reactivos y ensamblaje de kits escolares.
					</p>
				</div>
			</div>

			<!-- Metric 2 -->
			<div class="group relative overflow-hidden rounded-2xl border border-brand/10 bg-card p-6 shadow-card transition-all duration-300 hover:border-brand/35">
				<div class="relative z-10 space-y-2">
					<span class="block text-3xl font-black text-brand-bright tracking-tight">99.8%</span>
					<span class="block text-xs font-black uppercase tracking-wider text-text">Precisión de Logística</span>
					<p class="text-[ 11px ] leading-relaxed text-text-muted font-medium">
						Procesos sistematizados de picking y empaque de alta seguridad para evitar roturas de material de vidrio.
					</p>
				</div>
			</div>

			<!-- Metric 3 -->
			<div class="group relative overflow-hidden rounded-2xl border border-brand/10 bg-card p-6 shadow-card transition-all duration-300 hover:border-brand/35">
				<div class="relative z-10 space-y-2">
					<span class="block text-3xl font-black text-emerald-400 tracking-tight">100%</span>
					<span class="block text-xs font-black uppercase tracking-wider text-text">Certificación de Insumos</span>
					<p class="text-[ 11px ] leading-relaxed text-text-muted font-medium">
						Validación y empaque individual de cada material didáctico bajo normativas nacionales e internacionales.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── CORE FACILITIES DETAILS ───────────────────────────────────────────── -->
	<section class="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 border-t border-brand/10 mt-12">
		<!-- Section Header -->
		<div class="mx-auto max-w-3xl text-center space-y-4 mb-16">
			<span class="text-xs font-black uppercase tracking-[ 0.25em ] text-brand-bright">Instalaciones Destacadas</span>
			<h2 class="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
				Estructura Funcional de CET Chile
			</h2>
		</div>

		<!-- Grid items details -->
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			
			<!-- Facility Card 1 -->
			<div class="group relative rounded-3xl border border-brand/10 bg-card p-8 transition-all duration-300 hover:border-brand/35 hover:-translate-y-1 shadow-card hover:shadow-card-hover">
				<div class="space-y-6">
					<div class="flex h-12 w-12 shrink-0 self-start items-center justify-center rounded-2xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-surface-dark transition-all duration-300">
						<span class="text-2xl">🔬</span>
					</div>
					<div class="space-y-3">
						<h3 class="font-display text-lg font-bold text-text group-hover:text-brand transition-colors">Laboratorio de Control</h3>
						<p class="text-xs text-text-muted leading-relaxed font-medium">
							Área dedicada a la inspección aleatoria y pruebas de resistencia de materiales ( material de vidrio soplado, reactivos químicos e instrumental digital ) para certificar la máxima confiabilidad educativa.
						</p>
					</div>
				</div>
			</div>

			<!-- Facility Card 2 -->
			<div class="group relative rounded-3xl border border-brand/10 bg-card p-8 transition-all duration-300 hover:border-brand/35 hover:-translate-y-1 shadow-card hover:shadow-card-hover">
				<div class="space-y-6">
					<div class="flex h-12 w-12 shrink-0 self-start items-center justify-center rounded-2xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-surface-dark transition-all duration-300">
						<span class="text-2xl">📦</span>
					</div>
					<div class="space-y-3">
						<h3 class="font-display text-lg font-bold text-text group-hover:text-brand transition-colors">Almacén Inteligente</h3>
						<p class="text-xs text-text-muted leading-relaxed font-medium">
							Bodegas modulares ordenadas con control térmico y de humedad relativa, asegurando la perfecta conservación de reactivos farmacéuticos y el empaquetado hermético de guías didácticas impresas.
						</p>
					</div>
				</div>
			</div>

			<!-- Facility Card 3 -->
			<div class="group relative rounded-3xl border border-brand/10 bg-card p-8 transition-all duration-300 hover:border-brand/35 hover:-translate-y-1 shadow-card hover:shadow-card-hover">
				<div class="space-y-6">
					<div class="flex h-12 w-12 shrink-0 self-start items-center justify-center rounded-2xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-surface-dark transition-all duration-300">
						<span class="text-2xl">🚚</span>
					</div>
					<div class="space-y-3">
						<h3 class="font-display text-lg font-bold text-text group-hover:text-brand transition-colors">Distribución Rápida</h3>
						<p class="text-xs text-text-muted leading-relaxed font-medium">
							Bahía de carga de alto tráfico y alianzas de transporte prioritario nacional. Brinda cobertura ágil y despachos asegurados a colegios, Servicios Locales ( SLEP ), liceos y universidades rurales y urbanas.
						</p>
					</div>
				</div>
			</div>

		</div>
	</section>
</main>

<style>
	/* Premium custom styles */
	.video-glow {
		box-shadow : 0 20px 50px color-mix( in srgb, var( --color-brand ) 12%, transparent );
		border     : 1px solid color-mix( in srgb, var( --color-brand ) 20%, transparent );
	}

	/* Dynamic Keyframe Animations */
	@keyframes fadeInUp {
		0% {
			opacity   : 0;
			transform : translateY( 20px );
		}
		100% {
			opacity   : 1;
			transform : translateY( 0px );
		}
	}

	.animate-fade-in-up {
		animation : fadeInUp 0.8s cubic-bezier( 0.16, 1, 0.3, 1 ) forwards;
	}
</style>
