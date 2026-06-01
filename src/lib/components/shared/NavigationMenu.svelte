<script lang="ts">
	import { NavigationMenu } from 'bits-ui';
	import { fade }           from 'svelte/transition';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface SubMenuItem {
		title       : string;
		href        : string;
		description : string;
		icon?       : string;
	}

    // ─── Antecedentes Dropdown Config ─────────────────────────────────────────────
	const antecedentesItems: Array< SubMenuItem > = [
		{
			title		: 'Fundamentos',
			href		: '/fundamentals',
			description	: 'Ejes fundamentales para la implementación de laboratorios de ciencias.',
			icon		: '🧬',
		},
		{
			title		: 'Código de Ética',
			href		: '/code-ethics',
			description	: 'Nuestros compromisos normativos, equidad de género y sellos corporativos.',
			icon		: '🛡️',
		},
		{
			title		: 'Términos Comerciales',
			href		: '/commercial-terms',
			description	: 'Términos de servicio, cotizaciones y políticas de entrega.',
			icon		: '📄',
		},
	];

	// ─── Nosotros Dropdown Config ─────────────────────────────────────────────────
	const nosotrosItems: Array< SubMenuItem > = [
		{
			title		: 'Misión & Visión',
			href		: '/vision-mission',
			description	: 'Nuestra misión, visión y reseña de trayectoria fundacional.',
			icon		: '🎯',
		},
		{
			title		: 'Infraestructura',
			href		: '/infrastructure',
			description	: 'Conoce las instalaciones y capacidades operativas de GlobalCET.',
			icon		: '🏢',
		},
	];
</script>


<NavigationMenu.Root class="relative z-50">
	<NavigationMenu.List class="flex items-center gap-1.5">

		<!-- 0. Dashboard ( Simple Link ) -->
		<NavigationMenu.Item>
			<NavigationMenu.Link
				href  = "/dashboard"
				id    = "nav-dashboard"
				class = "rounded-xl px-4 py-2.5 text-sm font-bold text-brand transition-all duration-300 hover:bg-brand/10"
			>
				Dashboard
			</NavigationMenu.Link>
		</NavigationMenu.Item>

		<!-- 1. Catálogo ( Simple Link ) -->
		<!-- <NavigationMenu.Item>
			<NavigationMenu.Link
				href  = "/catalog"
				id    = "nav-catalogo"
				class = "rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted transition-all duration-300 hover:bg-brand/10 hover:text-brand"
			>
				Catálogo
			</NavigationMenu.Link>
		</NavigationMenu.Item> -->

		<!-- 2. Nosotros ( Premium Dropdown Menu ) -->
		<!-- <NavigationMenu.Item class="relative">
			<NavigationMenu.Trigger
				id    = "nav-nosotros"
				class = "
					group flex items-center gap-1.5 rounded-xl
					px-4 py-2.5 text-sm font-semibold text-text-muted
					transition-all duration-300
					hover:bg-brand/10 hover:text-brand
					data-[state=open]:bg-brand/10 data-[state=open]:text-brand
					outline-none cursor-pointer
				"
			>
				<span>Nosotros</span>

				<svg
					class          = "h-4 w-4 text-text-muted group-hover:text-brand transition-transform duration-300 group-data-[state=open]:rotate-180"
					viewBox        = "0 0 24 24"
					fill           = "none"
					stroke         = "currentColor"
					stroke-width   = "2.5"
					stroke-linecap = "round"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class=" absolute left-1/2 top-full z-50 mt-3 w-max -translate-x-1/2 ">
				<div
					transition:fade = { { duration : 150 } }
					class           = "nav-dropdown-content"
				>
					<div class="grid grid-cols-1 gap-3.5">
						{#each nosotrosItems as item ( item.title ) }
							<a
								href  = { item.href }
								class = "group flex items-start gap-4 rounded-xl p-3.5 hover:bg-brand/5 dark:hover:bg-brand/10 transition-all duration-200"
							>
								{#if item.icon }
									<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/10 bg-brand/5 text-lg group-hover:border-brand/20 group-hover:bg-brand/15 transition-all duration-200">
										{ item.icon }
									</div>
								{/if}

								<div class="space-y-1">
									<div class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-text group-hover:text-brand transition-colors">
										{ item.title }
										<svg
											class          = "h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand"
											viewBox        = "0 0 24 24"
											fill           = "none"
											stroke         = "currentColor"
											stroke-width   = "3"
											stroke-linecap = "round"
										>
											<line x1="5" y1="12" x2="19" y2="12"></line>
											<polyline points="12 5 19 12 12 19"></polyline>
										</svg>
									</div>

									<p class="text-xs text-text-muted leading-relaxed font-normal">
										{ item.description }
									</p>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item> -->

		<!-- 3. Antecedentes ( Premium Dropdown Menu ) -->
		<!-- <NavigationMenu.Item class="relative">
			<NavigationMenu.Trigger
				id    = "nav-antecedentes"
				class = "
					group flex items-center gap-1.5 rounded-xl
					px-4 py-2.5 text-sm font-semibold text-text-muted
					transition-all duration-300
					hover:bg-brand/10 hover:text-brand
					data-[state=open]:bg-brand/10 data-[state=open]:text-brand
					outline-none cursor-pointer
				"
			>
				<span>Antecedentes</span>

                <svg
					class        = "h-4 w-4 text-text-muted group-hover:text-brand transition-transform duration-300 group-data-[state=open]:rotate-180"
					viewBox      = "0 0 24 24"
					fill         = "none"
					stroke       = "currentColor"
					stroke-width = "2.5"
					stroke-linecap = "round"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class=" absolute left-1/2 top-full z-50 mt-3 w-max -translate-x-1/2 ">
				<div
					transition:fade = { { duration : 150 } }
					class           = "nav-dropdown-content"
				>
					<div class="grid grid-cols-1 gap-3.5">
						{#each antecedentesItems as item ( item.title ) }
							<a
								href  = { item.href }
								class = "group flex items-start gap-4 rounded-xl p-3.5 hover:bg-brand/5 dark:hover:bg-brand/10 transition-all duration-200"
							>
								{#if item.icon }
									<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/10 bg-brand/5 text-lg group-hover:border-brand/20 group-hover:bg-brand/15 transition-all duration-200">
										{ item.icon }
									</div>
								{/if}

								<div class="space-y-1">
									<div class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-text group-hover:text-brand transition-colors">
										{ item.title }
										<svg
											class          = "h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand"
											viewBox        = "0 0 24 24"
											fill           = "none"
											stroke         = "currentColor"
											stroke-width   = "3"
											stroke-linecap = "round"
										>
											<line x1="5" y1="12" x2="19" y2="12"></line>
											<polyline points="12 5 19 12 12 19"></polyline>
										</svg>
									</div>

									<p class="text-xs text-text-muted leading-relaxed font-normal">
										{ item.description }
									</p>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item> -->

	</NavigationMenu.List>
</NavigationMenu.Root>


<style>
	.nav-dropdown-content {
		position         : absolute;
		left             : 50%;
		top              : 100%;
		margin-top       : 0.75rem;
		width            : 480px;
		transform        : translateX( -50% );
		border-radius    : 1rem;
		border           : 1px solid color-mix( in srgb, var( --color-brand ) 15%, transparent );
		background-color : color-mix( in srgb, var( --color-card ) 95%, transparent );
		backdrop-filter  : blur( 24px );
		padding          : 1.25rem;
		box-shadow       : var( --shadow-card-hover );
		animation        : nav-slide-in 0.3s cubic-bezier( 0.16, 1, 0.3, 1 );
	}

	@keyframes nav-slide-in {
		0% {
			opacity   : 0;
			transform : translate( -50%, -8px );
		}
		100% {
			opacity   : 1;
			transform : translate( -50%, 0 );
		}
	}
</style>
