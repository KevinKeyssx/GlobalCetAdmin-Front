<script lang="ts">
import { fade, slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface ConfirmationModalProps {
		show         : boolean;
		title        : string;
		message      : string;
		confirmText? : string;
		cancelText?  : string;
		onConfirm    : ( ) => void;
		onCancel     : ( ) => void;
		isPending?   : boolean;
		children?    : Snippet;
		pendingText? : string;
	}

	let {
		show,
		title,
		message,
		confirmText = 'Confirmar',
		cancelText = 'Cancelar',
		pendingText = 'Eliminando...',
		onConfirm,
		onCancel,
		isPending = false,
		children,
	} : ConfirmationModalProps = $props();

	function portal( node : HTMLElement ) {
		document.body.appendChild( node );
		return {
			destroy( ) {
				if ( node.parentNode ) {
					node.parentNode.removeChild( node );
				}
			}
		};
	}
</script>

{#if ( show )}
	<div
		use:portal
		class="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		transition:fade={ { duration : 150 } }
	>
		<div
			class="w-full { children ? 'max-w-lg' : 'max-w-md' } rounded-2xl border border-brand/20 bg-card p-6 shadow-card-hover space-y-6 my-8 text-sm"
			transition:slide={ { duration : 250 } }
		>
			<div class="flex items-center justify-between border-b border-brand/10 pb-4">
				<h3 class="font-display text-lg font-black text-brand uppercase tracking-wider">
					{ title }
				</h3>
			</div>

			<div class="text-text-muted font-medium leading-relaxed">
				{ message }
			</div>

			{#if children}
				{@render children()}
			{/if}

			<div class="flex items-center justify-end gap-3 border-t border-brand/10 pt-4">
				<button
					type="button"
					onclick={ onCancel }
					disabled={ isPending }
					class="rounded-xl border border-brand/20 bg-surface/30 px-5 py-2.5 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-colors disabled:opacity-50"
				>
					{ cancelText }
				</button>
				<button
					type="button"
					onclick={ onConfirm }
					disabled={ isPending }
					class="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
				>
					{ isPending ? pendingText : confirmText }
				</button>
			</div>
		</div>
	</div>
{/if}
