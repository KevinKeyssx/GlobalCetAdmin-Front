<script>
	import PoweredButton    from "../buttons/PoweredButton.svelte";
	import GitHubButton     from "../buttons/GitHubButton.svelte";
</script>

<footer class="relative overflow-hidden border-t border-brand/20 bg-card/60 px-6 py-8 text-text-muted sm:px-12 backdrop-blur-md">
	<!-- Decorative grid background background -->
	<div class="pointer-events-none absolute inset-0 opacity-[0.02] bg-[radial-gradient(var(--color-brand)_1px,transparent_1px)] bg-size-[16px_16px]"></div>
	<div class="pointer-events-none absolute -bottom-48 left-1/3 h-[400px] w-[400px] rounded-full bg-brand/5 blur-[100px]"></div>

	<div class="relative mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 py-4">
		<!-- Brand Identity -->
		<div class="flex items-center gap-3">
			<div class="flex items-center justify-center rounded-xl transition-all duration-300 hover:border-brand/30 hover:scale-105">
				<img src="/logo/logo2.avif" alt="CET Chile SpA" class="h-32 object-contain" />
			</div>
			<div class="space-y-0.5">
				<h4 class="font-black uppercase tracking-[0.15em] text-brand font-display text-sm">GlobalCET Admin</h4>
				<p class="text-xs text-text-muted font-medium">Panel de Control de Administración</p>
			</div>
		</div>
	</div>

	<!-- ─── Bottom copyright row ────────────────────────────────────────────────── -->
	<div class="mx-auto max-w-7xl text-xs mt-6 pt-3 border-t border-brand/40 dark:border-brand/20 flex flex-col sm:flex-row items-start justify-between gap-4 font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
		<p>© { new Date().getFullYear() } CET Chile SpA / GlobalCET. Todos los derechos reservados.</p>

        <div class="grid sm:flex items-center gap-4">
            <GitHubButton />

            <PoweredButton />
        </div>
	</div>
</footer>
