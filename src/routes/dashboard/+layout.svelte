<script lang="ts">
	import DashboardSidebar from '$lib/components/shared/DashboardSidebar.svelte';

	let { children } = $props();
</script>

<!-- ─── Dashboard Layout: Sidebar + Content Area ──────────────────────────────── -->
<div class="dashboard-shell">
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
