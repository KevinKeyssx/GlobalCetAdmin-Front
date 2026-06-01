<script lang="ts">
	import { onMount }     from 'svelte';
	import toast            from 'svelte-french-toast';

	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { METHOD }                     from '$lib/services/http-codes';
	import { globalLoadingStore }         from '$lib/state/loading';
	import MaterialFormModal              from './components/MaterialFormModal.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface Material {
		id                 : string;
		name               : string;
		slug               : string;
		description?       : string;
		autoclavable?      : boolean;
		maxTemperature?    : number;
		chemicalResistance : {
			acid     : string;
			alkaline : string;
		};
		active             : boolean;
		createdAt          : string;
		updatedAt          : string;
	}

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	let materials       = $state< Material[] >( [] );
	let search          = $state( '' );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingMaterial = $state< Material | null >( null );

	// ─── Filtered Materials ───────────────────────────────────────────────────────
	const filteredMaterials = $derived(
		materials.filter( ( m ) =>
			m.name.toLowerCase().includes( search.toLowerCase() ) ||
			m.slug.toLowerCase().includes( search.toLowerCase() ) ||
			( m.description || '' ).toLowerCase().includes( search.toLowerCase() )
		)
	);

	// ─── Fetch Data from Backend ──────────────────────────────────────────────────
	async function loadMaterials() : Promise<void> {
		$globalLoadingStore = true;
		try {
			const response = await connectRequest< Material[] >( {
				endpoint   : 'products/materials/get-all',
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( 'Error de servidor: No se pudieron cargar los materiales.', {
					style : 'background: #111f18; color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.2); font-family: Outfit;',
				} );
				return;
			}

			materials = response || [];
		} catch ( e ) {
			toast.error( 'Error de red: El servidor de GlobalCET no responde.', {
				style : 'background: #111f18; color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.2); font-family: Outfit;',
			} );
		} finally {
			$globalLoadingStore = false;
		}
	}

	onMount( () => {
		loadMaterials();
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal() : void {
		isEditing       = false;
		editingId       = '';
		editingMaterial = null;
		showModal       = true;
	}

	function openEditModal( item : Material ) : void {
		isEditing       = true;
		editingId       = item.id;
		editingMaterial = item;
		showModal       = true;
	}

	async function deleteMaterial( id : string ) : Promise<void> {
		if ( !confirm( '¿Está seguro de que desea eliminar este material?' ) ) return;

		$globalLoadingStore = true;
		try {
			const response = await connectRequest< any >( {
				endpoint   : `products/materials?id=${ id }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al eliminar: ${ response.message }` );
				return;
			}

			toast.success( 'Material eliminado con éxito.', {
				style : 'background: #111f18; color: #00e676; border: 1px solid rgba(0, 230, 118, 0.2); font-family: Outfit;',
			} );
			loadMaterials();
		} catch ( err ) {
			toast.error( 'Error de red al intentar eliminar.' );
		} finally {
			$globalLoadingStore = false;
		}
	}
</script>

<svelte:head>
	<title>Administrar Materiales - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-xs text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>
					<span>/</span>
					<span>Productos</span>
					<span>/</span>
					<span class="text-brand font-bold">Materiales</span>
				</div>
				<h1 class="font-display text-3xl font-black text-text uppercase tracking-wide">
					Administración de Materiales
				</h1>
				<p class="text-xs text-text-muted">
					Gestione las propiedades mecánicas y térmicas de los materiales de catálogo (vidrio, metales, plásticos).
				</p>
			</div>

			<button
				onclick={ openCreateModal }
				class="
					inline-flex items-center justify-center gap-2 rounded-xl
					bg-brand px-5 py-3 text-xs font-bold uppercase tracking-wider text-surface-dark
					shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright
				"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				Agregar Material
			</button>
		</div>

		<!-- ─── Search Tool ──────────────────────────────────────────────────────── -->
		<div class="flex items-center max-w-md relative">
			<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.35-4.35" />
			</svg>
			<input
				type="search"
				placeholder="Buscar material por nombre, slug o descripción..."
				bind:value={ search }
				class="
					w-full rounded-xl border border-brand/15 bg-input py-2.5 pl-10 pr-4 text-sm text-text
					outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10
				"
			/>
		</div>

		<!-- ─── Table Content ────────────────────────────────────────────────────── -->
		<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card">
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
							<th class="px-6 py-4">Nombre</th>
							<th class="px-6 py-4">Slug</th>
							<th class="px-6 py-4">Autoclavable</th>
							<th class="px-6 py-4">Temp. Máx</th>
							<th class="px-6 py-4">Resist. Química (Ácido / Alcalino)</th>
							<th class="px-6 py-4">Estado</th>
							<th class="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-brand/10 text-xs font-semibold">
						{#each filteredMaterials as item ( item.id ) }
							<tr class="hover:bg-brand/5 transition-colors duration-150">
								<td class="px-6 py-4 font-bold text-text">{ item.name }</td>
								<td class="px-6 py-4 font-mono text-text-muted">{ item.slug }</td>
								<td class="px-6 py-4">
									{#if item.autoclavable }
										<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-bold border border-emerald-500/20">Sí</span>
									{:else}
										<span class="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400 font-bold border border-red-500/20">No</span>
									{/if}
								</td>
								<td class="px-6 py-4 font-mono">{ item.maxTemperature || 0 } °C</td>
								<td class="px-6 py-4 uppercase font-bold text-[10px] text-brand">
									{ item.chemicalResistance?.acid || 'N/A' } / { item.chemicalResistance?.alkaline || 'N/A' }
								</td>
								<td class="px-6 py-4">
									{#if item.active }
										<span class="text-brand font-bold">Activo</span>
									{:else}
										<span class="text-text-muted">Inactivo</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<button
											onclick={ ( ) => openEditModal( item ) }
											class="rounded-lg border border-brand/20 bg-brand/10 px-3 py-1.5 font-bold uppercase tracking-wider text-brand hover:bg-brand hover:text-surface-dark transition-all duration-200"
										>
											Editar
										</button>
										<button
											onclick={ ( ) => deleteMaterial( item.id ) }
											class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
										>
											Eliminar
										</button>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="px-6 py-12 text-center text-text-muted leading-relaxed">
									No se encontraron materiales registrados. Compruebe la conexión con el servidor.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<MaterialFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				initialData={ editingMaterial ? {
					name               : editingMaterial.name,
					slug               : editingMaterial.slug,
					description        : editingMaterial.description || '',
					autoclavable       : editingMaterial.autoclavable || false,
					maxTemperature     : editingMaterial.maxTemperature || 120,
					acidResistance     : editingMaterial.chemicalResistance?.acid || 'excellent',
					alkalineResistance : editingMaterial.chemicalResistance?.alkaline || 'good',
					active             : editingMaterial.active,
				} : null }
				onSave={ () => {
					showModal = false;
					loadMaterials();
				} }
				onCancel={ () => {
					showModal = false;
				} }
			/>
		{/if}
	</div>
</main>
