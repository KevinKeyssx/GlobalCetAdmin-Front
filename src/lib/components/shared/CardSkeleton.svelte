<script lang="ts">
	interface Props {
		type : 'item' | 'material' | 'category';
	}

	let { type } : Props = $props();
</script>

{#if ( type === 'item' )}
	<!-- Item Card Skeleton: Products, Kits, Labs -->
	<div class="animate-pulse relative flex h-[410px] flex-col overflow-hidden rounded-2xl border border-brand/10 bg-card shadow-card">
		<!-- Image placeholder -->
		<div class="h-48 w-full bg-brand/5 border-b border-brand/10"></div>
		<!-- Badge placeholder -->
		<div class="absolute left-3 top-3 h-5 w-24 rounded-full bg-brand/15"></div>
		<!-- Actions placeholder -->
		<div class="absolute right-3 top-3 flex gap-1">
			<div class="h-7 w-7 rounded-lg bg-brand/15"></div>
			<div class="h-7 w-7 rounded-lg bg-brand/15"></div>
		</div>
		<!-- Card Body -->
		<div class="flex flex-1 flex-col gap-3.5 p-4 justify-between">
			<div class="space-y-3">
				<!-- Category & SKU -->
				<div class="space-y-1.5">
					<div class="h-3.5 bg-brand/10 rounded w-1/3"></div>
					<div class="h-3 bg-brand/5 rounded w-1/4"></div>
				</div>
				<!-- Title & Description -->
				<div class="space-y-2">
					<div class="h-4.5 bg-brand/10 rounded w-3/4"></div>
					<div class="space-y-1">
						<div class="h-3 bg-brand/5 rounded w-full"></div>
						<div class="h-3 bg-brand/5 rounded w-5/6"></div>
					</div>
				</div>
			</div>
			<!-- Technical specs -->
			<div class="border-t border-brand/10 pt-3.5 h-[92px] space-y-3.5">
				<div class="grid grid-cols-2 gap-3.5">
					<div class="space-y-1.5">
						<div class="h-2.5 bg-brand/10 rounded w-1/2"></div>
						<div class="h-3.5 bg-brand/5 rounded w-3/4"></div>
					</div>
					<div class="space-y-1.5">
						<div class="h-2.5 bg-brand/10 rounded w-1/2"></div>
						<div class="h-3.5 bg-brand/5 rounded w-3/4"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else if ( type === 'material' )}
	<!-- Material Card Skeleton -->
	<div class="animate-pulse relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-5 shadow-card h-56">
		<div class="space-y-3.5">
			<!-- Header -->
			<div class="flex justify-between items-center">
				<div class="h-3.5 bg-brand/10 rounded w-1/4"></div>
				<div class="h-4.5 bg-brand/10 rounded-full w-12"></div>
			</div>
			<!-- Title -->
			<div class="h-5 bg-brand/10 rounded w-1/2"></div>
			<!-- Specs Grid -->
			<div class="grid grid-cols-2 gap-x-4 gap-y-3">
				<div class="space-y-1">
					<div class="h-2.5 bg-brand/10 rounded w-1/3"></div>
					<div class="h-3.5 bg-brand/5 rounded w-1/2"></div>
				</div>
				<div class="space-y-1">
					<div class="h-2.5 bg-brand/10 rounded w-1/3"></div>
					<div class="h-3.5 bg-brand/5 rounded w-1/2"></div>
				</div>
				<div class="space-y-1">
					<div class="h-2.5 bg-brand/10 rounded w-1/3"></div>
					<div class="h-3.5 bg-brand/5 rounded w-1/2"></div>
				</div>
				<div class="space-y-1">
					<div class="h-2.5 bg-brand/10 rounded w-1/3"></div>
					<div class="h-3.5 bg-brand/5 rounded w-1/2"></div>
				</div>
			</div>
		</div>
		<!-- Footer -->
		<div class="border-t border-brand/10 pt-3 flex justify-end gap-2">
			<div class="h-7 w-7 rounded-lg bg-brand/10"></div>
			<div class="h-7 w-7 rounded-lg bg-brand/10"></div>
		</div>
	</div>
{:else}
	<!-- Category Card Skeleton -->
	<div class="animate-pulse relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand/10 bg-card p-5 shadow-card h-44">
		<div class="space-y-3.5">
			<!-- Header -->
			<div class="flex justify-between items-center">
				<div class="h-3.5 bg-brand/10 rounded w-1/3"></div>
				<div class="h-4.5 bg-brand/10 rounded-full w-12"></div>
			</div>
			<!-- Title -->
			<div class="h-5 bg-brand/10 rounded w-2/3"></div>
			<!-- Description/Subcat -->
			<div class="h-3.5 bg-brand/5 rounded w-1/2"></div>
		</div>
		<!-- Footer Actions -->
		<div class="border-t border-brand/10 pt-3 flex justify-end gap-2">
			<div class="h-7 w-7 rounded-lg bg-brand/10"></div>
			<div class="h-7 w-7 rounded-lg bg-brand/10"></div>
		</div>
	</div>
{/if}
