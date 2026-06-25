<script lang="ts">
	import { Pagination as BitsPagination } from 'bits-ui';
	import { ChevronLeft, ChevronRight }    from '@lucide/svelte';

    import SoftSelect from './Inputs/SoftSelect.svelte';


	interface Props {
		count	: number;
		perPage	: number;
		page	: number;
	}


    let {
		count,
		perPage = $bindable( 9 ),
		page    = $bindable( 1 ),
	}: Props = $props();


    const sizeOptions = [
		{
			id		: '12',
			name	: '12',
		},
		{
			id		: '24',
			name	: '24',
		},
		{
			id		: '48',
			name	: '48',
		},
		{
			id		: '96',
			name	: '96',
		},
	];


    let sizeStr = $state( perPage.toString() );


    $effect( ( ) => {
		const parsed = Number( sizeStr );

		if ( perPage !== parsed ) {
			perPage = parsed;
		}
	});


    $effect( ( ) => {
		const str = perPage.toString();

		if ( sizeStr !== str ) {
			sizeStr = str;
		}
	});
</script>

<div class="grid lg:flex items-center justify-center lg:justify-between space-y-4 mt-4 lg:mt-8 pt-4 border-t border-brand/10 w-full">
	<!-- Page Size Selector -->
	<div class="flex items-center gap-2 text-sm font-semibold text-text-muted mx-auto lg:mx-0">
		<span>Mostrar:</span>

        <div class="w-16">
			<SoftSelect
				options={ sizeOptions }
				bind:value={ sizeStr }
				placeholder="Size"
			/>
		</div>

        <span>resultados por página</span>
	</div>

	<!-- Pagination controls -->
	<BitsPagination.Root
		{ count }
		{ perPage }
		bind:page={ page }
	>
		{#snippet children( { pages } )}
			<div class="flex items-center gap-2 justify-center">
				<BitsPagination.PrevButton
					class="
						inline-flex h-9 w-9 items-center justify-center rounded-xl
						border border-brand/10 bg-surface/30 text-text
						transition-all duration-300
						hover:bg-brand/10 hover:text-brand
						disabled:pointer-events-none disabled:opacity-40
					"
				>
					<ChevronLeft class="size-4" />
				</BitsPagination.PrevButton>

				{#each pages as p ( p.key )}
					{#if p.type === 'ellipsis'}
						<span class="inline-flex h-9 w-9 items-center justify-center text-xs font-bold text-text-muted">...</span>
					{:else}
						<BitsPagination.Page
							page={ p }
							class="
								inline-flex h-9 w-9 items-center justify-center rounded-xl
								border border-brand/10 bg-surface/30 text-xs font-bold text-text-muted
								transition-all duration-300
								hover:bg-brand/10 hover:text-brand
								data-selected:bg-brand data-selected:text-surface-dark data-selected:border-brand data-selected:shadow-md
							"
						>
							{ p.value }
						</BitsPagination.Page>
					{/if}
				{/each}

				<BitsPagination.NextButton
					class="
						inline-flex h-9 w-9 items-center justify-center rounded-xl
						border border-brand/10 bg-surface/30 text-text
						transition-all duration-300
						hover:bg-brand/10 hover:text-brand
						disabled:pointer-events-none disabled:opacity-40
					"
				>
					<ChevronRight class="size-4" />
				</BitsPagination.NextButton>
			</div>
		{/snippet}
	</BitsPagination.Root>
</div>
