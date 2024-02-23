<script lang="ts">
	import TrackContainer from '$components/trackContainer.svelte';
	import { modeUserPrefers } from '@skeletonlabs/skeleton';
	import { IconSearch } from '@tabler/icons-svelte';

	$: url = '';
	$: valid = false;
	$: loaded = 0;

	async function checkLink() {
		const regex = url.match(/spotify.com\/(.+)\/([^?]+)/i);
		if (regex) {
			valid = true;
			loaded++;
		}
	}
</script>

<div>
	<!-- heading -->
	<div class="flex align-middle justify-center text-3xl py-12">Enter url</div>

	<!-- Submit form class -->
	<div class="input-group input-group-divider grid-cols-[1fr_auto] border border-primary-300-600-token pl-2 mb-2">
		<input
			type="text"
			placeholder="Track, album or playlist url..."
			bind:value={url}
			on:keypress={checkLink}
			on:input={() => {
				valid = false;
			}}
			class="py-2 pl-2 outline-none"
		/>

		<a href="/" title="Click to perform search">
			<button on:click={checkLink}><IconSearch color={$modeUserPrefers ? 'black' : 'white'} /></button>
		</a>
	</div>

	<div>
		<!-- List all tracks -->
		{#key loaded}
			{#if loaded > 0}
				<TrackContainer {url} valid />
			{/if}
		{/key}

		{#if !loaded}
			<div class="flex flex-col mt-10 gap-3">
				<div class="flex flex-col">
					<span class="font-medium text-xl"># Wait what is uta?</span>
					<span class="text-surface-300"
						><span class="text-primary-500">Uta</span> is a free to use application which you can use to download songs from spotify!</span
					>
				</div>
				<div class="flex flex-col">
					<span class="font-medium text-xl"># How do I use Uta?</span>
					<span class="text-surface-300"
						>Simply go to Spotify &gt Share &gt Copy Song Link &gt Paste the link to the search bar above and voila! Uta currently
						supports track, album and playlists</span
					>
				</div>
			</div>
		{/if}
	</div>
</div>
