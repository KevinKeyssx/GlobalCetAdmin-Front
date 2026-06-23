<script lang="ts">
	interface Props {
		value?          : string;
		debouncedValue? : string;
		placeholder?    : string;
		delay?          : number;
	}


	let {
		value          = $bindable( '' ),
		debouncedValue = $bindable( '' ),
		placeholder    = 'Buscar...',
		delay          = 500
	} : Props = $props();

	// Debounce interno usando efectos reactivos de Svelte 5
	$effect( ( ) => {
		const currentVal = value;

		const handler = setTimeout( ( ) => {
			debouncedValue = currentVal;
		}, delay );

		return ( ) => clearTimeout( handler );
	} );
</script>

<div class="flex items-center relative w-full">
	<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.35-4.35" />
	</svg>
	<input
		type="search"
		placeholder={ placeholder }
		bind:value={ value }
		class="w-full rounded-xl h-11 border border-brand/15 bg-input py-2 pl-10 pr-4 text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10 text-xs font-semibold"
	/>
</div>
