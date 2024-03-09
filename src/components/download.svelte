<script lang="ts">
	export let data: SpotifyTrack;

	import type { SpotifyTrack } from 'play-dl';
	import { onMount } from 'svelte';

	import axios from 'axios';
	import { IconDownload, IconFileDownload } from '@tabler/icons-svelte';
	import { modeUserPrefers, type ConicStop, ConicGradient } from '@skeletonlabs/skeleton';
	import { addTracks, downloadAll } from '$lib/stores/tracks';
	import saveAs from 'file-saver';

	let button: DownloadButton;
	onMount(() => {
		addTracks([button]);
		Object.assign(button, { download });
	});

	let text = 'Download';

	type State = 'init' | 'loading' | 'finished';
	$: state = 'init' as State;
	$: disabled = false;
	$: speed = '0';

	const conicStops: ConicStop[] = [
		{ color: 'transparent', start: 0, end: 25 },
		{ color: 'rgb(var(--color-primary-500))', start: 75, end: 100 }
	];

	async function download() {
		let interval: NodeJS.Timeout;
		try {
			if (!button.anchor) {
				if (state !== 'init') return;

				state = 'loading';
				text = 'Waiting...';

				let x = 0;
				interval = setInterval(() => {
					text = `Waiting${'.'.repeat((x % 3) + 1)}${'\xa0'.repeat(2 - (x % 3))}`;
					x++;
					return;
				}, 500);

				const res = await axios.get('/api/download', {
					params: {
						data: JSON.stringify(data)
					},
					responseType: 'arraybuffer',
					onDownloadProgress: function ({ rate }) {
						speed = `${(((rate || 0) * 8) / 1000000).toFixed(2)}`;
						clearInterval(interval);
						text = `Downloading (${speed} mb/s)`;
					}
				});

				let buffer = res.data;
				state = 'finished';

				const anchor = document.createElement('a');
				const blob = new Blob([buffer], { type: 'audio/mp4' });

				anchor.href = URL.createObjectURL(blob);
				anchor.download = `${data.artists[0].name} - ${data.name}`.replace(/[\/\\*:?<>\|]/g, '');

				document.body.appendChild(anchor);
				text = $downloadAll ? 'Saved!' : 'Save';

				if (!$downloadAll) saveAs(blob, anchor.download);

				Object.assign(button, { anchor });
				return Promise.resolve(button);
			} else {
				button.anchor.click();
			}
		} catch {
			disabled = true;
			if (interval!) clearInterval(interval);
			state = 'finished';
			text = 'Failed';
		}
	}
</script>

<div>
	<button
		type="button"
		on:click={download}
		bind:this={button}
		{disabled}
		class="btn rounded-full {disabled ? 'variant-ghost-error' : 'variant-ghost-success hover:variant-ghost-primary'}"
	>
		<div class="flex align-middle">
			<div class="hidden sm:block pr-1.5">
				{text}
			</div>

			{#if window.screen.width < 640 && speed != '0' && state == 'loading'}
				{text.slice(12)}
			{/if}

			{#if state == 'init'}
				<div class="py-0.5">
					<IconDownload color={$modeUserPrefers ? 'black' : 'white'} size={21} />
				</div>
			{/if}

			{#if state == 'loading'}
				<div class="pl-1 py-0.5">
					<ConicGradient stops={conicStops} width="w-5" spin size={21} />
				</div>
			{/if}

			{#if state == 'finished'}
				<div class="py-0.5">
					<IconFileDownload color={$modeUserPrefers ? 'black' : 'white'} size={21} />
				</div>
			{/if}
		</div>
	</button>
</div>
