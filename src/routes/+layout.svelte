<script lang="ts">
	import './layout.css';
	import { dev, browser } from '$app/environment';

	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster }             from 'svelte-french-toast';

    import Header   from '$lib/components/home/Header.svelte';
    import Footer   from '$lib/components/home/Footer.svelte';

	// ─── Dark Mode State ──────────────────────────────────────────────────────────
	const initialDark = browser
        ? ( localStorage.getItem( 'theme' ) === 'dark' || ( !localStorage.getItem( 'theme' ) && window.matchMedia( '(prefers-color-scheme: dark)' ).matches ))
        : false;

	// ─── Props ────────────────────────────────────────────────────────────────────
	let { data, children } = $props();
    let darkMode = $state( initialDark );

	// ─── Effect: sync dark class and localStorage ─────────────────────────────────
	$effect( () => {
		if ( darkMode ) {
			document.documentElement.classList.add( 'dark' );
			localStorage.setItem( 'theme', 'dark' );
		} else {
			document.documentElement.classList.remove( 'dark' );
			localStorage.setItem( 'theme', 'light' );
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.avif" type="image/avif" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
	<script>
		( function() {
			const theme = localStorage.getItem( 'theme' ) || ( window.matchMedia( '(prefers-color-scheme: dark)' ).matches ? 'dark' : 'light' );
			if ( theme === 'dark' ) {
				document.documentElement.classList.add( 'dark' );
			} else {
				document.documentElement.classList.remove( 'dark' );
			}
		} )();
	</script>
</svelte:head>

<QueryClientProvider client={ data.queryClient }>
	<Toaster
		position="bottom-right"
		toastOptions={ {
			style   : darkMode ? 'background: #111f18; color: #e8f5e9; border: 1px solid rgba(0, 230, 118, 0.2); font-family: Outfit;' : '',
			success : {
				style : darkMode ? 'background: #111f18; color: #00e676; border: 1px solid rgba(0, 230, 118, 0.35); font-family: Outfit;' : '',
			},
			error   : {
				style : darkMode ? 'background: #1c1012; color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.35); font-family: Outfit;' : '',
			},
		} as any }
	/>
	<!-- ─── App Shell ─────────────────────────────────────────────────────────────── -->
	<main class="min-h-screen bg-surface text-text transition-colors duration-300 font-sans">
		<Header
			{ darkMode }
			onToggle={ () => { darkMode = !darkMode; } }
		/>

		{@render children()}

		<Footer />
	</main>

	{#if dev }
		<SvelteQueryDevtools initialIsOpen={ false } />
	{/if}
</QueryClientProvider>
