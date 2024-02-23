import play from 'play-dl';
import axios from 'axios';
import type { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum } from 'play-dl';
import yt_dlp from '$lib/server/yt-dlp';
import { PassThrough } from 'stream';

const YT_DLP = new yt_dlp(`${process.cwd()}/${process.platform == 'win32' ? 'yt-dlp.exe' : 'yt-dlp_linux'}`);
type SpotifyType = 'track' | 'playlist' | 'album' | undefined;

export default class Spotify {
	id: string = '';
	type: SpotifyType;
	name: string = '';
	valid: boolean = false;
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

	static async getDownloadURL(url: string): Promise<string> {
		try {
			const id = await Spotify.getURL(url);

			if (!id) {
				throw new Error('Not found');
			}
			const output = await YT_DLP.execPromise([`https://www.youtube.com/watch?v=${id}`, '--get-url', '--no-playlist']);
			return output;
		} catch (err) {
			throw new Error(`${err}`);
		}
	}

	static async stream(url: string /* metadata: Metadata */) {
		try {
			const id = await Spotify.getURL(url);

			if (!id) {
				throw new Error('Not found');
			}

			const streamBuffer = new PassThrough();

			const yt_stream = YT_DLP.execStream([`https://www.youtube.com/watch?v=${id}`, '--no-part', '--no-playlist', '-f', 'm4a']);
			yt_stream.pipe(streamBuffer);

			return new Promise((resolve) => {
				resolve(streamBuffer);
			});
		} catch (err) {
			return;
		}
	}
}