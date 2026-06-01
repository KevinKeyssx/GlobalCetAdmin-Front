<script lang="ts">
	import './layout.css';
	import { dev, browser } from '$app/environment';
	import { page }         from '$app/state';
	import { goto }         from '$app/navigation';

	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster }             from 'svelte-french-toast';

    import Header           from '$lib/components/home/Header.svelte';
    import Footer           from '$lib/components/home/Footer.svelte';
	import { searchStore }  from '$lib/state/search';

	// ─── Dark Mode State ──────────────────────────────────────────────────────────
	const initialDark = browser ? ( localStorage.getItem( 'theme' ) === 'dark' || ( !localStorage.getItem( 'theme' ) && window.matchMedia( '(prefers-color-scheme: dark)' ).matches ) ) : false;

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


	function handleSearch( value: string ): void {
		$searchStore = value;

        if ( value && page.url.pathname !== '/catalog' ) {
			goto( '/catalog' );
		}
	}
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
	<Toaster />
	<!-- ─── App Shell ─────────────────────────────────────────────────────────────── -->
	<main class="min-h-screen bg-surface text-text transition-colors duration-300 font-sans">
		<Header
			search={ $searchStore }
			{ darkMode }
			onSearch={ handleSearch }
			onToggle={ () => { darkMode = !darkMode; } }
		/>

		{@render children()}

		<Footer />
	</main>

	{#if dev }
		<SvelteQueryDevtools initialIsOpen={ false } />
	{/if}
</QueryClientProvider>
