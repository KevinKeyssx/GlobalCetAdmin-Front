<script lang="ts">
	import { untrack }           from 'svelte';
	import { fade, scale }        from 'svelte/transition';
	import { cubicOut }           from 'svelte/easing';
	import {
		Bold,
		Italic,
		Strikethrough,
		AlignLeft,
		AlignCenter,
		AlignRight,
		AlignJustify,
		Link2,
		Link2Off,
		Table2,
		List,
		ListOrdered,
		Quote,
		Trash2
	}                             from '@lucide/svelte';
	import { Editor, Extension }  from '@tiptap/core';
	import StarterKit             from '@tiptap/starter-kit';
	import { TextAlign }          from '@tiptap/extension-text-align';
	import { Link }               from '@tiptap/extension-link';
	import { Table }              from '@tiptap/extension-table';
	import { TableRow }           from '@tiptap/extension-table-row';
	import { TableHeader }        from '@tiptap/extension-table-header';
	import { TableCell }          from '@tiptap/extension-table-cell';
	import { TextStyle }          from '@tiptap/extension-text-style';
	import SoftSelect             from '$lib/components/shared/SoftSelect.svelte';
	import Popover                from '$lib/components/shared/Popover.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	interface Props {
		html         : string;
		placeholder? : string;
	}

	let {
		html        = $bindable( '' ),
		placeholder = 'Escribe algo aquí...'
	} : Props = $props();

	// ─── Reactive States ──────────────────────────────────────────────────────────
	let editorElement = $state<HTMLElement | null>( null );
	let editor        = $state<Editor | null>( null );

	// Toolbar active statuses
	let isBold        = $state( false );
	let isItalic      = $state( false );
	let isStrike      = $state( false );
	let isBulletList  = $state( false );
	let isOrderedList = $state( false );
	let isBlockquote  = $state( false );
	let isLink        = $state( false );
	let isTableActive = $state( false );
	let currentAlign  = $state( 'left' );

	let currentHeadingSelected = $state( 'paragraph' );
	let currentSizeSelected    = $state( 'default' );

	// Modal visibility states
	let showLinkPopover  = $state( false );
	let linkUrl          = $state( '' );

	let showTablePopover = $state( false );
	let tableRows        = $state( 3 );
	let tableCols        = $state( 3 );

	// Constants
	const fontSizes = [ 12, 14, 16, 18, 20, 24, 30, 36, 48 ];

	const headingOptions = [
		{ id : 'paragraph', name : 'Párrafo' },
		{ id : 'h1',        name : 'Título 1' },
		{ id : 'h2',        name : 'Título 2' },
		{ id : 'h3',        name : 'Título 3' }
	];

	function getFontSizeOptions() : { id : string; name : string }[] {
		const list = [ { id : 'default', name : 'Tamaño' } ];
		for ( const size of fontSizes ) {
			list.push( { id : size.toString(), name : `${ size }px` } );
		}
		return list;
	}
	const fontSizeOptions = getFontSizeOptions();

	// ─── Custom Font Size Extension ────────────────────────────────────────────────
	const FontSize = Extension.create( {
		name : 'fontSize',
		addOptions() : { types : string[] } {
			return {
				types : [ 'textStyle' ],
			};
		},
		addGlobalAttributes() : any[] {
			return [
				{
					types      : this.options.types,
					attributes : {
						fontSize : {
							default    : null,
							parseHTML  : ( element : HTMLElement ) : string | null => element.style.fontSize?.replace( 'px', '' ) || null,
							renderHTML : ( attributes : Record<string, any> ) : Record<string, any> => {
								if ( !attributes.fontSize ) {
									return {};
								}
								return {
									style : `font-size: ${ attributes.fontSize }px`,
								};
							},
						},
					},
				},
			];
		},
	} );

	// ─── Portal Action for Modals ─────────────────────────────────────────────────
	function portal( node : HTMLElement ) : { destroy() : void } {
		document.body.appendChild( node );
		return {
			destroy() : void {
				if ( node.parentNode ) {
					node.parentNode.removeChild( node );
				}
			}
		};
	}

	// ─── Update Toolbar States ────────────────────────────────────────────────────
	function updateToolbarState() : void {
		if ( !editor ) return;

		isBold        = editor.isActive( 'bold' );
		isItalic      = editor.isActive( 'italic' );
		isStrike      = editor.isActive( 'strike' );
		isBulletList  = editor.isActive( 'bulletList' );
		isOrderedList = editor.isActive( 'orderedList' );
		isBlockquote  = editor.isActive( 'blockquote' );
		isLink        = editor.isActive( 'link' );
		isTableActive = editor.isActive( 'table' );

		const attrs = editor.getAttributes( 'textStyle' );
		currentSizeSelected = attrs.fontSize || 'default';

		if ( editor.isActive( 'heading', { level : 1 } ) ) {
			currentHeadingSelected = 'h1';
		} else if ( editor.isActive( 'heading', { level : 2 } ) ) {
			currentHeadingSelected = 'h2';
		} else if ( editor.isActive( 'heading', { level : 3 } ) ) {
			currentHeadingSelected = 'h3';
		} else {
			currentHeadingSelected = 'paragraph';
		}

		if ( editor.isActive( { textAlign : 'center' } ) ) {
			currentAlign = 'center';
		} else if ( editor.isActive( { textAlign : 'right' } ) ) {
			currentAlign = 'right';
		} else if ( editor.isActive( { textAlign : 'justify' } ) ) {
			currentAlign = 'justify';
		} else {
			currentAlign = 'left';
		}
	}

	// ─── Save Link ────────────────────────────────────────────────────────────────
	function saveLink() : void {
		if ( !editor ) return;

		if ( !linkUrl.trim() ) {
			editor.chain().focus().extendMarkRange( 'link' ).unsetLink().run();
		} else {
			editor.chain().focus().extendMarkRange( 'link' ).setLink( { href : linkUrl } ).run();
		}

		showLinkPopover = false;
	}

	// ─── Reset Table Inputs ────────────────────────────────────────────────────────
	function resetTableInputs() : void {
		tableRows = 3;
		tableCols = 3;
	}

	// ─── Insert Table ─────────────────────────────────────────────────────────────
	function insertTable() : void {
		if ( !editor ) return;
		const rows = Number( tableRows ) || 3;
		const cols = Number( tableCols ) || 3;

		editor.chain().focus().insertTable( { rows, cols, withHeaderRow : true } ).run();
		showTablePopover = false;
	}

	// ─── Reset Table Inputs Effect ──────────────────────────────────────────────────
	$effect( () => {
		if ( showTablePopover ) {
			untrack( () => {
				resetTableInputs();
			} );
		}
	} );

	// ─── Reset Link Input Effect ────────────────────────────────────────────────────
	$effect( () => {
		if ( showLinkPopover ) {
			untrack( () => {
				if ( editor ) {
					linkUrl = editor.getAttributes( 'link' ).href || '';
				}
			} );
		}
	} );

	// ─── Heading and Size Effects ──────────────────────────────────────────────────
	$effect( () => {
		const val = currentHeadingSelected;
		const editorInstance = editor;
		if ( !editorInstance ) return;

		untrack( () => {
			const isCurrentParagraph = val === 'paragraph' && editorInstance.isActive( 'paragraph' );
			const isCurrentH1 = val === 'h1' && editorInstance.isActive( 'heading', { level : 1 } );
			const isCurrentH2 = val === 'h2' && editorInstance.isActive( 'heading', { level : 2 } );
			const isCurrentH3 = val === 'h3' && editorInstance.isActive( 'heading', { level : 3 } );

			if ( isCurrentParagraph || isCurrentH1 || isCurrentH2 || isCurrentH3 ) {
				return;
			}

			if ( val === 'paragraph' ) {
				editorInstance.chain().focus().setParagraph().run();
			} else if ( val === 'h1' ) {
				editorInstance.chain().focus().toggleHeading( { level : 1 } ).run();
			} else if ( val === 'h2' ) {
				editorInstance.chain().focus().toggleHeading( { level : 2 } ).run();
			} else if ( val === 'h3' ) {
				editorInstance.chain().focus().toggleHeading( { level : 3 } ).run();
			}
		} );
	} );

	$effect( () => {
		const val = currentSizeSelected;
		const editorInstance = editor;
		if ( !editorInstance ) return;

		untrack( () => {
			const attrs = editorInstance.getAttributes( 'textStyle' );
			const currentSizeAttr = attrs.fontSize || 'default';
			if ( currentSizeAttr === val ) {
				return;
			}

			if ( val === 'default' ) {
				editorInstance.chain().focus().setMark( 'textStyle', { fontSize : null } ).run();
			} else {
				editorInstance.chain().focus().setMark( 'textStyle', { fontSize : val } ).run();
			}
		} );
	} );

	// ─── Lifecycle / Editor Initialization ────────────────────────────────────────
	$effect( () => {
		if ( !editorElement ) return;

		let initialContent = '';
		untrack( () => {
			initialContent = html;
		} );

		const instance = new Editor( {
			element    : editorElement,
			extensions : [
				StarterKit.configure( {
					heading : {
						levels : [ 1, 2, 3 ],
					},
				} ),
				TextAlign.configure( {
					types : [ 'heading', 'paragraph' ],
				} ),
				Link.configure( {
					openOnClick    : false,
					HTMLAttributes : {
						class : 'text-brand underline cursor-pointer',
					},
				} ),
				Table.configure( {
					resizable : true,
				} ),
				TableRow,
				TableHeader,
				TableCell,
				TextStyle,
				FontSize,
			],
			content : initialContent,
			onUpdate( { editor } ) {
				const currentHTML = editor.getHTML();
				if ( html !== currentHTML ) {
					html = currentHTML;
				}
				updateToolbarState();
			},
			onSelectionUpdate() {
				updateToolbarState();
			},
			onTransaction() {
				updateToolbarState();
			},
		} );

		editor = instance;

		return () => {
			instance.destroy();
		};
	} );

	// Sync Svelte prop edits from parent to Editor
	$effect( () => {
		const nextHTML = html;

		untrack( () => {
			if ( editor && nextHTML !== editor.getHTML() ) {
				editor.commands.setContent( nextHTML );
			}
		} );
	} );
</script>

<div class="flex flex-col rounded-2xl border border-brand/10 bg-card/40 backdrop-blur-md overflow-hidden text-xs w-full shadow-md">
	<!-- ─── Toolbar ─────────────────────────────────────────────────────────────── -->
	<div class="flex flex-wrap items-center gap-2 p-2 bg-brand/3 border-b border-brand/10 select-none">
		<!-- Heading Selector -->
		<div class="w-32">
			<SoftSelect
				options={ headingOptions }
				bind:value={ currentHeadingSelected }
				placeholder="Párrafo"
			/>
		</div>

		<!-- Font Size Selector -->
		<div class="w-24">
			<SoftSelect
				options={ fontSizeOptions }
				bind:value={ currentSizeSelected }
				placeholder="Tamaño"
			/>
		</div>

		<div class="h-4 w-px bg-brand/10 mx-1"></div>

		<!-- Bold -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().toggleBold().run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { isBold ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Negrita"
		>
			<Bold class="size-4" />
		</button>

		<!-- Italic -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().toggleItalic().run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { isItalic ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Cursiva"
		>
			<Italic class="size-4" />
		</button>

		<!-- Strike -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().toggleStrike().run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { isStrike ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Tachado"
		>
			<Strikethrough class="size-4" />
		</button>

		<div class="h-4 w-px bg-brand/10 mx-1"></div>

		<!-- Align Left -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().setTextAlign( 'left' ).run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { currentAlign === 'left' ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Alinear Izquierda"
		>
			<AlignLeft class="size-4" />
		</button>

		<!-- Align Center -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().setTextAlign( 'center' ).run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { currentAlign === 'center' ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Centrar"
		>
			<AlignCenter class="size-4" />
		</button>

		<!-- Align Right -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().setTextAlign( 'right' ).run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { currentAlign === 'right' ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Alinear Derecha"
		>
			<AlignRight class="size-4" />
		</button>

		<!-- Align Justify -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().setTextAlign( 'justify' ).run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { currentAlign === 'justify' ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Justificar"
		>
			<AlignJustify class="size-4" />
		</button>

		<div class="h-4 w-px bg-brand/10 mx-1"></div>

		<!-- Bullet List -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().toggleBulletList().run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { isBulletList ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Lista con viñetas"
		>
			<List class="size-4" />
		</button>

		<!-- Ordered List -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().toggleOrderedList().run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { isOrderedList ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Lista ordenada"
		>
			<ListOrdered class="size-4" />
		</button>

		<!-- Blockquote -->
		<button
			type="button"
			onclick={ () : void => { editor?.chain().focus().toggleBlockquote().run(); } }
			class="p-1.5 rounded-lg transition-all cursor-pointer border { isBlockquote ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
			title="Cita"
		>
			<Quote class="size-4" />
		</button>

		<div class="h-4 w-px bg-brand/10 mx-1"></div>

		<!-- Add/Edit Link -->
		<Popover
			bind:open={ showLinkPopover }
			classContent="w-72"
		>
			{#snippet trigger( { props } )}
				<button
					type="button"
					{ ...props }
					class="p-1.5 rounded-lg transition-all cursor-pointer border { isLink ? 'bg-brand/15 text-brand border-brand/20' : 'text-text-muted hover:bg-brand/10 hover:text-text border-transparent' }"
					title="Enlace"
				>
					<Link2 class="size-4" />
				</button>
			{/snippet}
			{#snippet content()}
				<div class="space-y-4">
					<div class="flex items-center justify-between border-b border-brand/10 pb-3">
						<h3 class="font-display text-base font-black text-brand uppercase tracking-wider">Vincular Enlace</h3>
					</div>

					<div class="space-y-1.5">
						<label for="editor-link-url" class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Dirección URL</label>
						<input
							id="editor-link-url"
							type="url"
							placeholder="https://ejemplo.com"
							bind:value={ linkUrl }
							class="w-full rounded-xl border border-brand/15 bg-input px-3.5 py-2 text-text outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-semibold"
						/>
					</div>

					<div class="flex items-center justify-end gap-2.5 border-t border-brand/10 pt-4">
						<button
							type="button"
							onclick={ () : void => { showLinkPopover = false; } }
							class="rounded-xl border border-brand/20 bg-surface/30 px-4 py-2 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-all cursor-pointer"
						>
							Cancelar
						</button>
						<button
							type="button"
							onclick={ () : void => { saveLink(); } }
							class="rounded-xl bg-brand text-surface-dark px-5 py-2 font-bold uppercase tracking-wider hover:bg-brand-bright transition-all cursor-pointer"
						>
							Aceptar
						</button>
					</div>
				</div>
			{/snippet}
		</Popover>

		<!-- Remove Link (conditional) -->
		{#if isLink}
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().unsetLink().run(); } }
				class="p-1.5 rounded-lg transition-all cursor-pointer border text-red-400 hover:bg-red-500/10 border-transparent"
				title="Quitar Enlace"
			>
				<Link2Off class="size-4" />
			</button>
		{/if}

		<!-- Add Table -->
		<Popover
			bind:open={ showTablePopover }
			classContent="w-64"
		>
			{#snippet trigger( { props } )}
				<button
					type="button"
					{ ...props }
					class="p-1.5 rounded-lg transition-all cursor-pointer border text-text-muted hover:bg-brand/10 hover:text-text border-transparent"
					title="Insertar Tabla"
				>
					<Table2 class="size-4" />
				</button>
			{/snippet}
			{#snippet content()}
				<div class="space-y-4">
					<div class="flex items-center justify-between border-b border-brand/10 pb-3">
						<h3 class="font-display text-base font-black text-brand uppercase tracking-wider">Insertar Tabla</h3>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1.5">
							<label for="editor-table-cols" class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Columnas</label>
							<input
								id="editor-table-cols"
								type="number"
								min="1"
								max="10"
								bind:value={ tableCols }
								class="w-full rounded-xl border border-brand/15 bg-input px-3.5 py-2 text-text outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-semibold"
							/>
						</div>
						<div class="space-y-1.5">
							<label for="editor-table-rows" class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Filas</label>
							<input
								id="editor-table-rows"
								type="number"
								min="1"
								max="20"
								bind:value={ tableRows }
								class="w-full rounded-xl border border-brand/15 bg-input px-3.5 py-2 text-text outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-semibold"
							/>
						</div>
					</div>

					<div class="flex items-center justify-end gap-2.5 border-t border-brand/10 pt-4">
						<button
							type="button"
							onclick={ () : void => { showTablePopover = false; } }
							class="rounded-xl border border-brand/20 bg-surface/30 px-4 py-2 font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 transition-all cursor-pointer"
						>
							Cancelar
						</button>
						<button
							type="button"
							onclick={ () : void => { insertTable(); } }
							class="rounded-xl bg-brand text-surface-dark px-5 py-2 font-bold uppercase tracking-wider hover:bg-brand-bright transition-all cursor-pointer"
						>
							Crear
						</button>
					</div>
				</div>
			{/snippet}
		</Popover>

		<!-- Dynamic Table Options -->
		{#if isTableActive}
			<div class="h-4 w-px bg-brand/10 mx-1"></div>

			<!-- Row actions -->
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().addRowBefore().run(); } }
				class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 hover:text-text transition-all cursor-pointer border border-brand/10 bg-card/60"
				title="Insertar Fila Arriba"
			>
				+Fila ↑
			</button>
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().addRowAfter().run(); } }
				class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 hover:text-text transition-all cursor-pointer border border-brand/10 bg-card/60"
				title="Insertar Fila Abajo"
			>
				+Fila ↓
			</button>
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().deleteRow().run(); } }
				class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border border-red-500/10 bg-red-500/5"
				title="Eliminar Fila"
			>
				-Fila
			</button>

			<!-- Column actions -->
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().addColumnBefore().run(); } }
				class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 hover:text-text transition-all cursor-pointer border border-brand/10 bg-card/60"
				title="Insertar Columna Izquierda"
			>
				+Col ←
			</button>
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().addColumnAfter().run(); } }
				class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-text-muted hover:bg-brand/10 hover:text-text transition-all cursor-pointer border border-brand/10 bg-card/60"
				title="Insertar Columna Derecha"
			>
				+Col →
			</button>
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().deleteColumn().run(); } }
				class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border border-red-500/10 bg-red-500/5"
				title="Eliminar Columna"
			>
				-Col
			</button>

			<!-- Delete Table -->
			<button
				type="button"
				onclick={ () : void => { editor?.chain().focus().deleteTable().run(); } }
				class="p-1.5 rounded-lg transition-all cursor-pointer text-red-400 hover:bg-red-500/10 border border-transparent"
				title="Eliminar Tabla"
			>
				<Trash2 class="size-4" />
			</button>
		{/if}
	</div>

	<!-- ─── Editor Canvas ───────────────────────────────────────────────────────── -->
	<div
		bind:this={ editorElement }
		class="p-4 min-h-[250px] max-h-[600px] overflow-y-auto"
	></div>
</div>

<!-- ─── Modals (Portaled to document.body) ────────────────────────────────────── -->



<style>
	/* Styles for dynamically created ProseMirror content */
	:global(.tiptap) {
		min-height: 250px;
		outline: none;
	}

	:global(.tiptap p) {
		margin-bottom: 0.75rem;
		line-height: 1.6;
	}

	:global(.tiptap h1) {
		font-family: var( --font-display );
		font-weight: 900;
		font-size: 1.75rem;
		text-transform: uppercase;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: var( --color-brand );
		line-height: 1.2;
	}

	:global(.tiptap h2) {
		font-family: var( --font-display );
		font-weight: 800;
		font-size: 1.4rem;
		text-transform: uppercase;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		color: var( --color-brand-bright );
		line-height: 1.3;
	}

	:global(.tiptap h3) {
		font-family: var( --font-display );
		font-weight: 700;
		font-size: 1.15rem;
		text-transform: uppercase;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: var( --color-text );
		line-height: 1.4;
	}

	:global(.tiptap ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.tiptap ol) {
		list-style-type: decimal;
		padding-left: 1.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.tiptap blockquote) {
		border-left: 4px solid var( --color-brand );
		padding-left: 1rem;
		font-style: italic;
		color: var( --color-text-muted );
		margin-bottom: 0.75rem;
		background: color-mix( in srgb, var( --color-brand ) 4%, transparent );
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 0 8px 8px 0;
	}

	:global(.tiptap table) {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	:global(.tiptap th, .tiptap td) {
		border: 1px solid color-mix( in srgb, var( --color-brand ) 18%, transparent );
		padding: 0.5rem 0.75rem;
		text-align: left;
		min-width: 50px;
	}

	:global(.tiptap th) {
		background-color: color-mix( in srgb, var( --color-brand ) 7%, transparent );
		font-weight: bold;
		color: var( --color-brand );
	}

	:global(.tiptap a) {
		color: var( --color-brand );
		text-decoration: underline;
	}
</style>
