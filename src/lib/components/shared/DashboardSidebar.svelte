<script lang="ts">
	import { page }             from '$app/state';
    import { slide, fade, fly } from 'svelte/transition';
	import { cubicOut }         from 'svelte/easing';

    import { LayoutDashboard, Menu, X } from '@lucide/svelte';
	import { resolve }                  from '$app/paths';
	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface NavChild {
		label : string;
		href  : string;
		icon  : string;
	}

	interface NavSection {
		id       : string;
		label    : string;
		icon     : string;
		children : NavChild[];
	}

	// ─── Navigation Map ───────────────────────────────────────────────────────────
	const sections : NavSection[] = [
		{
			id       : 'products',
			label    : 'Productos',
			icon     : '📦',
			children : [
				{ label : 'Catálogo',   href : resolve( '/dashboard/products' ),               icon : '🔬' },
				{ label : 'Materiales', href : resolve( '/dashboard/products/materials' ),     icon : '⚗️' },
				{ label : 'Categorías', href : resolve( '/dashboard/products/categories' ),    icon : '🏷️' },
			],
		},
		{
			id       : 'kits',
			label    : 'Kits',
			icon     : '🧬',
			children : [
				{ label : 'Catálogo',   href : resolve( '/dashboard/kits' ),               icon : '🧪' },
				{ label : 'Categorías', href : resolve( '/dashboard/kits/categories' ),    icon : '📂' },
			],
		},
		{
			id       : 'labs',
			label    : 'Laboratorios',
			icon     : '🚛',
			children : [
				{ label : 'Catálogo',   href : resolve( '/dashboard/mobile-labs' ),            icon : '🏢' },
				{ label : 'Categorías', href : resolve( '/dashboard/mobile-labs/categories' ), icon : '📁' },
			],
		},
	];

	// ─── Expanded Sections (Svelte 5 Runes) ───────────────────────────────────────
	let expandedSections = $state< Record<string, boolean> >( {
		products : true,
		kits     : true,
		labs     : true,
	});

	// ─── Drawer Open State (Svelte 5 Runes) ───────────────────────────────────────
	let isDrawerOpen = $state( false );

	// ─── Derived: Current Path ────────────────────────────────────────────────────
	const currentPath = $derived( page.url.pathname );

	$effect( ( ) => {
		if ( currentPath ) {
			isDrawerOpen = false;
		}
	});

	// ─── Helpers ──────────────────────────────────────────────────────────────────
	function toggleSection( id : string ) : void {
		expandedSections = {
			...expandedSections,
			[ id ] : !expandedSections[ id ],
		};
	}

	function isActive( href : string ) : boolean {
		return currentPath === href;
	}

	function sectionIsActive( section : NavSection ) : boolean {
		return section.children.some( ( child ) => currentPath === child.href );
	}

	function portal( node : HTMLElement ) : { destroy() : void } {
		document.body.appendChild( node );
		return {
			destroy() {
				if ( node.parentNode ) {
					node.parentNode.removeChild( node );
				}
			}
		};
	}
</script>

<!-- ─── Sidebar Navigation Panel ──────────────────────────────────────────────── -->
<aside
	id="dashboard-sidebar"
	class="hidden md:flex md:sticky lg:fixed top-[80px] left-0 z-30 flex-col w-[260px] min-w-[260px] h-[calc(100vh-80px)] py-5 bg-sidebar border-r border-brand/12 shadow-sidebar overflow-y-auto animate-sidebar-slide-in"
>
	{@render sidebarContent( false )}
</aside>

<!-- Floating Menu Button (Mobile only) -->
{#if !isDrawerOpen }
    <button
        use:portal
        type        = "button"
        onclick     = { ( ) => { isDrawerOpen = true; } }
        class       = "fixed top-[90%] left-3 sm:left-6 z-55 md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar border border-brand/15 shadow-[0_4px_12px_color-mix(in_srgb,var(--color-brand)_10%,transparent)] text-brand hover:scale-105 active:scale-95 transition-all cursor-pointer animate-fade-in"
        aria-label  = "Abrir menú"
    >
        <Menu class="h-4.5 w-4.5" />
    </button>
{/if}

<!-- Mobile Drawer Portal / Overlays -->
{#if isDrawerOpen }
	<!-- Backdrop Overlay -->
	<div
		use:portal
		role       = "button"
		tabindex   = "0"
		onclick    = { ( ) => { isDrawerOpen = false; } }
		onkeydown  = { ( e ) => { if ( e.key === 'Escape' ) isDrawerOpen = false; } }
		class      = "fixed inset-0 bg-background/80 backdrop-blur-xs z-40 md:hidden cursor-pointer"
		transition:fade={ { duration : 200 } }
		aria-label = "Cerrar menú"
	></div>

	<!-- Drawer Sidebar Panel -->
	<aside
		use:portal
		id="dashboard-sidebar-drawer"
		class="fixed top-0 left-0 flex flex-col w-[260px] h-screen py-5 bg-sidebar border-r border-brand/12 shadow-sidebar z-50 overflow-y-auto md:hidden"
		transition:fly={ { x : -260, duration : 300, easing : cubicOut } }
	>
		{@render sidebarContent( true )}
	</aside>
{/if}

{#snippet sidebarContent( isDrawer : boolean )}
	<!-- ─── Close Button (Drawer Only) ──────────────────────────────────────── -->
	{#if isDrawer }
		<div class="absolute top-4 right-4 md:hidden">
			<button
				type    = "button"
				onclick = { ( ) => { isDrawerOpen = false; } }
				class   = "flex h-8 w-8 items-center justify-center rounded-lg border border-brand/10 bg-brand/5 text-text-muted transition-colors hover:bg-brand/10 hover:text-brand cursor-pointer"
				aria-label = "Cerrar menú"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/if}

	<!-- ─── Header ──────────────────────────────────────────────────────────── -->
	<div class="px-5 pb-3">
		<a href={ resolve( '/dashboard' ) } class="group flex items-center gap-3 no-underline px-2.5 py-2 rounded-xl transition-all duration-300 hover:bg-brand/8">
			<div class="flex items-center justify-center w-9 h-9 rounded-xl bg-brand/12 text-brand transition-all duration-300 group-hover:scale-105 group-hover:bg-brand/20">
				<LayoutDashboard class="size-5" />
			</div>

            <div class="flex flex-col leading-tight">
				<span class="font-display font-black text-base tracking-wider uppercase text-text">Panel Admin</span>
				<span class="text-[11px] font-bold text-brand/80">GlobalCET</span>
			</div>
		</a>
	</div>

	<!-- ─── Divider ─────────────────────────────────────────────────────────── -->
	<div class="h-px my-2 mx-5 bg-linear-to-r from-transparent via-brand/20 to-transparent"></div>

	<!-- ─── Navigation Sections ─────────────────────────────────────────────── -->
	<nav class="flex-1 px-3 py-2 flex flex-col gap-1" aria-label="Panel de administración">
		{#each sections as section ( section.id )}
			<div class="flex flex-col">
				<!-- Section Toggle -->
				<button
					onclick={ ( ) => toggleSection( section.id ) }
					class="group/toggle flex items-center justify-between w-full px-2.5 py-2 border-none rounded-lg bg-transparent cursor-pointer transition-all duration-250 outline-none hover:bg-brand/8 { sectionIsActive( section ) ? 'bg-brand/6' : '' }"
					aria-expanded={ expandedSections[ section.id ] }
					aria-controls="sidebar-section-{ section.id }"
				>
					<div class="flex items-center gap-2">
						<span class="text-base w-6 text-center">{ section.icon }</span>
						<span class="font-display text-sm font-black uppercase tracking-wider text-text-muted transition-colors duration-200 group-hover/toggle:text-text { sectionIsActive( section ) ? 'text-brand' : '' }">{ section.label }</span>
					</div>

					<svg
						class="w-3.5 h-3.5 text-text-muted transition-all duration-300 ease-in-out { expandedSections[ section.id ] ? 'rotate-180 text-brand' : '' }"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				<!-- Section Children -->
				{#if expandedSections[ section.id ] }
					<div
						id="sidebar-section-{ section.id }"
						class="flex flex-col gap-0.5 pt-1 pb-1 pl-1.5 ml-4.5 border-l border-brand/15"
						transition:slide={ { duration : 250 } }
					>
						{#each section.children as child ( child.href )}
							<a
								href={ child.href }
								class="group/child relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg no-underline text-sm font-semibold text-text-muted transition-all duration-200 hover:bg-brand/8 hover:text-text hover:translate-x-0.5 { isActive( child.href ) ? 'bg-brand/12! text-brand! font-black' : '' }"
								aria-current={ isActive( child.href ) ? 'page' : undefined }
							>
								<!-- Active Indicator Bar -->
								{#if isActive( child.href ) }
									<span class="absolute left-[-11px] top-1/2 -translate-y-1/2 w-0.5 h-3/5 rounded-full bg-brand animate-bar-pulse"></span>
								{/if}

								<span class="text-sm w-5 text-center">{ child.icon }</span>
								<span class="flex-1">{ child.label }</span>

								<!-- Active Arrow -->
								{#if isActive( child.href ) }
									<svg
										class="w-3 h-3 text-brand opacity-70 animate-arrow-bounce"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<polyline points="9 18 15 12 9 6" />
									</svg>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</nav>
{/snippet}

<style>
	.animate-sidebar-slide-in {
		animation : sidebar-slide-in 0.4s cubic-bezier( 0.16, 1, 0.3, 1 );
	}

	@keyframes sidebar-slide-in {
		0% {
			opacity   : 0;
			transform : translateX( -16px );
		}
		100% {
			opacity   : 1;
			transform : translateX( 0 );
		}
	}

	.animate-bar-pulse {
		animation : bar-pulse 2s ease-in-out infinite;
	}

	@keyframes bar-pulse {
		0%, 100% { opacity : 1; }
		50%      { opacity : 0.5; }
	}

	.animate-arrow-bounce {
		animation : arrow-bounce 1.5s ease-in-out infinite;
	}

	@keyframes arrow-bounce {
		0%, 100% { transform : translateX( 0 ); }
		50%      { transform : translateX( 3px ); }
	}

	#dashboard-sidebar::-webkit-scrollbar {
		width : 3px;
	}

	#dashboard-sidebar::-webkit-scrollbar-track {
		background : transparent;
	}

	#dashboard-sidebar::-webkit-scrollbar-thumb {
		background    : color-mix( in srgb, var( --color-brand ) 20%, transparent );
		border-radius : 99px;
	}
</style>
