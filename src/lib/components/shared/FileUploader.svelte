<script lang="ts">
	import { onDestroy } from 'svelte';

	// ─── Interfaces ───────────────────────────────────────────────────────────────
	export interface UploadedFileItem {
		file    : File;
		id      : string;
		preview : string;
		alt     : string;
		isMain  : boolean;
		order   : number;
	}

	interface Props {
		files     : UploadedFileItem[];
		filesInfo : string;
	}

	// ─── Props & Bindings (Svelte 5 Runes) ────────────────────────────────────────
	let { files = $bindable( [] ), filesInfo = $bindable( '' ) }: Props = $props();

	let isDragging = $state( false );


	// ─── File Handling Lógica ─────────────────────────────────────────────────────
	function handleDragOver( e : DragEvent ) : void {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave( ) : void {
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

			// Only allow images for now
			if ( !file.type.startsWith( 'image/' ) ) continue;

			const preview = URL.createObjectURL( file );
			const id      = Math.random().toString( 36 ).substring( 2, 9 );

			// Determine if this is the first main image
			const isMain = updated.length === 0;

			updated.push( {
				file,
				id,
				preview,
				alt     : file.name.split( '.' )[ 0 ] || 'Imagen de catálogo',
				isMain,
				order   : updated.length,
			} );
		}

		files = updated;
		updateFilesInfo();
	}

	function removeFile( id : string ) : void {
		const index = files.findIndex( ( f ) => f.id === id );
		if ( index !== -1 ) {
			const target = files[ index ];
			if ( target ) {
				URL.revokeObjectURL( target.preview );
			}

			const updated = files.filter( ( f ) => f.id !== id );

			// If we deleted the main image, set the first remaining image as main
			if ( target?.isMain && updated.length > 0 ) {
				const first = updated[ 0 ];
				if ( first ) {
					first.isMain = true;
				}
			}

			files = updated;
			updateFilesInfo();
		}
	}

	function setMainImage( id : string ) : void {
		files = files.map( ( f ) => ( {
			...f,
			isMain : f.id === id,
		} ) );
		updateFilesInfo();
	}

	function updateFilesInfo( ) : void {
		const info = files.map( ( f ) => ( {
			alt    : f.alt || 'Imagen',
			isMain : f.isMain,
			order  : Number( f.order ) || 0,
		} ) );
		filesInfo = JSON.stringify( info );
	}

	// Clean up object URLs on destroy to prevent memory leaks
	onDestroy( ( ) => {
		files.forEach( ( f ) => URL.revokeObjectURL( f.preview ) );
	} );
</script>

<div class="space-y-4">
	<!-- ─── Drag and Drop Area ────────────────────────────────────────────────── -->
	<div
		role="button"
		tabindex="0"
		ondragover={ handleDragOver }
		ondragleave={ handleDragLeave }
		ondrop={ handleDrop }
		class="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 { isDragging ? 'border-brand bg-brand/10 scale-[1.01] shadow-[0_0_20px_rgba(5,150,105,0.15)]' : 'border-brand/20 bg-card hover:border-brand/40 hover:bg-brand/5' }"
	>
		<!-- Hidden Native Input -->
		<input
			type="file"
			multiple
			accept="image/*"
			onchange={ handleFileSelect }
			class="absolute inset-0 cursor-pointer opacity-0"
			id="file-dropzone-input"
		/>

		<!-- Icon and Prompt -->
		<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand mb-4">
			<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="17 8 12 3 7 8" />
				<line x1="12" y1="3" x2="12" y2="15" />
			</svg>
		</div>

		<h3 class="font-display text-sm font-bold text-text mb-1">
			Arrastra tus imágenes aquí o haz clic para buscar
		</h3>
		<p class="text-text-muted">
			Soporta archivos PNG, JPG, JPEG, WEBP y AVIF (máx. 10MB)
		</p>
	</div>

	<!-- ─── Uploaded Files Metadata List ─────────────────────────────────────── -->
	{#if ( files.length > 0 ) }
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h4 class="font-display font-black uppercase tracking-wider text-text-muted">
					Imágenes a subir ({ files.length })
				</h4>
				<span class="text-[10px] text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full">
					Formatos de precisión
				</span>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each files as item ( item.id ) }
					<div class="flex flex-col gap-3 rounded-xl border border-brand/10 bg-card p-3 shadow-card transition-all duration-300 hover:border-brand/20">
						<div class="flex gap-3">
							<!-- Thumbnail Preview -->
							<div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brand/15 bg-input">
								<img src={ item.preview } alt={ item.alt } class="h-full w-full object-cover" />
							</div>

							<!-- Controls & Info -->
							<div class="flex-1 min-w-0 space-y-1">
								<p class="text-[10px] text-text-muted font-bold truncate">
									{ item.file.name } ({ ( item.file.size / 1024 / 1024 ).toFixed( 2 ) } MB)
								</p>
								<div class="flex items-center gap-2">
									<!-- Set Main Radio -->
									<label class="flex items-center gap-1.5 cursor-pointer select-none">
										<input
											type="radio"
											name="main-image-radio"
											checked={ item.isMain }
											onchange={ ( ) => setMainImage( item.id ) }
											class="accent-brand h-3.5 w-3.5 cursor-pointer"
										/>
										<span class={ item.isMain ? 'text-brand font-bold' : 'text-text-muted' }>
											Principal
										</span>
									</label>
								</div>
							</div>

							<!-- Delete Button -->
							<button
								type="button"
								onclick={ ( ) => removeFile( item.id ) }
								class="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white"
								title="Eliminar imagen"
							>
								<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<!-- Metadata inputs (Alt, Order) -->
						<div class="grid grid-cols-3 gap-2 border-t border-brand/5 pt-2.5">
							<div class="col-span-2">
								<label for="alt-{ item.id }" class="sr-only">Texto alternativo</label>
								<input
									id="alt-{ item.id }"
									type="text"
									placeholder="Texto Alt (SEO)"
									bind:value={ item.alt }
									oninput={ updateFilesInfo }
									class="w-full rounded-lg border border-brand/15 bg-input px-2.5 py-1 text-text outline-none transition-colors duration-200 focus:border-brand focus:bg-card"
								/>
							</div>

							<div>
								<label for="order-{ item.id }" class="sr-only">Orden</label>
								<input
									id="order-{ item.id }"
									type="number"
									min="0"
									placeholder="Orden"
									bind:value={ item.order }
									oninput={ updateFilesInfo }
									class="w-full rounded-lg border border-brand/15 bg-input px-2.5 py-1 text-text outline-none transition-colors duration-200 focus:border-brand focus:bg-card"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
