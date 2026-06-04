<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { Snippet }  from 'svelte';

	// ─── Props ────────────────────────────────────────────────────────────────────
	interface DashboardModalProps {
		show     : boolean;
		title    : string;
		onClose  : () => void;
		body     : Snippet;
		maxWidth?: string;
	}

	let {
		show,
		title,
		onClose,
		body,
		maxWidth = 'max-w-lg',
	} : DashboardModalProps = $props();
</script>

{#if ( show )}
	<!-- ─── Modal Backdrop ─────────────────────────────────────────────────────── -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto"
		transition:fade={ { duration : 150 } }
	>
		<div
			class="w-full { maxWidth } rounded-2xl border border-brand/20 bg-card p-6 shadow-card-hover space-y-6 my-8 text-sm"
			transition:slide={ { duration : 250 } }
		>
			<!-- ─── Header ──────────────────────────────────────────────────────── -->
			<div class="flex items-center justify-between border-b border-brand/10 pb-4">
				<h3 class="font-display text-xl font-black text-brand uppercase tracking-wider">
					{ title }
				</h3>

				<button
					onclick={ onClose }
					class="h-8 w-8 flex items-center justify-center rounded-lg border border-brand/15 bg-input text-text-muted hover:text-brand transition-colors"
					aria-label="Cerrar modal"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- ─── Body (Snippet Slot) ────────────────────────────────────────── -->
			{@render body()}
		</div>
	</div>
{/if}
