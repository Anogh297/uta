import { localStorageStore } from '@skeletonlabs/skeleton';
import { writable } from 'svelte/store';

export const speed = writable<string>('0');
export const filename = writable<string>('');
export const tracks = writable<DownloadButton[]>([]);
export const Blobs = writable<Blob[]>([]);
export const downloadAll = writable<boolean>(false);
export const fastMode = localStorageStore('fast', false);

export function clearTracks() {
	tracks.set([]);
}

export function addTracks(newTracks: DownloadButton[]) {
	tracks.update((tracks) => [...tracks, ...newTracks]);
}

export function addBlob(blob: Blob) {
	Blobs.update((blobs) => [...blobs, blob]);
}
