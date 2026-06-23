<script lang="ts">
	import { formatCLP } from '$lib/utils/price';
	import InputNumber from './InputNumber.svelte';

	interface Props {
		currentPrice      : number | null;
		currentStock      : number | null;
		minStock          : number | null;
		maxStock          : number | null;
		priceError?       : string;
		currentStockError?: string;
		minStockError?    : string;
		maxStockError?    : string;
		delay?            : string;
	}

	let {
		currentPrice      = $bindable( null ),
		currentStock      = $bindable( null ),
		minStock          = $bindable( null ),
		maxStock          = $bindable( null ),
		priceError        = $bindable( '' ),
		currentStockError = $bindable( '' ),
		minStockError     = $bindable( '' ),
		maxStockError     = $bindable( '' ),
		delay             = '0ms',
	} : Props = $props();

	let displayPrice = $state( '' );

	$effect( () => {
		if ( currentPrice !== null && currentPrice !== undefined ) {
			displayPrice = formatCLP( currentPrice );
		} else {
			displayPrice = '';
		}
	} );

	$effect( () => {
		// Reset errors
		priceError        = '';
		currentStockError = '';
		minStockError     = '';
		maxStockError     = '';

		// Convert to numbers for safe comparison (lexicographical string prevention)
		const priceVal = currentPrice !== null && currentPrice !== undefined ? Number( currentPrice ) : null;
		const stockVal = currentStock !== null && currentStock !== undefined && String( currentStock ) !== '' ? Number( currentStock ) : null;
		const minVal   = minStock !== null && minStock !== undefined && String( minStock ) !== '' ? Number( minStock ) : null;
		const maxVal   = maxStock !== null && maxStock !== undefined && String( maxStock ) !== '' ? Number( maxStock ) : null;

		// 1. Validate price (must be >= 0 if defined)
		if ( priceVal !== null && !isNaN( priceVal ) ) {
			if ( priceVal < 0 ) {
				priceError = 'El precio no puede ser menor a 0.';
			}
		}

		// 2. Validate stock minimums (must be >= 1 if defined)
		if ( stockVal !== null && !isNaN( stockVal ) && stockVal < 1 ) {
			currentStockError = 'El stock debe ser al menos 1.';
		}
		if ( minVal !== null && !isNaN( minVal ) && minVal < 1 ) {
			minStockError = 'El stock mínimo debe ser al menos 1.';
		}
		if ( maxVal !== null && !isNaN( maxVal ) && maxVal < 1 ) {
			maxStockError = 'El stock máximo debe ser al menos 1.';
		}

		// 3. Validate maxStock limit (9999)
		if ( maxVal !== null && !isNaN( maxVal ) && maxVal > 9999 ) {
			maxStockError = 'El stock máximo no puede superar 9999.';
		}

		// 4. Validate minStock <= maxStock
		if ( minVal !== null && maxVal !== null && !isNaN( minVal ) && !isNaN( maxVal ) && minVal > maxVal ) {
			minStockError = 'El stock mínimo no puede superar al máximo.';
		}

		// 5. Validate currentStock between minStock and maxStock
		if ( stockVal !== null && !isNaN( stockVal ) ) {
			if ( minVal !== null && !isNaN( minVal ) && stockVal < minVal ) {
				currentStockError = 'El stock actual no puede ser menor que el mínimo.';
			}
			if ( maxVal !== null && !isNaN( maxVal ) && stockVal > maxVal ) {
				currentStockError = 'El stock actual no puede superar al máximo.';
			}
		}
	} );

	function handlePriceInput( event : Event ) : void {
		const target = event.target as HTMLInputElement;
		const rawDigits = target.value.replace( /\D/g, '' );
		if ( rawDigits === '' ) {
			currentPrice = null;
			displayPrice = '';
		} else {
			const numVal = parseInt( rawDigits, 10 );
			currentPrice = numVal;
			displayPrice = formatCLP( numVal );
		}
	}

	const hasPriceError = $derived( !!priceError );
	const priceInputClass = $derived.by( () => {
		let base = "w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 text-[0.8125rem] text-text outline-none focus:ring-2 focus:ring-brand/15 transition-all";
		if ( hasPriceError ) {
			base = base
				.replace( /border-brand\/\d+/g, 'border-red-500' )
				.replace( /bg-input/g, 'bg-red-500/5' )
				.replace( /focus:ring-brand\/\d+/g, 'focus:ring-red-500/15' );
			if ( !base.includes( 'border-red-500' ) ) {
				base += ' border-red-500';
			}
		}
		return base;
	} );

	const currentStockClass = $derived( currentStockError ? '!border-red-500 !bg-red-500/5' : '' );
	const minStockClass = $derived( minStockError ? '!border-red-500 !bg-red-500/5' : '' );
	const maxStockClass = $derived( maxStockError ? '!border-red-500 !bg-red-500/5' : '' );
</script>

<fieldset
	class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
	style="--delay: { delay }"
>
	<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
		Inventario y Precio
	</legend>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
		<!-- Precio Actual -->
		<div class="flex flex-col gap-1">
			<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="current-price">
				Precio Actual (CLP)
			</label>
			<input
				id="current-price"
				type="text"
				value={ displayPrice }
				oninput={ handlePriceInput }
				placeholder="Ej: $ 15.000"
				class={ priceInputClass }
			/>
			{#if ( priceError )}
				<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ priceError }</p>
			{/if}
		</div>

		<!-- Stock Actual -->
		<div class="flex flex-col gap-1">
			<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="current-stock">
				Stock Actual
			</label>
			<InputNumber
				bind:value={ currentStock }
				min={ 1 }
				max={ 9999 }
				width="w-full text-[14px]"
				class="w-full h-8 { currentStockClass }"
			/>
			{#if ( currentStockError )}
				<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ currentStockError }</p>
			{/if}
		</div>

		<!-- Stock Mínimo -->
		<div class="flex flex-col gap-1">
			<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="min-stock">
				Stock Mínimo
			</label>
			<InputNumber
				bind:value={ minStock }
				min={ 1 }
				max={ 9999 }
				width="w-full text-[14px]"
				class="w-full h-8 { minStockClass }"
			/>
			{#if ( minStockError )}
				<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ minStockError }</p>
			{/if}
		</div>

		<!-- Stock Máximo -->
		<div class="flex flex-col gap-1">
			<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for="max-stock">
				Stock Máximo
			</label>
			<InputNumber
				bind:value={ maxStock }
				min={ 1 }
				max={ 9999 }
				width="w-full text-[14px]"
				class="w-full h-8 { maxStockClass }"
			/>
			{#if ( maxStockError )}
				<p class="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{ maxStockError }</p>
			{/if}
		</div>
	</div>
</fieldset>
