import { once } from 'events';
import https from 'https';
import http from 'http';
import net from 'net';

const protocol = (server: http.Server | https.Server | net.Server) => {
	if (server instanceof http.Server) return 'http'
	if (server instanceof https.Server) return 'https'
	if (server instanceof net.Server) return 'tcp'
}

export default async function listen(server: net.Server, ...args: Partial<Parameters<net.Server['listen']>>): Promise<URL | string | null> {
	server.listen(...args);
	await once(server, "listening");
	const addressInfo = server.address();
	if (typeof addressInfo === 'string' || addressInfo === null) return addressInfo
	const { address, port, family } = addressInfo
	const hostname = family === 'IPv6' ? `[${address}]` : address
	return new URL(`${protocol(server)}://${hostname}:${port}/`)
}
