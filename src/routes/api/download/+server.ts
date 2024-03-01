import { error } from '@sveltejs/kit';
import App from '$lib/server/spotify';
import { Readable } from 'stream';

export async function GET({ request }) {
	try {
		const { searchParams } = new URL(request.url);
		const url = searchParams.get('url');
		const fast = searchParams.get('fast');

		if (!url) return error(404, 'Please provide a valid spotify url.');

		const regex = url.match(/spotify.com\/(.+)\/([^?]+)/i);
		if (!regex) return error(404, 'Invalid url provided');

		if (url && regex) {
			const stream = (await App.stream(url, fast as string)) as Readable;

			return new Response(Readable.toWeb(stream) as never, {
				headers: {
					'Content-Type': 'audio/mp4',
					'Transfer-Encoding': 'chunked'
				}
			});
		}
	} catch (err) {
		error(403, `${err}`);
	}
}
