<script lang="ts">
	import { page } from '$app/state';
	import Glitter from '$lib/components/loaders/Glitter.svelte';
</script>


<svelte:head>
	<title>Error { page.status } | CET Chile SpA / GlobalCET</title>
</svelte:head>


<main class="relative min-h-[ 80vh ] flex items-center justify-center px-6 py-12 overflow-hidden">
	<!-- ─── Dynamic Background Glows ───────────────────────────────────────────── -->
	<div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[ 500px ] w-[ 500px ] rounded-full bg-brand/5 blur-[ 120px ]"></div>

	<div class="relative max-w-xl w-full text-center space-y-16">

		<!-- Biochemistry Beaker / Atomic Illustration with Floating Animation -->
		<!-- <div class="flex justify-center">
			<div class="relative flex items-center justify-center h-40 w-40 rounded-full bg-brand/5 border border-brand/10 shadow-card animate-float">
				<svg class="h-20 w-20 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3M6 14h12" />
					<circle cx="9" cy="18" r="1" class="animate-ping" style="animation-duration : 3s;" />
					<circle cx="15" cy="16" r="1.5" class="animate-ping" style="animation-duration : 4s;" />
					<circle cx="12" cy="15" r="1" class="animate-ping" style="animation-duration : 2.5s;" />
				</svg>
				<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
					<span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-bright"></span>
				</span>
			</div>
		</div> -->

		<!-- Status Code and Creative Message -->
		<div class="space-y-4">
			<span class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-card px-4 py-1.5 text-[ 10px ] font-black uppercase tracking-widest text-brand backdrop-blur-md shadow-card">
				Reacción Incompleta
			</span>
			<h1 class="font-display text-7xl font-extrabold tracking-tight text-text sm:text-8xl leading-none">
				<span class="bg-linear-to-r from-brand via-brand-bright to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
					{ page.status || 404 }
				</span>
			</h1>
			<h2 class="font-display text-xl font-bold text-text sm:text-2xl leading-snug">
				{#if page.status === 404 }
					Fórmula Extraviada / Ruta no Encontrada
				{:else}
					Inestabilidad en el Proceso / Error de Servidor
				{/if}
			</h2>
			<p class="max-w-md mx-auto text-sm leading-relaxed text-text-muted">
				{#if page.status === 404 }
					La fórmula o ruta solicitada no se encuentra disponible en nuestro laboratorio. Es posible que el elemento haya sido catalogado en otra sección.
				{:else}
					El servidor ha experimentado una fluctuación molecular temporal. Por favor, intente iniciar el proceso nuevamente más tarde.
				{/if}
			</p>
		</div>

        <Glitter />

		<!-- Action Buttons -->
		<div class="flex flex-wrap items-center justify-center gap-4 pt-4">
			<a
				href="/"
				class="
					relative flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-xs font-black uppercase tracking-wider text-surface-dark
					shadow-card transition-all duration-300 group overflow-hidden
					hover:-translate-y-0.5 hover:bg-brand-bright hover:shadow-card-hover
				"
			>
				<span class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
					<polyline points="9 22 9 12 15 12 15 22" />
				</svg>

                <span>Volver al Inicio</span>
			</a>

			<a
				href="/catalog"
				class="
					flex items-center justify-center gap-2 rounded-xl bg-brand/10 border border-brand/20 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-brand
					shadow-xs transition-all duration-300
					hover:bg-brand hover:text-surface-dark hover:border-brand
				"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>

                <span>Ver Catálogo</span>
			</a>
		</div>
	</div>
</main>

<style>
	@keyframes float {
		0% {
			transform : translateY( 0px );
		}
		50% {
			transform : translateY( -8px );
		}
		100% {
			transform : translateY( 0px );
		}
	}

	/* .animate-float {
		animation : float 4s ease-in-out infinite;
	} */
</style>