<script lang="ts">
	import { ClipboardCopy } from '@lucide/svelte';
	import toast from 'svelte-french-toast';

	interface PasteButtonProps {
		value    : string;
		disabled : boolean;
	}

	let {
		value    = $bindable( '' ),
		disabled = false,
	} : PasteButtonProps = $props();

	async function handlePaste( event : MouseEvent ) : Promise< void > {
		event.stopPropagation();
		event.preventDefault();

		if ( disabled ) {
			return;
		}

		try {
			const text = await navigator.clipboard.readText();
			if ( text ) {
				value = text;
				toast.success( 'Texto pegado' );
			}
		} catch ( error ) {
			toast.error( 'No se pudo acceder al portapapeles' );
		}
	}
</script>

<button
	type="button"
	onclick={ handlePaste }
	{ disabled }
	class="flex items-center justify-center rounded-lg p-1 text-text-muted/60 hover:text-brand hover:bg-brand/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
	title="Pegar desde el portapapeles"
>
	<ClipboardCopy class="size-4" />
</button>
