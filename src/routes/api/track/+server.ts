import { error, json } from '@sveltejs/kit';
import { URL } from 'url';
import App from '$lib/server/spotify';

export async function GET({ request }) {
	try {
		const { searchParams } = new URL(request.url);
		const url = searchParams.get('url');
		if (!url) return error(418, 'Please provide a valid spotify url.');

		const regex = url.match(/spotify.com\/(.+)\/([^?]+)/i);
		if (!regex) return error(400, 'Invalid url provided');

		if (url && regex) {
			const spotify = new App(url);
			return json(await spotify.getTracks());
		}
	} catch {
		return error(500, 'Unknown error occured');
	}
}
