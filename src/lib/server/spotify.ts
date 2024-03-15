import play from 'play-dl';
import axios from 'axios';
import { PassThrough } from 'stream';
import yt_dlp from '$lib/server/yt-dlp';
import { access, unlink } from 'fs/promises';
import { path } from '@ffmpeg-installer/ffmpeg';
import { createReadStream, createWriteStream } from 'fs';
import type { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } from 'play-dl';
import { exec } from 'child_process';

const YT_DLP = new yt_dlp(`${process.cwd()}/binaries/${process.platform == 'win32' ? 'yt-dlp.exe' : 'yt-dlp_linux'}`);
type SpotifyType = 'track' | 'playlist' | 'album' | undefined;

export default class Spotify {
	id: string = '';
	type: SpotifyType;
	name: string = '';
	valid: boolean = false;
	album?: {
		name: string;
		id: string;
		release_date: string;
		release_date_precision: string;
	};
	tracks: SpotifyTrack[] = [];

	constructor(private url: string) {
		const sanctioned = this.url.match(/spotify.com\/(.+)\/([^?]+)/i);

		if (sanctioned) {
			this.type = sanctioned[1] as SpotifyType;
			this.id = sanctioned[2];
			this.valid = true;
		}
	}
	async getTracks(): Promise<this> {
		try {
			const url = `https://open.spotify.com/${this.type}/${this.id}`;

			if (play.is_expired()) {
				await play.refreshToken();
			}

			const spotify = await play.spotify(url);

			this.name = spotify.name;
			switch (spotify.type) {
				case 'track':
					this.tracks = [spotify as SpotifyTrack];
					break;
				case 'playlist':
					this.tracks = await (spotify as SpotifyPlaylist).all_tracks();
					break;
				case 'album':
					this.tracks = await (spotify as SpotifyAlbum).all_tracks();
					break;
				default:
					break;
			}

			if (spotify.type == 'album') {
				const { name, id, release_date, release_date_precision, url, total_tracks } = spotify as SpotifyAlbum;
				this.tracks.forEach((track) => {
					track.thumbnail = spotify.thumbnail;
					track.album = { name, id, release_date, release_date_precision, url, total_tracks };
				});
			}

			return new Promise((resolve, reject) => {
				if (this.tracks.length != 0) {
					resolve(this);
				} else {
					reject({
						message: 'An error occured',
						error: 'No tracks were found'
					});
				}
			});
		} catch (error) {
			throw new Error('404');
		}
	}

	static async getURL(url: string): Promise<string> {
		try {
			const linkData = {
				type: '',
				id: ''
			};
			const sanctioned = url.match(/spotify.com\/(.+)\/([^?]+)/i);

			if (sanctioned) {
				linkData.type = sanctioned[1];
				linkData.id = sanctioned[2];
			}

			if (linkData.type != 'track') {
				throw new Error('Only track urls are supported!');
			}
			const sp = await axios.get(url);
			const info = /<script id="initial-state" type="text\/plain">(.*?)<\/script>/s.exec(sp.data);

			const spData = JSON.parse(Buffer.from(decodeURIComponent(info![1]), 'base64').toString('utf8'));
			const spTrk = spData.entities.items[`spotify:${linkData.type}:${linkData.id}`];
			const artists =
				spTrk.otherArtists.items.length == 0
					? spTrk.firstArtist.items[0].profile.name
					: spTrk.firstArtist.items[0].profile.name +
						', ' +
						spTrk.otherArtists.items.map((i: { profile: { name: string } }) => i?.profile?.name).join(', ');

			const yt = await play.search(`${spTrk.name} - ${artists}`, {
				limit: 1
			});

			return yt[0].id as string;
		} catch (err) {
			throw new Error(err as string);
		}
	}

	static async stream(data: SpotifyTrack) {
		const id = await Spotify.getURL(data.url);
		if (!id) {
			throw new Error(`Could not resolve an id for ${data.name}`);
		}

		const streamBuffer = new PassThrough();

		try {
			const { name, artists, album, thumbnail } = data;

			const fileName = `${process.cwd()}/content/${id}`;

			axios
				.get(thumbnail!.url, {
					responseType: 'stream'
				})
				.then((x) => x.data.pipe(createWriteStream(`${fileName}.jpeg`)));

			YT_DLP.execPromise([
				`https://www.youtube.com/watch?v=${id}`,
				'--no-part',
				'--no-playlist',
				'-f',
				'm4a',
				'-o',
				`${fileName}.m4a`
			]).then(() => {
				exec(
					path +
						' ' +
						[
							`-i ${fileName}.m4a`,
							`-i ${fileName}.jpeg`,
							'-y',
							'-map 0',
							'-map 1',
							'-c copy',
							'-metadata:s:v title="Album cover"',
							'-metadata:s:v comment="Cover (Front)"',
							'-disposition:v:0 attached_pic',
							`-metadata title="${name}"`,
							`-metadata artist="${artists[0].name}"`,
							// `artist="${artists.map((x) => x.name).join('\\\\')}"`,
							`-metadata album="${album?.name}"`,
							`-metadata album_artist="${artists[0].name}"`,
							`-metadata date=${album?.release_date.split('-')[0]}`,
							`${fileName}.out.m4a`
						].join(' ')
				)
					.on('spawn', () => {
						console.log('Spawned ffmpeg');
					})
					.on('close', async () => {
						try {
							await access(`${fileName}.out.m4a`);
							createReadStream(`${fileName}.out.m4a`).pipe(streamBuffer);
						} catch {
							// Ignore, user aborted
						}
					})
					.on('error', (err) => {
						console.error('Error adding metadata:', err);
						return Promise.reject(err);
					});
			});

			streamBuffer.on('close', async () => {
				try {
					await unlink(`${fileName}.jpeg`);
					await unlink(`${fileName}.m4a`);
					await unlink(`${fileName}.out.m4a`);
				} catch {
					// Ignore file deletion
				}
			});
		} catch (err) {
			return Promise.reject(err);
		}

		return Promise.resolve(streamBuffer);
	}
}
