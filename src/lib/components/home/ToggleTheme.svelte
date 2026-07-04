<script lang="ts">
	import { Sun, Moon } from '@lucide/svelte';


	interface Props {
		darkMode : boolean;
		onToggle : ( ) => void;
		variant? : 'header' | 'popover';
	}


	const { darkMode, onToggle, variant = 'header' } : Props = $props();
</script>

{#if ( variant === 'header' )}
	<button
		id          = "dark-mode-toggle"
		onclick     = { onToggle }
		aria-label  = "Alternar modo oscuro"
		class       = "hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-all duration-300 hover:bg-brand/25 hover:scale-105 cursor-pointer"
	>
		{#if ( darkMode )}
			<Sun class="size-3.5" />
		{:else}
			<Moon class="size-3.5" />
		{/if}
	</button>
{:else}
	<button
		onclick     = { onToggle }
		class       = "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-brand/20 bg-brand/10 text-brand hover:bg-brand/25 hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-sm animate-fade-in"
	>
		<span>Tema: { darkMode ? 'Oscuro' : 'Claro' }</span>
		{#if ( darkMode )}
			<Sun class="size-3.5" />
		{:else}
			<Moon class="size-3.5" />
		{/if}
	</button>
{/if}
