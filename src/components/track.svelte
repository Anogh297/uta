<script lang="ts">
	export let data: SpotifyTrack;
	import Download from '$components/download.svelte';
	const { name, thumbnail, artists, url } = data;

	import { Avatar } from '@skeletonlabs/skeleton';
	import type { SpotifyTrack } from 'play-dl';
</script>

<div
	class="flex min-w-full h-auto my-2 shrink-0 border rounded-[15px] border-solid border-primary-500 bg-primary-50 dark:bg-transparent"
>
	<!-- inner section -->
	<div class="flex flex-grow justify-end m-1">
		<!-- icon -->
		<div class="p-2">
			<Avatar src={thumbnail?.url} width="w-12" rounded="rounded-full" />
		</div>

		<!-- name and artists -->
		<div class="flex flex-col align-middle my-auto">
			<div class="sm:text-sm lg:text-base text-surface-900-50-token">
				{name}
			</div>
			<div class="font-thin text-surface-600-300-token text-sm">
				{artists.map((x) => x.name).join(', ')}
			</div>
		</div>

		<div class="flex align-middle p-3 ml-auto">
			<!-- download button -->
			<Download {url} {data} />
		</div>
	</div>
</div>
