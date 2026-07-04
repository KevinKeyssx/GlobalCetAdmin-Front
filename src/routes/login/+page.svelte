<script lang="ts">
	import AuthButton from '$lib/components/shared/AuthButton.svelte';
</script>

<svelte:head>
	<title>Iniciar Sesión | GlobalCET</title>
</svelte:head>

<!-- Center Login Card with Emerald Sci-Fi aesthetics -->
<div class="relative flex min-h-[calc(100vh-380px)] w-full items-center justify-center px-6 py-12">
	<!-- Floating bioluminescent particles -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden z-0">
		<div class="particle p-1 top-[10%] left-[20%] animate-float-1"></div>
		<div class="particle p-2 top-[30%] right-[15%] animate-float-2"></div>
		<div class="particle p-3 bottom-[20%] left-[10%] animate-float-3"></div>
		<div class="particle p-1 bottom-[15%] right-[25%] animate-float-4"></div>
		<div class="particle p-2 top-[5%] right-[30%] animate-float-1"></div>
	</div>

	<!-- Background Lights specific to the login page for depth -->
	<div class="pointer-events-none absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-brand/10 blur-[100px] dark:bg-brand/15"></div>
	<div class="pointer-events-none absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-brand-bright/8 blur-[100px] dark:bg-brand-bright/12"></div>

	<!-- Glassmorphism Card with scanner and tech layout -->
	<div class="glass-card relative w-full max-w-md overflow-hidden rounded-3xl border border-brand/25 bg-surface/35 p-10 shadow-card backdrop-blur-2xl transition-all duration-300 hover:shadow-card-hover hover:border-brand/40 hover:-translate-y-1 dark:border-brand/15 dark:bg-card/20">
		<!-- Scanner sweep line effect -->
		<div class="scanner-line"></div>

		<!-- Holographic Corner Decoration -->
		<div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand/30 rounded-tl-lg pointer-events-none"></div>
		<div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand/30 rounded-tr-lg pointer-events-none"></div>
		<div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand/30 rounded-bl-lg pointer-events-none"></div>
		<div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand/30 rounded-br-lg pointer-events-none"></div>

		<!-- Accent Glow -->
		<div class="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-brand/12 blur-2xl"></div>
		<div class="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-brand-bright/12 blur-2xl"></div>

		<!-- Card Content -->
		<div class="relative z-10 flex flex-col items-center text-center space-y-8">
			<!-- Animated Chemistry Flask SVG container -->
			<div class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/20 transition-transform duration-300 hover:scale-105 hover:ring-brand/40 shadow-inner">
				<svg class="h-12 w-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
					<clipPath id="flask-clip">
						<path d="M40 15H60V30L78 75C81 82 76 90 68 90H32C24 90 19 82 22 75L40 30V15Z" />
					</clipPath>

					<!-- Flask Outline -->
					<path d="M40 15H60V30L78 75C81 82 76 90 68 90H32C24 90 19 82 22 75L40 30V15Z" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round" class="text-brand/40 dark:text-brand/30" />
					<path d="M36 15H64" stroke="currentColor" stroke-width="5" stroke-linecap="round" class="text-brand/50" />

					<!-- Wave fill within the flask clip -->
					<g clip-path="url( #flask-clip )">
						<rect x="10" y="45" width="80" height="50" class="fill-brand/15 dark:fill-brand/20" />
						<path d="M 10 58 Q 30 54 50 58 T 90 58 L 90 95 L 10 95 Z" class="fill-brand/60 dark:fill-brand/50 animate-wave" />
					</g>

					<!-- Refraction Highlight -->
					<path d="M29 78L39 52" stroke="white" stroke-width="2.5" stroke-linecap="round" class="opacity-25" />

					<!-- Tiny bubbles -->
					<circle cx="42" cy="78" r="2.5" class="fill-brand-bright animate-bubble-1" />
					<circle cx="58" cy="70" r="1.5" class="fill-brand-bright animate-bubble-2" />
					<circle cx="48" cy="85" r="2" class="fill-brand-bright animate-bubble-3" />
				</svg>
			</div>

			<!-- Title and description with technical vibe -->
			<div class="space-y-3">
				<h2 class="font-display text-3xl font-black tracking-tight text-text">
					Portal de Administración
				</h2>
				<p class="text-sm font-semibold text-text-muted leading-relaxed max-w-sm">
					Inicia sesión con tus credenciales de seguridad para acceder al panel de control central de GlobalCET.
				</p>
			</div>

			<!-- Google Auth Button Wrapper -->
            <div class="w-full flex justify-center">
                <AuthButton />
            </div>
		</div>
	</div>
</div>

<style>
	/* Liquid sloshing animation */
	@keyframes wave {
		0%, 100% {
			transform : translateY( 0 ) scaleY( 1 );
		}
		50% {
			transform : translateY( -3px ) scaleY( 1.08 );
		}
	}
	.animate-wave {
		animation : wave 3s ease-in-out infinite;
	}

	/* Bubble rising animation */
	@keyframes bubble {
		0% {
			transform : translateY( 0 ) scale( 1 );
			opacity   : 0;
		}
		15% {
			opacity   : 0.9;
		}
		85% {
			opacity   : 0.9;
		}
		100% {
			transform : translateY( -35px ) scale( 0.3 );
			opacity   : 0;
		}
	}
	.animate-bubble-1 {
		animation : bubble 3.5s infinite ease-in-out;
	}
	.animate-bubble-2 {
		animation : bubble 2.8s infinite ease-in-out;
		animation-delay : 0.8s;
	}
	.animate-bubble-3 {
		animation : bubble 4.2s infinite ease-in-out;
		animation-delay : 1.8s;
	}

	/* Scanner sweep light bar */
	.scanner-line {
		position       : absolute;
		top            : 0;
		left           : 0;
		width          : 100%;
		height         : 2.5px;
		background     : linear-gradient( to right, transparent 5%, var( --color-brand ) 50%, transparent 95% );
		box-shadow     : 0 0 10px var( --color-brand );
		opacity        : 0;
		pointer-events : none;
		z-index        : 20;
	}

	/* Sweep effect on card hover */
	.glass-card:hover .scanner-line {
		animation : scan-sweep 3s cubic-bezier( 0.4, 0, 0.2, 1 ) infinite;
	}

	@keyframes scan-sweep {
		0% {
			top     : 0%;
			opacity : 0;
		}
		5% {
			opacity : 0.7;
		}
		95% {
			opacity : 0.7;
		}
		100% {
			top     : 100%;
			opacity : 0;
		}
	}

	/* Floating background particles */
	.particle {
		position      : absolute;
		border-radius : 50%;
		background    : var( --color-brand-bright );
		box-shadow    : 0 0 12px var( --color-brand-bright );
		opacity       : 0;
	}
	.p-1 { width  : 4px; height : 4px; }
	.p-2 { width  : 6px; height : 6px; }
	.p-3 { width  : 5px; height : 5px; }

	@keyframes float-slow {
		0%, 100% {
			transform : translateY( 0 ) translateX( 0 );
			opacity   : 0.1;
		}
		50% {
			transform : translateY( -25px ) translateX( 15px );
			opacity   : 0.45;
		}
	}
	@keyframes float-medium {
		0%, 100% {
			transform : translateY( 0 ) translateX( 0 );
			opacity   : 0.2;
		}
		50% {
			transform : translateY( -18px ) translateX( -12px );
			opacity   : 0.55;
		}
	}
	.animate-float-1 { animation: float-slow 8s infinite ease-in-out; }
	.animate-float-2 { animation: float-medium 6s infinite ease-in-out; }
	.animate-float-3 { animation: float-slow 10s infinite ease-in-out; animation-delay: 2s; }
	.animate-float-4 { animation: float-medium 7s infinite ease-in-out; animation-delay: 1.5s; }
</style>
