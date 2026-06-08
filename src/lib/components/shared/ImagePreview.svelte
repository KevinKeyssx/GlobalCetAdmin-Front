<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut }    from 'svelte/easing';
	import { X }            from '@lucide/svelte';

	interface ImagePreviewProps {
		show    : boolean;
		src     : string;
		alt     : string;
		name    : string;
		order   : number;
		isVideo : boolean;
		onClose : () => void;
	}

	let {
		show = $bindable( false ),
		src,
		alt,
		name,
		order,
		isVideo = false,
		onClose,
	} : ImagePreviewProps = $props();

	function portal( node : HTMLElement ) {
		document.body.appendChild( node );
		return {
			destroy() {
				if ( node.parentNode ) {
					node.parentNode.removeChild( node );
				}
			}
		};
	}

	function handleKeyDown( event : KeyboardEvent ) : void {
		if ( show && event.key === 'Escape' ) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={ handleKeyDown } />

{#if show }
	<div
		use:portal
		role       = "dialog"
		aria-modal = "true"
		class      = "fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md"
		transition:fade={ { duration : 200 } }
	>
		<!-- Clickable Backdrop -->
		<div
			role       = "button"
			tabindex   = "0"
			class      = "absolute inset-0 cursor-zoom-out"
			onclick    = { onClose }
			onkeydown  = { ( e ) => { if ( e.key === 'Escape' ) onClose(); } }
			aria-label = "Cerrar vista previa"
		></div>

		<!-- Close Button -->
		<button
			type       = "button"
			onclick    = { onClose }
			class      = "absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
			aria-label = "Cerrar vista previa"
		>
			<X class="h-5 w-5" />
		</button>

		<!-- Content Container -->
		<div
			class      = "relative max-w-2xl max-h-[90vh] mx-4 flex flex-col items-center gap-4 z-10 select-none"
			transition:scale={ { duration : 300, start : 0.95, easing : cubicOut } }
		>
			{#if isVideo }
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src      = { src }
					class    = "max-w-full max-h-[70vh] rounded-xl border border-white/10 shadow-2xl object-contain"
					controls
					autoplay
				></video>
			{:else}
				<img
					src   = { src }
					alt   = { alt }
					class = "max-w-full max-h-[70vh] rounded-xl border border-white/10 shadow-2xl object-contain"
				/>
			{/if}

			<!-- Info Panel -->
			<div class="w-full flex flex-col gap-1 text-center text-white/90 bg-black/40 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/5 shadow-lg">
				{#if name }
					<p class="text-sm font-semibold truncate max-w-full">{ name }</p>
				{/if}
				<div class="flex items-center justify-center gap-4 text-[11px] text-white/60 font-medium">
					{#if alt }
						<span>Alt: <span class="text-white/80">{ alt }</span></span>
					{/if}
					<span>Orden: <span class="text-brand font-bold">{ order }</span></span>
				</div>
			</div>
		</div>
	</div>
{/if}
