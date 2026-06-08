<script lang="ts">
	import { Minus, Plus } from '@lucide/svelte';
	import toast           from 'svelte-french-toast';

	interface InputNumberProps {
		value	: number;
		min?	: number;
		max?	: number;
		step?	: number;
        width? : string;
	}

	let {
		value = $bindable( 1 ),
		min   = 1,
		max,
		step  = 1,
        width = 'w-7'
	} : InputNumberProps = $props();

	function decrease() : void {
		const next = ( Number( value ) || min ) - step;
		if ( next >= min ) {
			value = next;
		} else {
			toast.error( `El valor mínimo permitido es ${ min }.` );
			value = min;
		}
	}

	function increase() : void {
		const next = ( Number( value ) || min ) + step;
		if ( max === undefined || next <= max ) {
			value = next;
		} else {
			toast.error( `El valor máximo permitido es ${ max }.` );
			value = max;
		}
	}

	function handleChange( event : Event ) : void {
		const input = event.target as HTMLInputElement;

        let numVal = Number( input.value );

		if ( isNaN( numVal )) {
			numVal = min;
		}

		if ( numVal < min ) {
			toast.error( `El valor mínimo permitido es ${ min }.` );
			value = min;
			input.value = String( min );
		} else if ( max !== undefined && numVal > max ) {
			toast.error( `El valor máximo permitido es ${ max }.` );
			value = max;
			input.value = String( max );
		} else {
			value = numVal;
		}
	}
</script>

<div class="flex items-stretch rounded-md border border-brand/15 bg-card overflow-hidden">
	<button
		type       = "button"
		onclick    = { decrease }
		disabled   = { value <= min }
		aria-label = "Disminuir cantidad"
		class      = "flex items-center justify-center px-2 text-text-muted transition-colors hover:bg-brand/10 hover:text-brand cursor-pointer select-none disabled:opacity-30 disabled:pointer-events-none"
	>
		<Minus class="h-3 w-3" />
	</button>
	<input
		type     = "number"
		{ min }
		{ max }
		value    = { value }
		onchange = { handleChange }
		class    = "{width} border-x border-brand/10 bg-transparent py-1.5 text-center text-[11px] font-bold text-text focus:outline-none"
	/>
	<button
		type       = "button"
		onclick    = { increase }
		disabled   = { max !== undefined && value >= max }
		aria-label = "Aumentar cantidad"
		class      = "flex items-center justify-center px-2 text-text-muted transition-colors hover:bg-brand/10 hover:text-brand cursor-pointer select-none disabled:opacity-30 disabled:pointer-events-none"
	>
		<Plus class="h-3 w-3" />
	</button>
</div>

<style>
	input[ type='number' ]::-webkit-outer-spin-button,
	input[ type='number' ]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[ type='number' ] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
