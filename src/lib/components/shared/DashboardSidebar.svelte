<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';

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
				{ label : 'Catálogo',     href : '/dashboard/products',              icon : '🔬' },
				{ label : 'Materiales',   href : '/dashboard/products/materials',    icon : '⚗️' },
				{ label : 'Categorías',   href : '/dashboard/products/categories',   icon : '🏷️' },
			],
		},
		{
			id       : 'kits',
			label    : 'Kits',
			icon     : '🧬',
			children : [
				{ label : 'Gestión de Kits', href : '/dashboard/kits',              icon : '🧪' },
				{ label : 'Categorías',      href : '/dashboard/kits/categories',   icon : '📂' },
			],
		},
		{
			id       : 'labs',
			label    : 'Laboratorios',
			icon     : '🚛',
			children : [
				{ label : 'Laboratorios Móviles', href : '/dashboard/mobile-labs',              icon : '🏢' },
				{ label : 'Categorías',           href : '/dashboard/mobile-labs/categories',   icon : '📁' },
			],
		},
	];

	// ─── Expanded Sections (Svelte 5 Runes) ───────────────────────────────────────
	let expandedSections = $state< Record<string, boolean> >( {
		products : true,
		kits     : true,
		labs     : true,
	} );

	// ─── Derived: Current Path ────────────────────────────────────────────────────
	const currentPath = $derived( page.url.pathname );

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
</script>

<!-- ─── Sidebar Navigation Panel ──────────────────────────────────────────────── -->
<aside
	id="dashboard-sidebar"
	class="sidebar-panel"
>
	<!-- ─── Header ──────────────────────────────────────────────────────────── -->
	<div class="sidebar-header">
		<a href="/dashboard" class="sidebar-logo-link">
			<div class="sidebar-logo-orb">
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="3" width="7" height="7" rx="1.5" />
					<rect x="14" y="3" width="7" height="7" rx="1.5" />
					<rect x="3" y="14" width="7" height="7" rx="1.5" />
					<rect x="14" y="14" width="7" height="7" rx="1.5" />
				</svg>
			</div>
			<div class="sidebar-logo-text">
				<span class="sidebar-logo-title">Panel Admin</span>
				<span class="sidebar-logo-sub">GlobalCET</span>
			</div>
		</a>
	</div>

	<!-- ─── Divider ─────────────────────────────────────────────────────────── -->
	<div class="sidebar-divider"></div>

	<!-- ─── Navigation Sections ─────────────────────────────────────────────── -->
	<nav class="sidebar-nav" aria-label="Panel de administración">
		{#each sections as section ( section.id )}
			<div class="sidebar-section">
				<!-- Section Toggle -->
				<button
					onclick={ ( ) => toggleSection( section.id ) }
					class="sidebar-section-toggle"
					class:sidebar-section-active={ sectionIsActive( section ) }
					aria-expanded={ expandedSections[ section.id ] }
					aria-controls="sidebar-section-{ section.id }"
				>
					<div class="sidebar-section-left">
						<span class="sidebar-section-icon">{ section.icon }</span>
						<span class="sidebar-section-label">{ section.label }</span>
					</div>

					<svg
						class="sidebar-chevron"
						class:sidebar-chevron-open={ expandedSections[ section.id ] }
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				<!-- Section Children -->
				{#if ( expandedSections[ section.id ] )}
					<div
						id="sidebar-section-{ section.id }"
						class="sidebar-children"
						transition:slide={ { duration : 250 } }
					>
						{#each section.children as child ( child.href )}
							<a
								href={ child.href }
								class="sidebar-child-link"
								class:sidebar-child-active={ isActive( child.href ) }
								aria-current={ isActive( child.href ) ? 'page' : undefined }
							>
								<!-- Active Indicator Bar -->
								{#if ( isActive( child.href ) )}
									<span class="sidebar-active-bar"></span>
								{/if}

								<span class="sidebar-child-icon">{ child.icon }</span>
								<span class="sidebar-child-label">{ child.label }</span>

								<!-- Active Arrow -->
								{#if ( isActive( child.href ) )}
									<svg
										class="sidebar-active-arrow"
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

	<!-- ─── Bottom Divider + Back Link ──────────────────────────────────────── -->
	<div class="sidebar-footer">
		<div class="sidebar-divider"></div>
		<a href="/dashboard" class="sidebar-back-link">
			<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="15 18 9 12 15 6" />
			</svg>
			<span>Volver al Hub</span>
		</a>
	</div>
</aside>

<style>
	/* ─── Sidebar Container ──────────────────────────────────────────────────── */
	.sidebar-panel {
		position         : sticky;
		top              : 0;
		display          : flex;
		flex-direction   : column;
		width            : 260px;
		min-width        : 260px;
		height           : 100vh;
		padding          : 1.25rem 0;
		background-color : var( --color-sidebar );
		border-right     : 1px solid color-mix( in srgb, var( --color-brand ) 12%, transparent );
		box-shadow       : var( --shadow-sidebar );
		overflow-y       : auto;
		animation        : sidebar-slide-in 0.4s cubic-bezier( 0.16, 1, 0.3, 1 );
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

	/* ─── Header ─────────────────────────────────────────────────────────────── */
	.sidebar-header {
		padding : 0 1.25rem 0.75rem;
	}

	.sidebar-logo-link {
		display         : flex;
		align-items     : center;
		gap             : 0.75rem;
		text-decoration : none;
		padding         : 0.5rem 0.625rem;
		border-radius   : 0.75rem;
		transition      : all 0.3s ease;
	}

	.sidebar-logo-link:hover {
		background-color : color-mix( in srgb, var( --color-brand ) 8%, transparent );
	}

	.sidebar-logo-orb {
		display          : flex;
		align-items      : center;
		justify-content  : center;
		width            : 36px;
		height           : 36px;
		border-radius    : 0.75rem;
		background-color : color-mix( in srgb, var( --color-brand ) 12%, transparent );
		color            : var( --color-brand );
		transition       : all 0.3s ease;
	}

	.sidebar-logo-link:hover .sidebar-logo-orb {
		background-color : color-mix( in srgb, var( --color-brand ) 20%, transparent );
		transform        : scale( 1.05 );
	}

	.sidebar-logo-text {
		display        : flex;
		flex-direction : column;
		line-height    : 1.15;
	}

	.sidebar-logo-title {
		font-family    : var( --font-display );
		font-weight    : 800;
		font-size      : 0.8125rem;
		letter-spacing : 0.04em;
		text-transform : uppercase;
		color          : var( --color-text );
	}

	.sidebar-logo-sub {
		font-size   : 0.625rem;
		font-weight : 700;
		color       : var( --color-brand );
		opacity     : 0.8;
	}

	/* ─── Divider ────────────────────────────────────────────────────────────── */
	.sidebar-divider {
		height           : 1px;
		margin           : 0.5rem 1.25rem;
		background-image : linear-gradient(
			to right,
			transparent,
			color-mix( in srgb, var( --color-brand ) 20%, transparent ),
			transparent
		);
	}

	/* ─── Nav ────────────────────────────────────────────────────────────────── */
	.sidebar-nav {
		flex    : 1;
		padding : 0.5rem 0.75rem;
		display : flex;
		flex-direction : column;
		gap     : 0.25rem;
	}

	/* ─── Section ────────────────────────────────────────────────────────────── */
	.sidebar-section {
		display        : flex;
		flex-direction : column;
	}

	.sidebar-section-toggle {
		display          : flex;
		align-items      : center;
		justify-content  : space-between;
		width            : 100%;
		padding          : 0.5rem 0.625rem;
		border           : none;
		border-radius    : 0.625rem;
		background-color : transparent;
		cursor           : pointer;
		transition       : all 0.25s ease;
		outline          : none;
	}

	.sidebar-section-toggle:hover {
		background-color : color-mix( in srgb, var( --color-brand ) 8%, transparent );
	}

	.sidebar-section-active {
		background-color : color-mix( in srgb, var( --color-brand ) 6%, transparent );
	}

	.sidebar-section-left {
		display     : flex;
		align-items : center;
		gap         : 0.5rem;
	}

	.sidebar-section-icon {
		font-size : 1rem;
		width     : 1.5rem;
		text-align : center;
	}

	.sidebar-section-label {
		font-family    : var( --font-display );
		font-size      : 0.6875rem;
		font-weight    : 800;
		text-transform : uppercase;
		letter-spacing : 0.08em;
		color          : var( --color-text-muted );
		transition     : color 0.2s ease;
	}

	.sidebar-section-toggle:hover .sidebar-section-label {
		color : var( --color-text );
	}

	.sidebar-section-active .sidebar-section-label {
		color : var( --color-brand );
	}

	/* ─── Chevron ─────────────────────────────────────────────────────────────── */
	.sidebar-chevron {
		width      : 14px;
		height     : 14px;
		color      : var( --color-text-muted );
		transition : all 0.3s cubic-bezier( 0.4, 0, 0.2, 1 );
	}

	.sidebar-chevron-open {
		transform : rotate( 180deg );
		color     : var( --color-brand );
	}

	/* ─── Children ───────────────────────────────────────────────────────────── */
	.sidebar-children {
		display        : flex;
		flex-direction : column;
		gap            : 2px;
		padding        : 0.25rem 0 0.25rem 0.375rem;
		margin-left    : 1.125rem;
		border-left    : 1px solid color-mix( in srgb, var( --color-brand ) 15%, transparent );
	}

	.sidebar-child-link {
		position         : relative;
		display          : flex;
		align-items      : center;
		gap              : 0.5rem;
		padding          : 0.4375rem 0.625rem;
		border-radius    : 0.5rem;
		text-decoration  : none;
		font-size        : 0.6875rem;
		font-weight      : 600;
		color            : var( --color-text-muted );
		transition       : all 0.2s ease;
	}

	.sidebar-child-link:hover {
		background-color : color-mix( in srgb, var( --color-brand ) 8%, transparent );
		color            : var( --color-text );
		transform        : translateX( 2px );
	}

	.sidebar-child-active {
		background-color : color-mix( in srgb, var( --color-brand ) 12%, transparent ) !important;
		color            : var( --color-brand ) !important;
		font-weight      : 800;
	}

	.sidebar-child-icon {
		font-size : 0.8125rem;
		width     : 1.25rem;
		text-align : center;
	}

	.sidebar-child-label {
		flex : 1;
	}

	/* ─── Active Indicator Bar ────────────────────────────────────────────────── */
	.sidebar-active-bar {
		position         : absolute;
		left             : -0.6875rem;
		top              : 50%;
		transform        : translateY( -50% );
		width            : 3px;
		height           : 60%;
		border-radius    : 99px;
		background-color : var( --color-brand );
		animation        : bar-pulse 2s ease-in-out infinite;
	}

	@keyframes bar-pulse {
		0%, 100% { opacity : 1; }
		50%      { opacity : 0.5; }
	}

	/* ─── Active Arrow ────────────────────────────────────────────────────────── */
	.sidebar-active-arrow {
		width     : 12px;
		height    : 12px;
		color     : var( --color-brand );
		opacity   : 0.7;
		animation : arrow-bounce 1.5s ease-in-out infinite;
	}

	@keyframes arrow-bounce {
		0%, 100% { transform : translateX( 0 ); }
		50%      { transform : translateX( 3px ); }
	}

	/* ─── Footer ─────────────────────────────────────────────────────────────── */
	.sidebar-footer {
		margin-top : auto;
		padding    : 0 0.75rem 0.25rem;
	}

	.sidebar-back-link {
		display          : flex;
		align-items      : center;
		gap              : 0.5rem;
		padding          : 0.5rem 0.625rem;
		margin-top       : 0.5rem;
		border-radius    : 0.625rem;
		text-decoration  : none;
		font-family      : var( --font-display );
		font-size        : 0.6875rem;
		font-weight      : 700;
		letter-spacing   : 0.04em;
		text-transform   : uppercase;
		color            : var( --color-text-muted );
		transition       : all 0.25s ease;
	}

	.sidebar-back-link:hover {
		background-color : color-mix( in srgb, var( --color-brand ) 8%, transparent );
		color            : var( --color-brand );
		transform        : translateX( -2px );
	}

	/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
	.sidebar-panel::-webkit-scrollbar {
		width : 3px;
	}

	.sidebar-panel::-webkit-scrollbar-track {
		background : transparent;
	}

	.sidebar-panel::-webkit-scrollbar-thumb {
		background    : color-mix( in srgb, var( --color-brand ) 20%, transparent );
		border-radius : 99px;
	}
</style>
