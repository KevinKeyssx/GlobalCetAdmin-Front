<script lang="ts">
	import InputText from './InputText.svelte';
	import TextArea from './TextArea.svelte';

	interface Props {
		name            : string;
		sku             : string;
		nameError?      : string;
		skuError?       : string;
		nameLabel       : string;
		namePlaceholder : string;
		skuPlaceholder  : string;
		idPrefix        : string;
		delay?          : string;
	}

	let {
		name            = $bindable( '' ),
		sku             = $bindable( '' ),
		nameError       = '',
		skuError        = '',
		nameLabel,
		namePlaceholder,
		skuPlaceholder,
		idPrefix,
		delay           = '0ms',
	} : Props = $props();

	const nameId = $derived( idPrefix + '-name' );
	const skuId = $derived( idPrefix + '-sku' );
</script>

<fieldset
	class="fade-in m-0 rounded-2xl border border-brand/10 bg-brand/3 p-3.5 px-4 transition-colors focus-within:border-brand/30 focus-within:bg-brand/5"
	style="--delay: { delay }"
>
	<legend class="block font-display text-[0.6rem] font-black tracking-[0.14em] uppercase text-brand opacity-80">
		Identificación
	</legend>

	<div class="grid grid-cols-1 gap-3">
		<!-- Name -->
		<div class="flex flex-col gap-1">
			<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for={ nameId }>
				{ nameLabel }
			</label>

			<TextArea
				id={ nameId }
				bind:value={ name }
				error={ nameError }
				placeholder={ namePlaceholder }
				class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 text-[0.8125rem] text-text outline-none focus:ring-2 focus:ring-brand/15"
			/>
		</div>

		<!-- SKU -->
		<div class="flex flex-col gap-1">
			<label class="text-[0.65rem] font-bold tracking-wider text-text-muted uppercase" for={ skuId }>
				SKU Identificador
			</label>

			<InputText
				id={ skuId }
				bind:value={ sku }
				error={ skuError }
				placeholder={ skuPlaceholder }
				class="w-full rounded-lg border border-brand/10 bg-input px-3 py-1.5 font-mono text-[0.8125rem] tracking-wide text-text outline-none focus:ring-2 focus:ring-brand/15"
			/>
		</div>
	</div>
</fieldset>
