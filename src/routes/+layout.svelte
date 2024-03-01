<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, Avatar, LightSwitch } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<!-- App Shell -->
<div class="px-[5%] pt-4 sm:px-[20%] h-screen">
	<AppShell>
		<svelte:fragment slot="header">
			<!-- App Bar -->

			<AppBar background="bg-none">
				<svelte:fragment slot="lead">
					<Avatar src={'/logo.svg'} width="w-8" rounded="rounded-full" />
				</svelte:fragment>
				<div class="font-bold text-base sm:text-xl md:text-2xl bg-clip-text text-transparent gradient-heading">
					<a href="/">Uta - Spotify downloader</a>
				</div>
				<svelte:fragment slot="trail">
					<LightSwitch ring="ring-[1px] ring-surface-500/30" fillDark="fill-surface-900" bgDark="bg-secondary-400" />
				</svelte:fragment>
			</AppBar>
		</svelte:fragment>
		<!-- Page Route Content -->
		<slot />
		<footer class="p-4 text-center w-full mt-auto">
			<p class="text-sm">© 2024 Uta made by Anogh with ❤️</p>
		</footer>
	</AppShell>
</div>
