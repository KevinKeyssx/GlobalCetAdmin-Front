<script lang="ts">
	import PasteButton from './PasteButton.svelte';

	interface TextAreaProps {
		value        : string;
		error?       : string;
		placeholder? : string;
		id?          : string;
		class?       : string;
		disabled?    : boolean;
		rows?        : number;
	}

	let {
		value               = $bindable( '' ),
		error               = '',
		placeholder         = '',
		id                  = '',
		class : customClass = 'w-full rounded-xl border border-brand/15 bg-input px-4 py-2.5 text-text outline-none focus:border-brand focus:bg-card resize-y',
		disabled            = false,
		rows                = 3,
	} : TextAreaProps = $props();

	const hasError = $derived( !!error && !value.trim() );

	// Dynamically replace brand/normal classes with red classes when there is an error
	const finalClass = $derived.by( () => {
		let base = customClass;
		if ( hasError ) {
			// Replace standard Tailwind classes with error classes
			base = base
				.replace( /border-brand\/\d+/g, 'border-red-500' )
				.replace( /bg-input/g, 'bg-red-500/5' )
				.replace( /focus:border-brand/g, 'focus:border-red-500' )
				.replace( /focus:bg-card/g, '' )
				.replace( /focus:ring-brand\/\d+/g, 'focus:ring-red-500/15' );

			if ( !base.includes( 'border-red-500' ) ) {
				base += ' border-red-500';
			}
			if ( !base.includes( 'bg-red-500/5' ) ) {
				base += ' bg-red-500/5';
			}
			if ( !base.includes( 'focus:border-red-500' ) ) {
				base += ' focus:border-red-500';
			}
		}
		return base;
	} );
</script>

<div class="flex flex-col gap-1 w-full">
	<div class="relative w-full">
		<textarea
			{ id }
			{ rows }
			bind:value={ value }
			{ placeholder }
			{ disabled }
			class="transition-all placeholder:text-text-muted/50 pr-10 { finalClass }"
		></textarea>
		<div class="absolute right-3 top-3">
			<PasteButton bind:value={ value } { disabled } />
		</div>
	</div>
	{#if ( hasError )}
		<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ error }</p>
	{/if}
</div>
