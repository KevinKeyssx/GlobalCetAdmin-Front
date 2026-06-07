<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import Breadcrum, { type BreadcrumbItem } from './Breadcrum.svelte';

	interface Props {
		title        : string;
		description  : string;
		breadcrumb   : BreadcrumbItem[];
		buttonText?  : string;
		onclick?     : ( ) => void;
	}

	let {
		title,
		description,
		breadcrumb,
		buttonText,
		onclick
	} : Props = $props();
</script>

<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6 w-full">
	<div class="space-y-1 w-full md:w-auto">
		<Breadcrum items={ breadcrumb } />

		<h1 class="font-display text-xl md:text-3xl font-black text-text uppercase tracking-wide">
			{ title }
		</h1>

		<p class="text-text-muted">
			{ description }
		</p>
	</div>

	{#if ( buttonText && onclick ) }
		<button
			onclick = { onclick }
			class   = "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright w-full md:w-auto"
		>
			<Plus class="size-4" />

			<span class="hidden sm:inline">
				{ buttonText }
			</span>
		</button>
	{/if}
</header>
