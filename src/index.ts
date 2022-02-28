import { Server } from 'net';
import { once } from 'events';
import http from 'http';
import https from 'https';

export default async function listen (server: Server, ...args: Partial<Parameters<Server['listen']>>): Promise<URL | string | null> {
	server.listen(...args);
	await once(server, "listening");
	const address = server.address();
	if (typeof address === 'string' || address === null) {
		return address
	} else {
		let protocol
		if (server instanceof http.Server) protocol = 'http'
		else if (server instanceof https.Server) protocol = 'https'
		else if (server instanceof Server) protocol = 'tcp'
		const { address: hostname, port } = address
		return new URL(
			`${protocol}://${hostname === '::' ? '[::]' : hostname}:${port}`
		)
	}
}
