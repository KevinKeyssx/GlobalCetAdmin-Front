<script lang="ts">
	import { ChevronDown, Check } from '@lucide/svelte';

	interface Option {
		id   : string;
		name : string;
	}

	interface Props {
		options      : Option[];
		value        : string;
		placeholder? : string;
		label?       : string;
		disabled?    : boolean;
		placement?   : 'top' | 'bottom';
	}

	let {
		options     = [],
		value       = $bindable( '' ),
		placeholder = 'Seleccionar...',
		label,
		disabled    = false,
		placement   = 'bottom',
	} : Props = $props();

	// ─── Reactive States ──────────────────────────────────────────────────────────
	let isOpen    = $state( false );
	let container = $state<HTMLElement | null>( null );

	// ─── Derived: Selected Option Name ───────────────────────────────────────────
	const selectedItem = $derived.by( () : Option | null => {
		return options.find( ( opt : Option ) : boolean => opt.id === value ) || null;
	} );

	// ─── Actions ──────────────────────────────────────────────────────────────────
	function selectOption( id : string ) : void {
		value = id;
		isOpen = false;
	}

	function handleOutsideClick( event : MouseEvent ) : void {
		if ( isOpen && container && !container.contains( event.target as Node ) ) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={ handleOutsideClick } />

<div
	bind:this={ container }
	class="relative w-full text-left select-none text-xs font-semibold { isOpen ? 'z-50' : 'z-0' }"
>
	<!-- Trigger -->
	<button
		type     = "button"
		onclick  = { ( ) : void => { isOpen = !isOpen; } }
		disabled = { disabled }
		class    = "flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-brand/20 dark:border-brand/10 bg-surface/40 px-3 py-1.5 text-text outline-none transition-all duration-200 { disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:bg-surface/60' } { isOpen ? 'ring-2 ring-brand border-brand/40' : '' }"
	>
		<span class="truncate text-left text-text-muted">
			{ label || ( selectedItem ? selectedItem.name : placeholder ) }
		</span>
		<ChevronDown class="size-3 text-text-muted transition-transform duration-200 { isOpen ? 'rotate-180 text-brand' : '' }" />
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute z-55 min-w-full w-max max-h-60 overflow-y-auto rounded-lg border border-brand/10 bg-card/95 p-1 shadow-lg backdrop-blur-md { placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1' } right-0"
		>
			<div class="flex flex-col gap-0.5">
				{#each options as opt}
					{@const isSelected = opt.id === value}
					<button
						type="button"
						onclick={ () : void => { selectOption( opt.id ); } }
						class="flex w-full items-center justify-between gap-4 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer { isSelected ? 'bg-brand/15 text-brand font-bold' : 'text-text-muted hover:bg-brand/10 hover:text-text' }"
					>
						<span class="truncate">{ opt.name }</span>
						{#if isSelected}
							<Check class="size-3.5 shrink-0 text-brand" />
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
