<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?	: Snippet;
		class?		: string;
	}

	let {
		children,
		class: customClass = 'max-w-6xl space-y-8'
	} : Props = $props();
</script>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-6 lg:py-8">
	<div class="mx-auto { customClass }">
		{#if children}
			{@render children()}
		{/if}
	</div>
</main>
