import { Server } from 'net';
import { once } from 'events';
import { Server as httpServer } from 'http';

export default async function listen (server: Server, ...args: Partial<Parameters<Server['listen']>>): Promise<string | null> {
	server.listen(...args);
	await once(server, "listening");
	const address = server.address();
	if (typeof address === 'string' || address === null) {
		return address
	} else {
		let protocol
		if (server instanceof httpServer) protocol = 'http'
		else if (server instanceof Server) protocol = 'tcp'
		else protocol = 'https'
		const { address: hostname, port } = address
		return new URL(
			`${protocol}://${hostname === '::' ? '[::]' : hostname}:${port}`
		).toString()
	}
}
