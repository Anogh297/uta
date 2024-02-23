import type { Handle } from '@sveltejs/kit';
import { log } from '$lib/logger';

export const handle: Handle = async ({ event, resolve }) => {
	log(event);
	return await resolve(event);
};
