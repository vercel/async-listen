import * as net from 'net';
import * as http from 'http';
import * as https from 'https';
import { resolve } from 'path';
import { EventEmitter, once } from 'events';
import type { OverloadedParameters } from './overloaded-parameters';

export interface ServerLike extends EventEmitter {
	listen: (...args: any[]) => any;
	address: net.Server['address'];
	protocol?: string;
}

const getProtocol = (server: ServerLike) => {
	if (typeof server.protocol === 'string') return server.protocol;
	if (server instanceof http.Server) return 'http';
	if (server instanceof https.Server) return 'https';
};

export async function listen<Server extends ServerLike>(
	server: Server,
	...args: OverloadedParameters<Server['listen']>
): Promise<URL> {
	server.listen(...args, () => {});
	await once(server, 'listening');
	return endpoint(server);
}

export function endpoint(server: ServerLike): URL {
	const addressInfo = server.address();

	if (!addressInfo) {
		// `server.address()` returns `null` before the `'listening'`
		// event has been emitted or after calling `server.close()`.
		throw new Error('Server not listening');
	}

	let host: string;
	let protocol = getProtocol(server);
	if (typeof addressInfo === 'string') {
		// For a server listening on a pipe or Unix domain socket,
		// the name is returned as a string.
		host = encodeURIComponent(resolve(addressInfo));
		if (protocol) {
			protocol += '+unix';
		} else {
			protocol = 'unix';
		}
	} else {
		// Bound to a TCP port.
		const { address, port, family } = addressInfo;
		host = family === 'IPv6' ? `[${address}]` : address;
		host += `:${port}`;
		if (!protocol) {
			protocol = 'tcp';
		}
	}

	return new URL(`${protocol}://${host}`);
}

export default listen;
