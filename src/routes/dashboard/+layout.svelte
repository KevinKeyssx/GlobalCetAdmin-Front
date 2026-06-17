<script lang="ts">
	import { ArrowUp } from '@lucide/svelte';

	import DashboardSidebar from '$lib/components/shared/DashboardSidebar.svelte';

	let { children } = $props();

	let showScrollButton = $state( false );

	function handleScroll() : void {
		if ( typeof window !== 'undefined' ) {
			showScrollButton = window.scrollY > 300;
		}
	}

	function scrollToTop() : void {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( {
				top		: 0,
				behavior	: 'smooth',
			} );
		}
	}
</script>

<svelte:window onscroll={ handleScroll } />

<!-- ─── Dashboard Layout: Sidebar + Content Area ──────────────────────────────── -->
<div class="relative flex min-h-[calc(100vh-80px)] w-full">
	<!-- ─── Background Lights ────────────────────────────────────────────────── -->
    <div class="pointer-events-none absolute top-44 left-96 h-[400px] w-[400px] rounded-full bg-brand/10 blur-[100px] dark:bg-brand/15"></div>
	<div class="pointer-events-none absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-brand-bright/5 blur-[120px] dark:bg-brand-bright/10"></div>
	<!-- Left Sidebar Navigation Panel -->
	<DashboardSidebar />

	<!-- Main Content Area (Child Pages) -->
	<div class="flex-1 min-w-0 relative md:ml-[260px]">
		{@render children() }
	</div>

	{#if ( showScrollButton )}
		<button
			onclick = { scrollToTop }
			class   = "fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-brand-bright/20 bg-brand text-white shadow-lg transition-all duration-300 scale-100 hover:scale-110 active:scale-95 hover:bg-brand-bright hover:shadow-[0_0_20px_var(--color-brand)] cursor-pointer animate-fade-in"
			title   = "Subir al inicio"
		>
			<ArrowUp class="h-5 w-5" />
		</button>
	{/if}
</div>

<style>
	@keyframes fadeInScale {
		from {
			opacity   : 0;
			transform : scale( 0.8 );
		}
		to {
			opacity   : 1;
			transform : scale( 1 );
		}
	}

	.animate-fade-in {
		animation : fadeInScale 0.2s cubic-bezier( 0.16, 1, 0.3, 1 ) forwards;
	}
</style>
