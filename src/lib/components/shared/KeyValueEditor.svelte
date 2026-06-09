<script lang="ts">
	import toast from 'svelte-french-toast';
    import { Plus, X } from '@lucide/svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface Entry {
		key : string;
		val : string;
	}

	interface Props {
		value : string; // Bindable JSON string
        id? : string;
	}

	let {
		value = $bindable( '{}' ),
        id = "",
	}: Props = $props();

	// ─── Local State ──────────────────────────────────────────────────────────────
	let entries    = $state< Entry[] >( [] );
	let newKey     = $state( '' );
	let newValue   = $state( '' );
	let isInternal = false; // Flag to prevent infinite sync loops

	// ─── Parse JSON string on load/external change ────────────────────────────────
	$effect( () => {
		if ( isInternal ) {
			isInternal = false;
			return;
		}

		try {
			const parsed = JSON.parse( value || '{}' );
			if ( typeof parsed === 'object' && parsed !== null ) {
				entries = Object.entries( parsed ).map( ( [ k, v ] ) => ( {
					key : k,
					val : String( v ),
				} ) );
			} else {
				entries = [];
			}
		} catch ( e ) {
			entries = [];
		}
	} );

	// ─── Serialize back to JSON string ────────────────────────────────────────────
	function serialize() : void {
		const obj: Record< string, string > = {};

		for ( const entry of entries ) {
			if ( entry.key.trim() ) {
				obj[ entry.key.trim() ] = entry.val;
			}
		}

		isInternal = true;
		value      = JSON.stringify( obj );
	}

	// ─── Add new key-value pair ───────────────────────────────────────────────────
	function addEntry() : void {
		const k = newKey.trim();
		const v = newValue.trim();

		if ( !k ) {
			toast.error( 'La clave no puede estar vacía.' );
			return;
		}

		const lowerK = k.toLowerCase();

		// Validation: check if key already exists (case-insensitive)
		const exists = entries.some( ( e ) => e.key.toLowerCase() === lowerK );
		if ( exists ) {
			toast.error( `La clave "${ k }" ya está agregada.` );
			return;
		}

		entries = [
			...entries,
			{
				key : k,
				val : v,
			},
		];

		newKey   = '';
		newValue = '';
		serialize();
	}

	// ─── Remove key-value pair ────────────────────────────────────────────────────
	function removeEntry( index : number ) : void {
		entries = entries.filter( ( _, idx ) => idx !== index );
		serialize();
	}

	// ─── Edit key-value pair ──────────────────────────────────────────────────────
	function editEntry( entry : Entry, index : number ) : void {
		newKey   = entry.key;
		newValue = entry.val;
		removeEntry( index );
	}
</script>

<div class="space-y-3">
	<!-- Add New Entry Form Row -->
	<div class="grid sm:flex items-center gap-2">
		<input
            id={id}
			type="text"
			bind:value={ newKey }
			placeholder="Clave (ej: Color)"
			class="w-full sm:w-1/3 rounded-xl border border-brand/15 bg-input px-3 py-2 text-text outline-none focus:border-brand focus:bg-card"
			onkeydown={ ( e ) => { if ( e.key === 'Enter' ) { e.preventDefault(); addEntry(); } } }
		/>

        <input
			type="text"
			bind:value={ newValue }
			placeholder="Valor (ej: Verde)"
			class="flex-1 rounded-xl border border-brand/15 bg-input px-3 py-2 text-text outline-none focus:border-brand focus:bg-card"
			onkeydown={ ( e ) => { if ( e.key === 'Enter' ) { e.preventDefault(); addEntry(); } } }
		/>

        <button
			type="button"
			onclick={ addEntry }
			class="flex justify-center items-center gap-2 w-full sm:w-auto rounded-xl border border-brand bg-brand/10 hover:bg-brand hover:text-surface-dark px-2 py-2 transition-colors font-bold uppercase text-xs"
		>
            <Plus class="size-4 sm:hidden block" />
			<span class="sm:hidden">Agregar</span>
		</button>
	</div>

    <!-- Active Specifications as Badges -->
	{#if entries.length > 0}
		<div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
			{#each entries as entry, idx ( entry.key )}
				<div
					role="button"
					tabindex="0"
					class="flex items-center gap-1.5 rounded-full bg-brand/15 border border-brand/20 px-2.5 py-1 text-xs text-brand hover:bg-brand/20 cursor-pointer select-none transition-all duration-200"
					title="Doble clic para editar"
					ondblclick={ ( ) => editEntry( entry, idx ) }
					onkeydown={ ( e ) => { if ( e.key === ' ' || e.key === 'Enter' ) { e.preventDefault(); editEntry( entry, idx ); } } }
				>
					<span class="truncate max-w-48">
                        <span class="font-bold">{ entry.key }</span>: { entry.val }
                    </span>

                    <button
						type        = "button"
						onclick     = { ( e ) => { e.stopPropagation(); removeEntry( idx ); } }
						class       = "hover:text-red-400 transition-colors p-0.5 ml-0.5"
						title       = "Eliminar"
						aria-label  = "Eliminar"
					>
						<X class="size-3" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
