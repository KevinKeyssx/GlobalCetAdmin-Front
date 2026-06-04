<script lang="ts">
	import DashboardSidebar from '$lib/components/shared/DashboardSidebar.svelte';

	let { children } = $props();
</script>

<!-- ─── Dashboard Layout: Sidebar + Content Area ──────────────────────────────── -->
<div class="dashboard-shell">
	<!-- ─── Background Lights ────────────────────────────────────────────────── -->
    <div class="pointer-events-none absolute top-44 left-96 h-[400px] w-[400px] rounded-full bg-brand/10 blur-[100px] dark:bg-brand/15"></div>
	<div class="pointer-events-none absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-brand-bright/5 blur-[120px] dark:bg-brand-bright/10"></div>
	<!-- Left Sidebar Navigation Panel -->
	<DashboardSidebar />

	<!-- Main Content Area (Child Pages) -->
	<div class="dashboard-content">
		{@render children()}
	</div>
</div>

<style>
	.dashboard-shell {
		display    : flex;
		min-height : calc( 100vh - 80px );
		width      : 100%;
	}

	.dashboard-content {
		flex       : 1;
		min-width  : 0;
		overflow-x : hidden;
	}
</style>
