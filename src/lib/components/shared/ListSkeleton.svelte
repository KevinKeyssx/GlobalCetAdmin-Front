<script lang="ts">
	interface Props {
		columns : number;
		rows?   : number;
	}

	let { columns, rows = 5 } : Props = $props();
</script>

{#each Array.from( { length : rows } ) as _, rowIndex}
	<tr class="animate-pulse border-b border-brand/10 last:border-0 hover:bg-transparent">
		{#each Array.from( { length : columns } ) as _, colIndex}
			<td class="px-6 py-4">
				{#if ( colIndex === 0 )}
					<!-- Image placeholder -->
					<div class="h-10 w-10 rounded-lg bg-brand/10"></div>
				{:else if ( colIndex === columns - 1 )}
					<!-- Actions placeholder -->
					<div class="flex justify-end gap-2">
						<div class="h-8 w-8 rounded-lg bg-brand/10"></div>
						<div class="h-8 w-8 rounded-lg bg-brand/10"></div>
					</div>
				{:else}
					<!-- Text lines placeholder -->
					<div class="space-y-2">
						<div class="h-4 bg-brand/10 rounded-sm { colIndex % 2 === 0 ? 'w-24' : 'w-32' }"></div>
						{#if ( colIndex === 2 )}
							<div class="h-3 bg-brand/5 rounded-sm w-48"></div>
						{/if}
					</div>
				{/if}
			</td>
		{/each}
	</tr>
{/each}
