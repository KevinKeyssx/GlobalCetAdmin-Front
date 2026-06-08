<script lang="ts">
	import { fade }         from 'svelte/transition';
	import { navigating }   from '$app/state';

    import { Moon, Sun } from '@lucide/svelte';

    import { globalLoadingStore } from '$lib/state/loading';


	const isLoading = $derived( !!navigating || $globalLoadingStore );


	interface Props {
		darkMode : boolean;
		onToggle : ( ) => void;
	}


const { darkMode, onToggle }: Props = $props();
</script>

<!-- ─── Header Shell ─────────────────────────────────────────────────────────── -->
<header class="sticky top-0 z-50 w-full border-b border-brand/20 bg-surface/80 backdrop-blur-lg transition-colors duration-300">
	<!-- Infinite Marquee glowing loading bar -->
	{#if ( isLoading ) }
		<div class="loading-bar" transition:fade={ { duration : 250 } }></div>
	{/if}
	<div class="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 justify-between">
		<!-- Logo -->
        <div class="flex gap-5">
            <a href="/" id="header-logo" class="relative shrink-0 w-12 sm:w-24 h-12 group">
                <div class="absolute -top-3 -left-3 sm:left-0 z-50 flex size-18 sm:size-24 items-center justify-center transition-all duration-300 hover:scale-105">
                    <!-- Blur glow underneath the logo image for modern depth -->
                    <div class="absolute inset-4 rounded-full bg-brand/20 blur-md opacity-60"></div>

                    <!-- Transparent Logo image protruding past the header edge -->
                    <img src="/logo/logo.avif" alt="GlobalCET" class="relative z-10 h-full w-full object-contain" />
                </div>

            </a>

            <h1 class="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight">Panel de administración</h1>
        </div>

		<!-- Dark Mode Toggle -->
		<button
			id="dark-mode-toggle"
			onclick={onToggle}
			aria-label="Alternar modo oscuro"
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-all duration-300 hover:bg-brand/25 hover:scale-105"
		>
			{#if darkMode}
				<Sun class="size-3.5" />
			{:else}
                <Moon class="size-3.5" />
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
