<script lang="ts">
	import { onMount }     from 'svelte';
	import toast            from 'svelte-french-toast';

	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { METHOD }                     from '$lib/services/http-codes';
	import { globalLoadingStore }         from '$lib/state/loading';
	import LabCategoryFormModal           from './components/LabCategoryFormModal.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface LabCategory {
		id   : string;
		name : string;
	}

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	let categories      = $state< LabCategory[] >( [] );
	let search          = $state( '' );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingCategory = $state< LabCategory | null >( null );

	// ─── Filtered Categories ──────────────────────────────────────────────────────
	const filteredCategories = $derived(
		categories.filter( ( c ) => c.name.toLowerCase().includes( search.toLowerCase() ) )
	);

	// ─── Fetch Categories ─────────────────────────────────────────────────────────
	async function loadCategories() : Promise<void> {
		$globalLoadingStore = true;
		try {
			const response = await connectRequest< LabCategory[] >( {
				endpoint   : 'labs/categories/get-all',
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( 'Error de servidor: No se pudieron cargar las categorías de laboratorios.' );
				return;
			}

			categories = response || [];
		} catch ( e ) {
			toast.error( 'Error de red al conectar con el servidor.' );
		} finally {
			$globalLoadingStore = false;
		}
	}

	onMount( () => {
		loadCategories();
	} );

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function openCreateModal() : void {
		isEditing       = false;
		editingId       = '';
		editingCategory = null;
		showModal       = true;
	}

	function openEditModal( item : LabCategory ) : void {
		isEditing       = true;
		editingId       = item.id;
		editingCategory = item;
		showModal       = true;
	}

	async function deleteCategory( id : string ) : Promise<void> {
		if ( !confirm( '¿Está seguro de que desea eliminar esta categoría de laboratorios móviles?' ) ) return;

		$globalLoadingStore = true;
		try {
			const response = await connectRequest< any >( {
				endpoint   : `labs/categories?id=${ id }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al eliminar: ${ response.message }` );
				return;
			}

			toast.success( 'Categoría de laboratorios eliminada con éxito.', {
				style : 'background: #111f18; color: #00e676; border: 1px solid rgba(0, 230, 118, 0.2); font-family: Outfit;',
			} );
			loadCategories();
		} catch ( err ) {
			toast.error( 'Error de red al intentar eliminar.' );
		} finally {
			$globalLoadingStore = false;
		}
	}
</script>

<svelte:head>
	<title>Categorías de Laboratorios - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-5xl space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-xs text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>
					<span>/</span>
					<span>Laboratorios Móviles</span>
					<span>/</span>
					<span class="text-brand font-bold">Categorías</span>
				</div>
				<h1 class="font-display text-3xl font-black text-text uppercase tracking-wide">
					Categorías de Laboratorios
				</h1>
				<p class="text-xs text-text-muted">
					Gestione las áreas científicas e infraestructuras de sus carros y laboratorios móviles.
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
				Agregar Categoría
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
				placeholder="Buscar categoría de laboratorios..."
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
							<th class="px-6 py-4">Nombre de la Categoría</th>
							<th class="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-brand/10 text-xs font-semibold">
						{#each filteredCategories as item ( item.id ) }
							<tr class="hover:bg-brand/5 transition-colors duration-150">
								<td class="px-6 py-4 font-bold text-text">{ item.name }</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<button
											onclick={ ( ) => openEditModal( item ) }
											class="rounded-lg border border-brand/20 bg-brand/10 px-3 py-1.5 font-bold uppercase tracking-wider text-brand hover:bg-brand hover:text-surface-dark transition-all duration-200"
										>
											Editar
										</button>
										<button
											onclick={ ( ) => deleteCategory( item.id ) }
											class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
										>
											Eliminar
										</button>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="2" class="px-6 py-12 text-center text-text-muted leading-relaxed">
									No se encontraron categorías de laboratorios móviles registradas.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<LabCategoryFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				initialData={ editingCategory }
				onSave={ () => {
					showModal = false;
					loadCategories();
				} }
				onCancel={ () => {
					showModal = false;
				} }
			/>
		{/if}
	</div>
</main>
