<script lang="ts">
	import { fade }               from 'svelte/transition';
	import { navigating }         from '$app/state';
	import { globalLoadingStore } from '$lib/state/loading';

	const isLoading = $derived( !!navigating || $globalLoadingStore );

	interface Props {
		search   : string;
		darkMode : boolean;
		onSearch : ( value : string ) => void;
		onToggle : ( ) => void;
	}

	const { search, darkMode, onSearch, onToggle }: Props = $props();

	// let localSearch = $state( '' );

    // let timeoutId: number;


	// Keep localSearch in sync if search prop changes from parent (e.g. clearAll)
	// $effect(() => {
	// 	localSearch = search;
	// });


	// function handleInput( value : string ): void {
	// 	localSearch = value;

    //     clearTimeout( timeoutId );

    //     timeoutId = setTimeout( ( ) => {
	// 		onSearch( value );
	// 	}, 300 );
	// }


</script>

<!-- ─── Header Shell ─────────────────────────────────────────────────────────── -->
<header class="sticky top-0 z-50 w-full border-b border-brand/20 bg-surface/80 backdrop-blur-lg transition-colors duration-300">
	<!-- Infinite Marquee glowing loading bar -->
	{#if ( isLoading ) }
		<div class="loading-bar" transition:fade={ { duration : 250 } }></div>
	{/if}
	<div class="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">

		<!-- Logo -->
		<a href="/" id="header-logo" class="relative shrink-0 w-24 h-12 group">
			<div class="absolute -top-3 left-0 z-50 flex size-24 items-center justify-center transition-all duration-300 hover:scale-105">
				<!-- Blur glow underneath the logo image for modern depth -->
				<div class="absolute inset-4 rounded-full bg-brand/20 blur-md opacity-60"></div>

				<!-- Transparent Logo image protruding past the header edge -->
				<img src="/logo/logo.avif" alt="GlobalCET" class="relative z-10 h-full w-full object-contain" />
			</div>

		</a>
        <h1 class="text-2xl md:text-4xl font-extrabold tracking-tight">Panel de administración</h1>

		<!-- Search Bar -->
		<!-- <div class="relative flex-1 max-w-xl transition-all duration-500 ease-out focus-within:max-w-2xl focus-within:scale-[ 1.015 ]">
			<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted transition-all duration-500 ease-out peer-focus:text-brand peer-focus:scale-110 peer-focus:rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/>
				<path d="m21 21-4.35-4.35"/>
			</svg>

            <input
				id          = "header-search"
				type        = "search"
				placeholder = "Buscar productos, reactivos, equipos..."
				value       = { localSearch }
				oninput     = { ( e ) => handleInput( ( e.target as HTMLInputElement ).value ) }
				class="peer w-full rounded-xl border border-brand/25 bg-input py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-muted outline-none ring-0 transition-all duration-500 ease-out focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15 focus:shadow-[ 0_0_30px_rgba( 5,150,105,0.15 ) ]"
			/>
		</div> -->

		<!-- Nav links -->
		<!-- <nav class="hidden items-center gap-1.5 md:flex">
			<NavigationMenu />
		</nav> -->

		<!-- Dark Mode Toggle -->
		<button
			id="dark-mode-toggle"
			onclick={onToggle}
			aria-label="Alternar modo oscuro"
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-all duration-300 hover:bg-brand/25 hover:scale-105"
		>
			{#if darkMode}
				<!-- Sun icon -->
				<svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="5"/>
					<line x1="12" y1="1" x2="12" y2="3"/>
					<line x1="12" y1="21" x2="12" y2="23"/>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
					<line x1="1" y1="12" x2="3" y2="12"/>
					<line x1="21" y1="12" x2="23" y2="12"/>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
				</svg>
			{:else}
				<!-- Moon icon -->
				<svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
				</svg>
			{/if}
		</button>

	</div>
</header>

<style>
	.loading-bar {
		position         : absolute;
		bottom           : -1px;
		left             : 0;
		right            : 0;
		height           : 2px;
		background       : linear-gradient( to right, var( --color-brand ), var( --color-brand-bright ), #00e676, var( --color-brand ) );
		background-size  : 200% 100%;
		animation        : loading-marquee 1.5s linear infinite;
		box-shadow       : 0 1px 8px color-mix( in srgb, var( --color-brand ) 50%, transparent );
		z-index          : 50;
	}

	@keyframes loading-marquee {
		0% {
			background-position : 200% 0;
		}
		100% {
			background-position : -200% 0;
		}
	}
</style>
