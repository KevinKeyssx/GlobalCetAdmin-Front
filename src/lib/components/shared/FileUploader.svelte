<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	import {
        Trash2,
        X,
        CloudUpload,
        FileText
    }               from '@lucide/svelte';
    import toast    from 'svelte-french-toast';
	import JSZip    from 'jszip';

    import ConfirmationModal    from './ConfirmationModal.svelte';
	import InputNumber          from '$lib/components/shared/InputNumber.svelte';
	import ImagePreview         from '$lib/components/shared/ImagePreview.svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	export interface UploadedFileItem {
		file?   : File;
		id      : string;
		preview : string;
		alt     : string;
		isMain  : boolean;
		order   : number;
	}

	interface Props {
		files				: UploadedFileItem[];
		filesInfo			: string;
		isEditing?			: boolean;
		deletingFileId?		: string | null;
		onDeleteSingle?		: ( fileId : string ) => Promise< void > | void;
		onDeleteMultiple?	: ( fileIds : string[] ) => Promise< void > | void;
	}

	// ─── Props & Bindings (Svelte 5 Runes) ────────────────────────────────────────
	let {
		files            = $bindable( [] ),
		filesInfo        = $bindable( '' ),
		isEditing        = false,
		deletingFileId   = null,
		onDeleteSingle,
		onDeleteMultiple,
	} : Props = $props();

	let selectedFileIds = $state< string[] >( [] );

	interface DeleteConfirmState {
		show		: boolean;
		type		: 'single' | 'multiple';
		fileId		: string | undefined;
	}

	let confirmDelete = $state< DeleteConfirmState >( {
		show		: false,
		type		: 'single',
		fileId		: undefined,
	} );

	$effect( () => {
		const currentIds = files.map( ( f ) => f.id );

		untrack( () => {
			selectedFileIds = selectedFileIds.filter( ( id ) => currentIds.includes( id ) );
		} );
	} );

	let isDragging     = $state( false );
	let isDraggingDocx = $state( false );

	const imageCount = $derived( files.filter( ( f ) => !isDocument( f ) ).length );

	let previewState = $state( {
		show    : false,
		src     : '',
		alt     : '',
		name    : '',
		order   : 0,
		isVideo : false,
	} );

	function isVideo( item : UploadedFileItem ) : boolean {
		const file = item.file;
		if ( file ) {
			return file.type.startsWith( 'video/' );
		}
		const preview = item.preview.toLowerCase();
		const alt = item.alt.toLowerCase();
		return preview.endsWith( '.mp4' ) ||
			preview.endsWith( '.webm' ) ||
			preview.endsWith( '.ogg' ) ||
			preview.endsWith( '.mov' ) ||
			alt.endsWith( '.mp4' ) ||
			alt.endsWith( '.webm' ) ||
			alt.endsWith( '.ogg' ) ||
			alt.endsWith( '.mov' );
	}

	function openPreview( item : UploadedFileItem ) : void {
		previewState = {
			show    : true,
			src     : item.preview,
			alt     : item.alt,
			name    : item.file ? item.file.name : ( isVideo( item ) ? 'Video existente' : 'Imagen existente' ),
			order   : item.order,
			isVideo : isVideo( item ),
		};
	}

	// ─── Svelte 5 Rune Effect: Automatically Sync filesInfo ───────────────────────
	$effect( () => {
		const info = files.map( ( f ) => ( {
			id     : f.id,
			alt    : f.alt || 'Imagen',
			isMain : f.isMain,
			order  : Number( f.order ) || 0,
		} ) );
		filesInfo = JSON.stringify( info );
	} );

	// ─── File Handling Lógica (Normal Files: Images, PDF, DOCX) ───────────────────
	function handleDragOver( e : DragEvent ) : void {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() : void {
		isDragging = false;
	}

	function handleDrop( e : DragEvent ) : void {
		e.preventDefault();
		isDragging = false;

		if ( e.dataTransfer?.files ) {
			addFiles( e.dataTransfer.files );
		}
	}

	function handleFileSelect( e : Event ) : void {
		const target = e.target as HTMLInputElement;
		if ( target.files ) {
			addFiles( target.files );
		}
	}

	function addFiles( newFiles : FileList ) : void {
		const updated = [ ...files ];

		for ( let i = 0; i < newFiles.length; i++ ) {
			const file = newFiles[ i ];

			// Allow images, videos, docx and pdf
			const isImage = file.type.startsWith( 'image/' );
			const isVideo = file.type.startsWith( 'video/' );
			const isDocx  = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith( '.docx' );
			const isPdf   = file.type === 'application/pdf' || file.name.endsWith( '.pdf' );

			if ( !isImage && !isVideo && !isDocx && !isPdf ) continue;

			const preview = URL.createObjectURL( file );
			const id      = Math.random().toString( 36 ).substring( 2, 9 );

			// Determine if this is the first main image (only images can be main)
			const isMain = isImage && !updated.some( ( f ) => f.isMain );

			updated.push( {
				file	: file,
				id		: id,
				preview	: preview,
				alt		: file.name.split( '.' )[ 0 ] || 'Archivo adjunto',
				isMain	: isMain,
				order	: updated.length,
			} );
		}

		files = updated;
	}

	// ─── Word Document (.docx) Extraction Lógica ──────────────────────────────────
	function handleDocxDragOver( e : DragEvent ) : void {
		e.preventDefault();
		isDraggingDocx = true;
	}

	function handleDocxDragLeave() : void {
		isDraggingDocx = false;
	}

	function handleDocxDrop( e : DragEvent ) : void {
		e.preventDefault();
		isDraggingDocx = false;

		if ( e.dataTransfer?.files ) {
			const file = e.dataTransfer.files[ 0 ];
			if ( file && ( file.name.endsWith( '.docx' ) || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ) ) {
				processDocxFile( file );
			} else {
				toast.error( 'Por favor suba únicamente archivos con formato .docx' );
			}
		}
	}

	function handleDocxFileSelect( e : Event ) : void {
		const target = e.target as HTMLInputElement;
		if ( target.files ) {
			const file = target.files[ 0 ];
			if ( file ) {
				processDocxFile( file );
			}
		}
	}

	async function processDocxFile( file : File ) : Promise<void> {
		try {
			const zip = await JSZip.loadAsync( file );
			const mediaFiles = Object.keys( zip.files ).filter( ( path ) => {
				if ( !path.startsWith( 'word/media/' ) ) return false;
				const lower = path.toLowerCase();
				return lower.endsWith( '.png' ) ||
					lower.endsWith( '.jpg' ) ||
					lower.endsWith( '.jpeg' ) ||
					lower.endsWith( '.gif' ) ||
					lower.endsWith( '.webp' ) ||
					lower.endsWith( '.avif' );
			} );

			if ( mediaFiles.length === 0 ) {
				toast.error( 'No se encontraron imágenes en el documento Word' );
				return;
			}

			const updated = [ ...files ];
			let addedCount = 0;

			for ( const path of mediaFiles ) {
				const zipFile = zip.file( path );
				if ( !zipFile ) continue;

				const blob = await zipFile.async( 'blob' );
				const filename = path.substring( path.lastIndexOf( '/' ) + 1 );

				let mimeType = 'image/png';
				const lowerFilename = filename.toLowerCase();
				if ( lowerFilename.endsWith( '.jpg' ) || lowerFilename.endsWith( '.jpeg' ) ) {
					mimeType = 'image/jpeg';
				} else if ( lowerFilename.endsWith( '.gif' ) ) {
					mimeType = 'image/gif';
				} else if ( lowerFilename.endsWith( '.webp' ) ) {
					mimeType = 'image/webp';
				} else if ( lowerFilename.endsWith( '.avif' ) ) {
					mimeType = 'image/avif';
				}

				const extractedFile = new File( [ blob ], filename, { type : mimeType } );
				const preview       = URL.createObjectURL( extractedFile );
				const id            = Math.random().toString( 36 ).substring( 2, 9 );

				// Determine if this is the first main image
				const isMain = !updated.some( ( f ) => f.isMain );

				updated.push( {
					file	: extractedFile,
					id		: id,
					preview	: preview,
					alt		: filename.split( '.' )[ 0 ] || 'Imagen extraída',
					isMain	: isMain,
					order	: updated.length,
				} );
				addedCount++;
			}

			files = updated;
			toast.success( `Se extrajeron ${ addedCount } imágenes del documento` );
		} catch ( err ) {
			toast.error( 'Error al procesar el archivo Word' );
		}
	}

	// ─── Helpers ──────────────────────────────────────────────────────────────────
	function isDocument( item : UploadedFileItem ) : boolean {
		const file = item.file;
		const preview = item.preview.toLowerCase();
		const alt = item.alt.toLowerCase();

		if ( file ) {
			const type = file.type;
			const name = file.name.toLowerCase();
			if ( type === 'application/pdf' || name.endsWith( '.pdf' ) ) {
				return true;
			}

			if ( type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith( '.docx' ) ) {
				return true;
			}

			return false;
		}

		return preview.endsWith( '.pdf' ) ||
			alt.endsWith( '.pdf' ) ||
			preview.endsWith( '.docx' ) ||
			alt.endsWith( '.docx' );
	}

	function removeFile( id : string ) : void {
		const index = files.findIndex( ( f ) => f.id === id );
		if ( index !== -1 ) {
			const target = files[ index ];
			if ( target && target.preview.startsWith( 'blob:' ) ) {
				URL.revokeObjectURL( target.preview );
			}

			const updated = files.filter( ( f ) => f.id !== id );

			// If we deleted the main image, set the first remaining image as main
			if ( target?.isMain && updated.length > 0 ) {
				const firstImage = updated.find( ( f ) => !isDocument( f ) );
				if ( firstImage ) {
					firstImage.isMain = true;
				}
			}

			files = updated;
		}
	}

	function setMainImage( id : string ) : void {
		files = files.map( ( f ) => ( {
			...f,
			isMain : f.id === id,
		} ) );
	}

	function triggerDeleteSingle( id : string ) : void {
		confirmDelete = {
			show	: true,
			type	: 'single',
			fileId	: id,
		};
	}

	function triggerDeleteMultiple() : void {
		confirmDelete = {
			show	: true,
			type	: 'multiple',
			fileId	: undefined,
		};
	}

	function handleConfirmDelete() : void {
		if ( confirmDelete.type === 'single' && confirmDelete.fileId ) {
			if ( onDeleteSingle ) {
				onDeleteSingle( confirmDelete.fileId );
			} else {
				removeFile( confirmDelete.fileId );
			}
		} else if ( confirmDelete.type === 'multiple' ) {
			if ( onDeleteMultiple ) {
				onDeleteMultiple( selectedFileIds );
				selectedFileIds = [];
			} else {
				files = files.filter( ( f ) => !selectedFileIds.includes( f.id ) );
				selectedFileIds = [];
			}
		}

		confirmDelete = {
			show	: false,
			type	: 'single',
			fileId	: undefined,
		};
	}

	function handleCancelDelete() : void {
		confirmDelete = {
			show	: false,
			type	: 'single',
			fileId	: undefined,
		};
	}

	// Clean up object URLs on destroy to prevent memory leaks
	onDestroy( () => {
		files.forEach( ( f ) => {
			if ( f.preview.startsWith( 'blob:' ) ) {
				URL.revokeObjectURL( f.preview );
			}
		} );
	} );
</script>

<div class="space-y-4">
	<!-- ─── Dual Drag and Drop Area ───────────────────────────────────────────── -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Left: Images, PDF, DOCX -->
		<div
			role        = "button"
			tabindex    = "0"
			ondragover  = { handleDragOver }
			ondragleave = { handleDragLeave }
			ondrop      = { handleDrop }
			class       = "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-300 { isDragging ? 'border-brand bg-brand/8 scale-[1.005] shadow-[0_0_25px_color-mix(in_srgb,var(--color-brand)_15%,transparent)]' : 'border-brand/15 bg-card/60 hover:border-brand/30 hover:bg-brand/5 hover:scale-[1.002] hover:shadow-[0_4px_20px_color-mix(in_srgb,var(--color-brand)_4%,transparent)]' }"
		>
			<!-- Hidden Native Input -->
			<input
				multiple
				type        = "file"
				accept      = "image/*,video/*,.docx,.pdf"
				onchange    = { handleFileSelect }
				class       = "absolute inset-0 cursor-pointer opacity-0"
				id          = "file-dropzone-input"
			/>

			<!-- Icon and Prompt -->
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand mb-4">
				<CloudUpload class="h-6 w-6" />
			</div>

			<h3 class="font-display text-xs font-bold text-text mb-1">
				Arrastra tus archivos aquí o haz clic para buscar
			</h3>

			<p class="text-[10px] text-text-muted">
				Soporta PNG, JPG, JPEG, WEBP, AVIF, PDF y DOCX (máx. 10MB)
			</p>
		</div>

		<!-- Right: Word (.docx) -->
		<div
			role        = "button"
			tabindex    = "0"
			ondragover  = { handleDocxDragOver }
			ondragleave = { handleDocxDragLeave }
			ondrop      = { handleDocxDrop }
			class       = "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-300 { isDraggingDocx ? 'border-blue-500 bg-blue-500/8 scale-[1.005] shadow-[0_0_25px_rgba(59,130,246,0.15)]' : 'border-blue-500/15 bg-card/60 hover:border-blue-500/30 hover:bg-blue-500/5 hover:scale-[1.002] hover:shadow-[0_4px_20px_rgba(59,130,246,0.04)]' }"
		>
			<!-- Hidden Native Input -->
			<input
				type        = "file"
				accept      = ".docx"
				onchange    = { handleDocxFileSelect }
				class       = "absolute inset-0 cursor-pointer opacity-0"
				id          = "docx-dropzone-input"
			/>

			<!-- Icon and Prompt -->
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4">
				<FileText class="h-6 w-6" />
			</div>

			<h3 class="font-display text-xs font-bold text-text mb-1">
				Extraer desde Word (.docx)
			</h3>

			<p class="text-[10px] text-text-muted">
				Arrastra tu archivo .docx aquí para extraer sus imágenes automáticamente
			</p>
		</div>
	</div>

	<!-- ─── Uploaded Files Metadata List ─────────────────────────────────────── -->
	{#if files.length > 0 }
		<div class="space-y-2.5">
			<div class="flex items-center justify-between">
				<h4 class="font-display text-xs font-bold uppercase tracking-wider text-brand opacity-90">
					Archivos a subir ( { files.length } )
				</h4>

				{#if isEditing && selectedFileIds.length > 0 }
					<button
						type     = "button"
						onclick  = { () => { if ( onDeleteMultiple ) { triggerDeleteMultiple(); } } }
						disabled = { deletingFileId !== null }
						class    = "flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						{#if deletingFileId === 'bulk' }
							<div class="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
							Eliminando...
						{:else}
							<Trash2 class="h-3 w-3" />
							Eliminar Seleccionados ( { selectedFileIds.length } )
						{/if}
					</button>
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each files as item ( item.id ) }
					<div class="group relative flex flex-col gap-3 rounded-xl border border-brand/10 bg-card/40 backdrop-blur-xs p-3 transition-all duration-300 hover:border-brand/20 hover:bg-card/70 hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--color-brand)_5%,transparent)]">
						<div class="flex gap-3">
							{#if isEditing && !item.file }
								<div class="flex items-center justify-center shrink-0">
									<input
										type     = "checkbox"
										checked  = { selectedFileIds.includes( item.id ) }
										disabled = { deletingFileId !== null }
										onchange = { ( e ) => {
											const target = e.target as HTMLInputElement;

											if ( target.checked ) {
												selectedFileIds = [ ...selectedFileIds, item.id ];
											} else {
												selectedFileIds = selectedFileIds.filter( ( id ) => id !== item.id );
											}
										} }
										class    = "accent-brand h-4 w-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
									/>
								</div>
							{/if}

							<!-- Thumbnail Preview -->
							<div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brand/15 bg-input flex items-center justify-center text-xl font-bold select-none shadow-sm">
								{#if ( item.file && item.file.type === 'application/pdf' ) || item.preview.toLowerCase().endsWith( '.pdf' ) || item.alt.toLowerCase().endsWith( '.pdf' ) }
									<div class="flex flex-col items-center justify-center bg-red-500/10 text-red-400 h-full w-full gap-1">
										<FileText class="h-5 w-5 text-red-400/80" />
										<span class="text-[9px] font-black uppercase tracking-wider">PDF</span>
									</div>
								{:else}
									{#if ( item.file && item.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ) || item.preview.toLowerCase().endsWith( '.docx' ) || item.alt.toLowerCase().endsWith( '.docx' ) }
										<div class="flex flex-col items-center justify-center bg-blue-500/10 text-blue-400 h-full w-full gap-1">
											<FileText class="h-5 w-5 text-blue-400/80" />
											<span class="text-[9px] font-black uppercase tracking-wider">DOCX</span>
										</div>
									{:else}
										{#if isVideo( item ) }
											<button
												type    = "button"
												onclick = { () => openPreview( item ) }
												class   = "h-full w-full cursor-pointer overflow-hidden outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
												title   = "Vista previa de video"
											>
												<!-- svelte-ignore a11y_media_has_caption -->
												<video
													src   = { item.preview }
													class = "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
													muted
													playsinline
												></video>
											</button>
										{:else}
											<button
												type    = "button"
												onclick = { () => openPreview( item ) }
												class   = "h-full w-full cursor-pointer overflow-hidden outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
												title   = "Vista previa de imagen"
											>
												<img
													src   = { item.preview }
													alt   = { item.alt }
													class = "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
												/>
											</button>
										{/if}
									{/if}
								{/if}
							</div>

							<!-- Controls & Info -->
							<div class="flex-1 min-w-0 space-y-1.5 flex flex-col justify-center">
								<p class="text-xs text-text font-semibold truncate leading-tight" title={ item.file ? item.file.name : item.alt }>
									{ item.file ? `${ item.file.name } ( ${ ( item.file.size / 1024 / 1024 ).toFixed( 2 ) } MB )` : ( ( item.preview.toLowerCase().endsWith( '.pdf' ) || item.preview.toLowerCase().endsWith( '.docx' ) ) ? 'Archivo existente' : 'Imagen existente' ) }
								</p>

								{#if !isDocument( item ) }
									<div class="flex items-center gap-2">
										<!-- Set Main Radio -->
										<label class="inline-flex items-center gap-1.5 cursor-pointer select-none rounded-full px-2.5 py-0.5 border transition-all duration-200 { item.isMain ? 'border-brand/35 bg-brand/10 text-brand font-semibold' : 'border-brand/10 bg-transparent text-text-muted hover:border-brand/20 hover:text-text' } text-[10px]">
											<input
												type        = "radio"
												name        = "main-image-radio"
												checked     = { item.isMain }
												onchange    = { () => setMainImage( item.id ) }
												class       = "sr-only"
											/>
											<div class="h-2 w-2 rounded-full border border-current flex items-center justify-center">
												{#if item.isMain }
													<div class="h-1 w-1 rounded-full bg-current"></div>
												{/if}
											</div>
											<span>Principal</span>
										</label>
									</div>
								{/if}
							</div>

							<!-- Delete Button -->
							<div class="flex items-center">
								{#if isEditing && !item.file }
									<button
										type     = "button"
										onclick  = { () => triggerDeleteSingle( item.id ) }
										disabled = { deletingFileId !== null }
										class    = "h-7 w-7 shrink-0 flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
										title    = "Eliminar archivo del servidor"
									>
										{#if deletingFileId === item.id }
											<div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
										{:else}
											<Trash2 class="h-4 w-4" />
										{/if}
									</button>
								{:else}
									<button
										type     = "button"
										onclick  = { () => removeFile( item.id ) }
										disabled = { deletingFileId !== null }
										class    = "h-7 w-7 shrink-0 flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
										title    = "Quitar archivo local"
									>
										<X class="h-4 w-4" />
									</button>
								{/if}
							</div>
						</div>

						{#if !isDocument( item ) }
							<!-- Metadata inputs (Alt, Order) -->
							<div class="flex items-center gap-2 border-t border-brand/5 pt-2.5">
								<div class="flex-1 min-w-0" title="Texto alternativo">
									<label for="alt-{ item.id }" class="sr-only">Texto alternativo</label>
									<input
										id="alt-{ item.id }"
										type="text"
										placeholder="Texto Alt (SEO)"
										bind:value={ item.alt }
										class="w-full rounded-lg border border-brand/10 bg-input/60 px-2.5 py-1.5 text-[11px] text-text outline-none transition-all placeholder:text-text-muted/50 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
									/>
								</div>

								<div class="shrink-0" title="Orden de aparición">
									<label for="order-{ item.id }" class="sr-only">Orden</label>
									<InputNumber
										bind:value = { item.order }
										min        = { 0 }
										max        = { imageCount - 1 }
									/>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<ConfirmationModal
	show        = { confirmDelete.show }
	title       = { confirmDelete.type === 'single' ? '¿Eliminar archivo?' : '¿Eliminar archivos seleccionados?' }
	message     = { confirmDelete.type === 'single' ? 'Esta acción eliminará permanentemente el archivo. ¿Deseas continuar?' : `Esta acción eliminará permanentemente los ${ selectedFileIds.length } archivos seleccionados. ¿Deseas continuar?` }
	confirmText = "Eliminar"
	cancelText  = "Cancelar"
	onConfirm   = { handleConfirmDelete }
	onCancel    = { handleCancelDelete }
/>

<ImagePreview
	bind:show = { previewState.show }
	src       = { previewState.src }
	alt       = { previewState.alt }
	name      = { previewState.name }
	order     = { previewState.order }
	isVideo   = { previewState.isVideo }
	onClose   = { ( ) => { previewState.show = false; } }
/>
