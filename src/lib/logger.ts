import chalk from 'chalk';
import type { RequestEvent } from '@sveltejs/kit';

export function log(req: RequestEvent): void {
	const timestamp = new Date();
	const time = `${timestamp.toLocaleTimeString()} ${timestamp.toLocaleDateString()}`;
	const { method } = req.request;
	const ipAddress = req.getClientAddress() || '';

	console.log(`[${chalk.yellow(method)} ${req.route.id}] ${ipAddress} ${chalk.blue(time)}`);
}
