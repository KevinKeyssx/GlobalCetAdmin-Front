<script lang="ts">
	import { onMount }     from 'svelte';
	import toast            from 'svelte-french-toast';

	import connectRequest, { isApiError } from '$lib/services/fetch.service';
	import { METHOD }                     from '$lib/services/http-codes';
	import { globalLoadingStore }         from '$lib/state/loading';
	import CategoryFormModal              from './components/CategoryFormModal.svelte';
	import TableActions                   from '$lib/components/shared/TableActions.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface Category {
		id            : string;
		name          : string;
		subcategories : Subcategory[];
	}

	interface Subcategory {
		id       : string;
		name     : string;
		category : {
			id   : string;
			name : string;
		};
	}

	// ─── Reactive State (Svelte 5 Runes) ──────────────────────────────────────────
	let activeTab       = $state( 'categories' ); // 'categories' | 'subcategories'
	let categories      = $state< Category[] >( [] );
	let search          = $state( '' );
	let showModal       = $state( false );
	let isEditing       = $state( false );
	let editingId       = $state( '' );
	let editingCategory = $state<{ name : string; parentCatId? : string; } | null>( null );

	// ─── Derived: Unpacked Subcategories List ─────────────────────────────────────
	const allSubcategories = $derived(
		categories.flatMap( ( cat ) =>
			( cat.subcategories || [] ).map( ( sub ) => ( {
				id       : sub.id,
				name     : sub.name,
				category : {
					id   : cat.id,
					name : cat.name,
				},
			} ) )
		)
	);

	// ─── Derived: Filtered Views ──────────────────────────────────────────────────
	const filteredCategories = $derived(
		categories.filter( ( c ) => c.name.toLowerCase().includes( search.toLowerCase() ) )
	);

	const filteredSubcategories = $derived(
		allSubcategories.filter( ( s ) =>
			s.name.toLowerCase().includes( search.toLowerCase() ) ||
			s.category.name.toLowerCase().includes( search.toLowerCase() )
		)
	);

	// ─── Fetch Categories & Subcategories ──────────────────────────────────────────
	async function loadCategories() : Promise<void> {
		$globalLoadingStore = true;
		try {
			const response = await connectRequest< Category[] >( {
				endpoint   : 'products/categories/get-all',
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( 'Error de servidor: No se pudieron cargar las categorías.' );
				return;
			}

			categories = response || [];
		} catch ( e ) {
			toast.error( 'Error de red al conectar con el servidor de GlobalCET.' );
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

	function openEditModal( item : any ) : void {
		isEditing       = true;
		editingId       = item.id;
		editingCategory = {
			name        : item.name,
			parentCatId : activeTab === 'subcategories' ? ( item.category?.id || '' ) : '',
		};
		showModal       = true;
	}

	async function deleteItem( id : string ) : Promise<void> {
		const label = activeTab === 'subcategories' ? 'esta subcategoría' : 'esta categoría y todas sus subcategorías';
		if ( !confirm( `¿Está seguro de que desea eliminar ${ label }?` ) ) return;

		$globalLoadingStore = true;
		try {
			const isSub    = activeTab === 'subcategories';
			const path     = isSub ? 'products/categories?type=subcategory' : 'products/categories';
			const response = await connectRequest< any >( {
				endpoint   : `${ path }&id=${ id }`,
				method     : METHOD.DELETE,
				isInternal : true,
			} );

			if ( isApiError( response ) ) {
				toast.error( `Error al eliminar: ${ response.message }` );
				return;
			}

			toast.success( 'Registro eliminado con éxito.' );
			loadCategories();
		} catch ( err ) {
			toast.error( 'Error de red al intentar eliminar.' );
		} finally {
			$globalLoadingStore = false;
		}
	}
</script>

<svelte:head>
	<title>Administrar Categorías - GlobalCET</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-80px)] px-6 py-10 lg:py-12">
	<div class="mx-auto max-w-6xl space-y-4 sm:space-y-8">
		<!-- ─── Header & Breadcrumb ─────────────────────────────────────────────── -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand/10 pb-3 sm:pb-6">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-text-muted">
					<a href="/dashboard" class="hover:text-brand">Dashboard</a>

                    <span>/</span>

                    <span>Productos</span>

                    <span>/</span>

                    <span class="text-brand font-bold">Categorías & Subcategorías</span>
				</div>

                <h1 class="font-display text-3xl font-black text-text uppercase tracking-wide">
					Categorías de Productos
				</h1>

                <p class="text-text-muted">
					Administre las categorías analíticas y subcategorías estructuradas de sus productos científicos.
				</p>
			</div>

			<button
				onclick={ openCreateModal }
				class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold uppercase tracking-wider text-surface-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>

                Agregar { activeTab === 'categories' ? 'Categoría' : 'Subcategoría' }
			</button>
		</div>

		<!-- ─── Tab Switcher & Search Bar ───────────────────────────────────────── -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs">
			<!-- Tabs -->
			<div class="grid sm:flex rounded-xl bg-input p-1 border border-brand/10 max-w-xs gap-1">
				<button
					onclick={ ( ) => { activeTab = 'categories'; } }
					class="flex-1 rounded-lg px-4 py-1 font-bold tracking-wider uppercase transition-all duration-200 { activeTab === 'categories' ? 'bg-brand text-surface-dark shadow-sm' : 'text-text-muted hover:text-text' }"
				>
					Categorías
				</button>
				<button
					onclick={ ( ) => { activeTab = 'subcategories'; } }
					class="flex-1 rounded-lg px-4 py-1 font-bold tracking-wider uppercase transition-all duration-200 { activeTab === 'subcategories' ? 'bg-brand text-surface-dark shadow-sm' : 'text-text-muted hover:text-text' }"
				>
					Subcategorías
				</button>
			</div>

			<!-- Search -->
			<div class="flex items-center max-w-xs relative w-full">
				<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					type="search"
					placeholder="Buscar..."
					bind:value={ search }
					class="w-full rounded-xl border border-brand/15 bg-input py-2 pl-10 pr-4 text-text outline-none transition-all duration-300 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/10"
				/>
			</div>
		</div>

		<!-- ─── Table Lists ──────────────────────────────────────────────────────── -->
		{#if ( activeTab === 'categories' ) }
			<!-- Categories View -->
			<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card animate-fade-in">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
								<th class="px-6 py-4">Nombre de Categoría</th>
								<th class="px-6 py-4">Subcategorías Asociadas</th>
								<th class="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-brand/10 font-semibold">
							{#each filteredCategories as cat ( cat.id ) }
								<tr class="hover:bg-brand/5 transition-colors duration-150">
									<td class="px-6 py-4 font-bold text-text">{ cat.name }</td>
									<td class="px-6 py-4">
										<div class="flex flex-wrap gap-1.5">
											{#each ( cat.subcategories || [] ) as sub ( sub.id ) }
												<span class="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] text-brand border border-brand/15">
													{ sub.name }
												</span>
											{:else}
												<span class="text-text-muted text-[10px]">Sin subcategorías</span>
											{/each}
										</div>
									</td>
									<td class="px-6 py-4 text-right">
										<TableActions
											item={ cat }
											openEditModal={ openEditModal }
											deleteItem={ ( c ) => deleteItem( c.id ) }
										/>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No hay categorías registradas.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else}
			<!-- Subcategories View -->
			<section class="overflow-hidden rounded-2xl border border-brand/15 bg-card/60 backdrop-blur-md shadow-card animate-fade-in">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="border-b border-brand/15 bg-brand/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
								<th class="px-6 py-4">Nombre de Subcategoría</th>
								<th class="px-6 py-4">Categoría Padre</th>
								<th class="px-6 py-4 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-brand/10 font-semibold">
							{#each filteredSubcategories as sub ( sub.id ) }
								<tr class="hover:bg-brand/5 transition-colors duration-150">
									<td class="px-6 py-4 font-bold text-text">{ sub.name }</td>
									<td class="px-6 py-4 font-bold text-brand uppercase tracking-wider text-[10px]">
										{ sub.category.name }
									</td>
									<td class="px-6 py-4 text-right">
										<TableActions
											item={ sub }
											openEditModal={ openEditModal }
											deleteItem={ ( s ) => deleteItem( s.id ) }
										/>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="px-6 py-12 text-center text-text-muted leading-relaxed">
										No hay subcategorías registradas. Cree una categoría padre primero.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<!-- ─── Form Modal ───────────────────────────────────────────────────────── -->
		{#if ( showModal )}
			<CategoryFormModal
				show={ showModal }
				{ isEditing }
				{ editingId }
				{ activeTab }
				{ categories }
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
