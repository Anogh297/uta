<script lang="ts">
	export let url: string;
	export let data: SpotifyTrack;

	import type { SpotifyTrack } from 'play-dl';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import axios from 'axios';
	import { ID3Writer } from 'browser-id3-writer';
	import { IconDownload, IconFileDownload } from '@tabler/icons-svelte';
	import { modeUserPrefers, type ConicStop, ConicGradient } from '@skeletonlabs/skeleton';
	import { addTracks, downloadAll, speed, fastMode } from '$lib/stores/tracks';
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

	const conicStops: ConicStop[] = [
		{ color: 'transparent', start: 0, end: 25 },
		{ color: 'rgb(var(--color-primary-500))', start: 75, end: 100 }
	];

	async function download() {
		if (!button.anchor) {
			if (state !== 'init') return;

			const fast = get(fastMode);

			state = 'loading';
			text = 'Waiting...';

			let x = 0;
			const interval = setInterval(() => {
				text = `Waiting${'.'.repeat((x % 3) + 1)}${'\xa0'.repeat(2 - (x % 3))}`;
				x++;
				return;
			}, 500);

			const image = await axios.get(data.thumbnail?.url as string, {
				responseType: 'blob'
			});
			const res = await axios.get('/api/download', {
				params: {
					url,
					fast
				},
				responseType: 'arraybuffer',
				onDownloadProgress: function ({ rate }) {
					speed.set(`${(((rate || 0) * 8) / 1000000).toFixed(2)}`);
					clearInterval(interval);
					text = `Downloading (${$speed} mb/s)`;
				}
			});

			let buffer = res.data;

			if (!fast) {
				const writer = new ID3Writer(res.data);
				writer
					.setFrame('TIT2', data.name)
					.setFrame(
						'TPE1',
						data.artists.map((x) => x.name)
					)
					.setFrame('TPE2', data.artists[0].name)
					.setFrame('TALB', data.album?.name)
					.setFrame('TYER', data.album?.release_date)
					.setFrame('TLEN', data.durationInMs)
					.setFrame('APIC', {
						type: 3,
						data: await image.data.arrayBuffer(),
						description: 'Cover',
						useUnicodeEncoding: true
					});
				writer.addTag();

				buffer = writer.arrayBuffer as ArrayBuffer;
			}
			speed.set('0');
			state = 'finished';

			const anchor = document.createElement('a');
			const blob = new Blob([buffer], { type: 'audio/mpeg' });

			anchor.href = URL.createObjectURL(blob);
			anchor.download = `${data.artists[0].name} - ${data.name}${fast ? '.m4a' : '.mp3'}`.replace(/[\/\\*:?<>\|]/g, '');

			document.body.appendChild(anchor);
			text = $downloadAll ? 'Saved!' : 'Save';

			if (!$downloadAll) saveAs(blob, anchor.download);

			Object.assign(button, { anchor });
			return Promise.resolve(button);
		} else {
			button.anchor.click();
		}
	}
</script>

<div>
	<button
		type="button"
		on:click={download}
		bind:this={button}
		{disabled}
		class="btn rounded-full {disabled ? 'variant-filled-error' : 'variant-ghost-success hover:variant-ghost-primary'}"
	>
		<div class="flex align-middle">
			<div class="hidden sm:block pr-1.5">
				{text}
			</div>

			{#if window.screen.width < 640 && $speed != '0' && state == 'loading'}
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
