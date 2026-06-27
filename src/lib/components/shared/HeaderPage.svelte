<script lang="ts">
	import { Plus, Blocks, Rows2, FileSpreadsheet, FileText, MoreHorizontal } from '@lucide/svelte';
	import toast from 'svelte-french-toast';

	import Breadcrum, { type BreadcrumbItem }   from './Breadcrum.svelte';
	import { getStorageItem, setStorageItem }   from '$lib/utils/localStorage';
	import Switch                               from './Inputs/Switch.svelte';
	import Popover                              from './Popover.svelte';


	interface Props {
		title             : string;
		description       : string;
		breadcrumb        : BreadcrumbItem[];
		buttonText?       : string;
		onclick?          : ( ) => void;
		view?             : 'cards' | 'list';
		showCancelButton? : boolean;
		oncancel?         : ( ) => void;
		saveButtonText?   : string;
		onsave?           : ( ) => void;
		formId?           : string;
		isPending?        : boolean;
		totalCount?       : number;
		filteredCount?    : number;
		onDownloadExcel?  : ( onlyOnScreen : boolean ) => Promise< void > | void;
		onDownloadPdf?    : ( onlyOnScreen : boolean ) => Promise< void > | void;
	}

	let {
		title,
		description,
		breadcrumb,
		buttonText,
		onclick,
		view             = $bindable( 'cards' ),
		showCancelButton = false,
		oncancel,
		saveButtonText   = 'Guardar',
		onsave,
		formId,
		isPending        = false,
		totalCount,
		filteredCount,
		onDownloadExcel,
		onDownloadPdf,
	} : Props = $props();

	let hasRestored = false;
	let onlyOnScreen = $state( true );
	let excelLoading = $state( false );
	let pdfLoading   = $state( false );

	$effect( ( ) => {
		if ( view === undefined || showCancelButton ) {
			return;
		}

		if ( !hasRestored ) {
			const savedView = getStorageItem< 'cards' | 'list' >( `view-preference-${ title }`, 'cards' );
			view        = savedView;
			hasRestored = true;
		} else {
			setStorageItem( `view-preference-${ title }`, view );
		}
	} );

	async function handleDownloadExcel() : Promise< void > {
		if ( !onDownloadExcel || excelLoading || pdfLoading ) {
			return;
		}
		excelLoading = true;
		try {
			await onDownloadExcel( onlyOnScreen );
		} catch ( err : any ) {
			toast.error( err.message || 'Error al exportar Excel' );
		} finally {
			excelLoading = false;
		}
	}

	async function handleDownloadPdf() : Promise< void > {
		if ( !onDownloadPdf || excelLoading || pdfLoading ) {
			return;
		}
		pdfLoading = true;
		try {
			await onDownloadPdf( onlyOnScreen );
		} catch ( err : any ) {
			toast.error( err.message || 'Error al exportar PDF' );
		} finally {
			pdfLoading = false;
		}
	}
</script>

<div class="w-full flex flex-col">
	<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full {
            totalCount !== undefined
                ? ( onDownloadExcel || onDownloadPdf
                    ? 'pb-0'
                    : 'pb-[0.28rem]'
                )
                : 'border-b border-brand/10 pb-4' }">
		<div class="space-y-1 w-full md:w-auto">
			<Breadcrum items={ breadcrumb } />

			<h1 class="font-display text-xl md:text-2xl lg:text-3xl font-black dark:text-white text-brand-bright uppercase tracking-wide">
				{ title }
			</h1>

			<p class="text-text-muted">
				{ description }
			</p>
		</div>

		<div class={ showCancelButton ? "flex md:grid lg:flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0" : "grid sm:flex items-center sm:justify-end gap-3 w-full md:w-auto shrink-0" }>
			{#if showCancelButton}
				<button
					type    = "button"
					onclick = { oncancel }
					class   = "w-full cursor-pointer rounded-lg border border-brand/20 bg-card/70 px-4 py-1.5 font-display text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted transition-all hover:border-brand/35 hover:bg-brand/10 hover:text-brand"
				>
					Cancelar
				</button>

				<button
					type     = { formId ? 'submit' : 'button' }
					form     = { formId }
					onclick  = { onsave }
					disabled = { isPending }
					class    = "flex text-center justify-center w-full cursor-pointer items-center gap-1.5 rounded-lg border-none bg-linear-to-tr from-brand via-brand-bright to-brand px-5 py-1.5 font-display text-[0.7rem] font-black uppercase tracking-[0.08em] text-white dark:text-brand-dark shadow-[0_0_16px_color-mix(in_srgb,var(--color-brand)_30%,transparent)] transition-all hover:shadow-[0_0_26px_color-mix(in_srgb,var(--color-brand)_50%,transparent)] disabled:cursor-not-allowed disabled:opacity-55"
				>
					{#if isPending}
						<span class="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
						Guardando…
					{:else}
						<span>{ saveButtonText }</span>
					{/if}
				</button>
			{:else}
				{#if ( view !== undefined )}
					<div class="inline-flex rounded-xl bg-surface/30 border border-brand/10 p-1 self-end md:self-auto w-full md:w-auto justify-center md:justify-start gap-1">
						<button
							type        = "button"
							onclick     = { ( ) : void => { view = 'cards'; } }
							class       = "p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center flex-1 md:flex-initial { view === 'cards' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-brand/5 hover:text-text' }"
							title       = "Vista de Tarjetas"
							aria-label  = "Vista de Tarjetas"
						>
							<Blocks class="size-4" />
						</button>

						<button
							type        = "button"
							onclick     = { ( ) : void => { view = 'list'; } }
							class       = "p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center flex-1 md:flex-initial { view === 'list' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-brand/5 hover:text-text' }"
							title       = "Vista de Lista"
							aria-label  = "Vista de Lista"
						>
							<Rows2 class="size-4" />
						</button>
					</div>
				{/if}

				{#if ( buttonText && onclick )}
					<button
						onclick = { onclick }
						class   = "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 md:px-3 xl:px-5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-white dark:text-brand-dark shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-bright w-full md:w-auto cursor-pointer"
					>
						<Plus class="size-3 md:size-4" />

						<span class="md:hidden xl:inline text-[11px] xl:text-xs">
							{ buttonText }
						</span>
					</button>
				{/if}
			{/if}
		</div>
	</header>

	{#if ( totalCount !== undefined )}
		<div class="flex flex-row items-center w-full mt-3 gap-4">
			<div class="flex items-center gap-2.5 shrink-0 text-[10px] font-bold uppercase tracking-wider">
				<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/5 border border-brand/10 text-text-muted backdrop-blur-xs">
					<span>Total</span>
					<span class="w-1 h-1 rounded-full bg-brand/20"></span>
					<span class="text-brand font-black text-xs font-mono">{ totalCount }</span>
				</div>

				<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-bright backdrop-blur-xs shadow-[0_0_10px_rgba(16,185,129,0.05)]">
					<span class="text-text-muted">Filtrados</span>
					<span class="w-1 h-1 rounded-full bg-brand/20"></span>
					<span class="font-black text-xs font-mono">{ filteredCount !== undefined ? filteredCount : totalCount }</span>
				</div>
			</div>

			<div class="flex-1 border-b border-brand/10"></div>

			{#if ( onDownloadExcel && onDownloadPdf )}
				<Popover
					side         = "bottom"
					align        = "end"
					classContent = "w-56 backdrop-blur-md bg-card/90"
				>
					{#snippet trigger( { props } )}
						<button
							{ ...props }
							type       = "button"
							class      = "p-2 rounded-full border border-brand/10 hover:border-brand/35 bg-surface/30 text-text-muted hover:text-brand transition-all cursor-pointer flex items-center justify-center shrink-0"
							aria-label = "Opciones de exportación"
						>
							<MoreHorizontal class="size-4" />
						</button>
					{/snippet}

					{#snippet content()}
						<div class="flex flex-col gap-3">
							<span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-brand/10 pb-1.5 mb-1 text-center">
								Opciones de exportación
							</span>

							<Switch
								bind:checked  = { onlyOnScreen }
								id            = "export-mode"
								labelActive   = "Pantalla"
								labelInactive = "Filtrado"
								class         = "justify-between bg-surface/30 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider w-full"
							/>

							<div class="flex flex-col gap-2 w-full font-semibold text-xs text-text-muted">
								<button
									type     = "button"
									onclick  = { handleDownloadExcel }
									disabled = { excelLoading || pdfLoading }
									class    = "inline-flex items-center justify-center gap-2 rounded-xl border border-brand/20 bg-surface/30 hover:bg-brand/10 hover:border-brand/35 text-[10px] font-semibold uppercase tracking-wider text-text-muted hover:text-brand px-3 py-1.5 transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed w-full"
								>
									{#if excelLoading}
										<span class="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-brand/30 border-t-brand"></span>
									{:else}
										<FileSpreadsheet class="size-3.5" />
									{/if}
									<span>Excel</span>
								</button>

								<button
									type     = "button"
									onclick  = { handleDownloadPdf }
									disabled = { excelLoading || pdfLoading }
									class    = "inline-flex items-center justify-center gap-2 rounded-xl border border-brand/20 bg-surface/30 hover:bg-brand/10 hover:border-brand/35 text-[10px] font-semibold uppercase tracking-wider text-text-muted hover:text-brand px-3 py-1.5 transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed w-full"
								>
									{#if pdfLoading}
										<span class="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-brand/30 border-t-brand"></span>
									{:else}
										<FileText class="size-3.5" />
									{/if}
									<span>PDF</span>
								</button>
							</div>
						</div>
					{/snippet}
				</Popover>
			{/if}
		</div>
	{/if}
</div>
