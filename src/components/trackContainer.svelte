<script lang="ts">
	export let url = 'https://open.spotify.com/playlist/70slHSn0cnlN8TAJ1hDA5s';
	export let valid = false;

	import axios from 'axios';
	import type { SpotifyTrack } from 'play-dl';
	import Track from '$components/track.svelte';
	import DownloadAll from '$components/downloadAll.svelte';
	import { filename } from '$lib/stores/tracks';

	let tracks: SpotifyTrack[] = [];
	const promise = (async (): Promise<typeof tracks> => {
		try {
			const res = await axios.get('/api/track', {
				params: {
					url
				}
			});
			$filename = res.data.name;
			const {
				data: { tracks: trackList }
			} = res;
			return (tracks = tracks.concat(trackList));
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
			<DownloadAll />
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
