<script lang="ts">
	export let url: string;
	export let valid = false;

	import axios from 'axios';
	import type { SpotifyTrack } from 'play-dl';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import Track from '$components/track.svelte';
	import DownloadAll from '$components/downloadAll.svelte';
	import { filename, fastMode, downloadAll } from '$lib/stores/tracks';

	let tracks: SpotifyTrack[] = [];
	const promise = (async (): Promise<typeof tracks> => {
		try {
			const res = await axios.get('/api/track', {
				params: {
					url: url.trim()
				}
			});

			$filename = res.data.name;
			const {
				data: { tracks: trackList }
			} = res;
			tracks = tracks.concat(trackList);
			return tracks;
		} catch (error) {
			throw new Error('404');
		}
	})();
</script>

<div class="flex flex-col pt-2 justify-center align-top">
	{#if valid}
		{#await promise}
			Loading...
		{:then tracks}
			<div class="flex justify-between">
				<div class={$downloadAll ? 'grow' : ''}>
					<DownloadAll />
				</div>

				{#if !$downloadAll}
					<div class="flex justify-between items-center mr-5">
						<span class="pr-2 text-xs md:text-sm lg:text-base">
							{$fastMode ? 'M4A <Fast mode enabled>' : 'MP3 <Rich mode enabled>'}
						</span>
						<SlideToggle name="slide" bind:checked={$fastMode} />
					</div>
				{/if}
			</div>

			{#each tracks as track}
				<Track data={track} />
			{/each}
		{:catch}
			<div class="bg-red-600 mt-5">The url you provided is not a valid spotify url</div>
		{/await}
	{:else}
		<div class="bg-red-600 mt-5">That didn't quite work. Make sure you are putting a valid spotify url</div>
	{/if}
</div>
