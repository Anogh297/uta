<script lang="ts">
	import TrackContainer from '$components/trackContainer.svelte';
	import { modeUserPrefers } from '@skeletonlabs/skeleton';
	import { IconSearch } from '@tabler/icons-svelte';

	$: url = '';
	$: valid = false;
	$: loaded = 0;

	function checkLink() {
		url = url.trim();

		const regex = url.match(/spotify.com\/(.+)\/([^?])/i);
		if (regex) {
			valid = true;
			loaded++;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			checkLink();
		}
	}
</script>

<div>
	<!-- heading -->
	<div class="flex align-middle justify-center text-2xl md:text-3xl py-12">Enter url</div>

	<!-- Submit form class -->
	<div class="input-group input-group-divider grid-cols-[1fr_auto] border border-primary-300-600-token pl-2 mb-2">
		<input
			type="text"
			placeholder="Track, album or playlist url..."
			bind:value={url}
			on:keypress={handleKeyDown}
			class="py-2 pl-2 outline-none"
		/>
		<!-- on:input={() => {
				valid = false;
			}} -->

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
					<span class="font-medium text-base sm:text-xl"># Wait what is uta?</span>
					<span class="text-surface-600-300-token text-sm sm:text-base pl-4">
						<span class="text-primary-500">Uta</span> is a convenient and free application designed for downloading songs from Spotify
						hassle-free.
					</span>
				</div>

				<div class="flex flex-col">
					<span class="font-medium text-base sm:text-xl"># How do I use Uta?</span>
					<span class="text-surface-600-300-token text-sm sm:text-base pl-4">
						To utilize Uta, navigate to Spotify, select the desired song, album, or playlist, then click 'Share' followed by 'Copy
						Song Link'. Next, paste the link into Uta's search bar, and instantly access your preferred music for download. With
						support for tracks, albums, and playlists, Uta ensures a seamless experience for all your musical needs.
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>
