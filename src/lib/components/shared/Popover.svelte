<script lang="ts">
	import { Popover as BitsPopover } from 'bits-ui';
	import { fade }                    from 'svelte/transition';
	import type { Snippet }            from 'svelte';

	interface Props {
		open?         : boolean;
		trigger       : Snippet< [ { props : Record< string, any > } ] >;
		content       : Snippet;
		side?         : 'top' | 'right' | 'bottom' | 'left';
		align?        : 'start' | 'center' | 'end';
		sideOffset?   : number;
		classContent? : string;
	}

	let {
		open         = $bindable( false ),
		trigger,
		content,
		side         = 'bottom',
		align        = 'center',
		sideOffset   = 8,
		classContent = ''
	} : Props = $props();
</script>

<BitsPopover.Root bind:open={ open }>
	<BitsPopover.Trigger>
		{#snippet child( { props } )}
			{@render trigger( { props } )}
		{/snippet}
	</BitsPopover.Trigger>
	<BitsPopover.Portal>
		<BitsPopover.Content
			{ side }
			{ align }
			{ sideOffset }
		>
			{#snippet child( { wrapperProps, props } )}
				<div { ...wrapperProps }>
					<div
						{ ...props }
						transition:fade={ { duration : 150 } }
						class="
							z-100 rounded-3xl border border-brand/20 bg-card p-5 shadow-2xl
							focus:outline-none select-none text-xs font-semibold text-text
							{ classContent }
						"
					>
						{@render content()}
					</div>
				</div>
			{/snippet}
		</BitsPopover.Content>
	</BitsPopover.Portal>
</BitsPopover.Root>
