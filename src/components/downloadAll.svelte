<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { downloadAll, tracks, clearTracks, speed, filename } from '$lib/stores/tracks';
	import JSZip from 'jszip';
	import saveAs from 'file-saver';
	import axios from 'axios';
	import { onDestroy } from 'svelte';

	const zip = new JSZip();
	let file: Blob;

	$: i = 0;
	$: text = '';
	$: buttonText = 'Download all';
	$: cancel = false;
	$: classes = `variant-ghost-success hover:variant-ghost-primary`;

	onDestroy(async () => {
		$downloadAll = false;
		clearTracks();
	});

	async function click() {
		if (file) {
			return saveAs(file, $filename);
		}

		if (buttonText == 'Download all') $downloadAll = true;
		switch (buttonText) {
			case 'Download all':
				$downloadAll = true;
				classes = 'variant-ghost-error';
				break;
			case 'Cancel download':
				buttonText = 'Cancelling download...';
				cancel = true;

			default:
				break;
		}

		let x = 0;

		const interval = setInterval(() => {
			text =
				`Downloading${'.'.repeat((x % 3) + 1)}${'\xa0'.repeat(2 - (x % 3))} ` + `${i + 1} / ${$tracks.length} @ ${$speed} mb/s`;
			x++;
			return;
		}, 500);

		buttonText = 'Cancel download';

		for (i; i <= $tracks.length; i++) {
			if (cancel) {
				window.location.reload();
				break;
			}
			const track = $tracks[i];

			if (!track?.anchor && track.download) await track.download();

			if (track.anchor) {
				const blob = await axios.get(track.anchor.href, { responseType: 'arraybuffer' });
				zip.file(track.anchor.download, blob.data);
				track.disabled = true;
				URL.revokeObjectURL(track.anchor.href);
			}

			if (i + 1 == $tracks.length) {
				file = await zip.generateAsync({ type: 'blob' });
				i++;
				text = `Downloaded ${i} of ${$tracks.length} tracks!`;
				buttonText = `Click to save!`;
				classes = 'variant-ghost-success hover:variant-ghost-primary';
				clearInterval(interval);
				return saveAs(file, $filename);
			}
		}
	}
</script>

<div class="mr-5">
	<div class="flex flex-col">
		<div>
			{#if $downloadAll}
				<div class="text-primary-600 pb-2">{text}</div>
				<ProgressBar value={i} max={$tracks.length} meter={'bg-primary-500'} track={'bg-surface-400'} />
			{/if}
		</div>
		<div class="py-4">
			<button type="button" on:click={click} class="btn rounded-full {classes}">
				{buttonText}
			</button>
		</div>
	</div>
</div>
