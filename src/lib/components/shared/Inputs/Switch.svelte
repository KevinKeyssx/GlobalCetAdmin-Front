<script lang="ts">
	interface Props {
		checked?       : boolean;
		id?            : string;
		labelActive?   : string;
		labelInactive? : string;
		showLabelText? : boolean;
		class?         : string;
	}

	let {
		checked       = $bindable( false ),
		id            = `switch-${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
		labelActive   = 'Habilitado',
		labelInactive = 'Deshabilitado',
		showLabelText = true,
		class : className = '',
	} : Props = $props();
</script>

<label
	class = "flex cursor-pointer select-none items-center gap-2.5 { className }"
	for   = { id }
>
	<!-- Track -->
        <!-- Label text -->
        {#if ( showLabelText )}
            <span
                class = "text-[0.72rem] font-bold tracking-wide transition-colors duration-200 { checked ? 'text-brand' : 'text-text-muted' }"
            >
                { checked ? labelActive : labelInactive }
            </span>
        {/if}
	<span
		class = "relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-all duration-200 { checked ? 'bg-brand/30 border-brand' : 'bg-input border-brand/20' }"
	>
		<input
			id           = { id }
			type         = "checkbox"
			bind:checked={ checked }
			class        = "sr-only"
		/>
		<!-- Thumb -->
		<span
			class = "absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full transition-all duration-200 { checked ? 'translate-x-4 bg-brand shadow-[0_0_8px_rgba(0,230,118,0.55)]' : 'bg-text-muted translate-x-0' }"
		></span>
	</span>

</label>
