import { format } from 'url';
import { Server } from 'net';

export default function listen(server: Server, ...args: any[]): Promise<string> {
	return new Promise((resolve, reject) => {
		function cleanup() {
			server.removeListener('error', onError);
		}
		function onError(err: Error) {
			cleanup();
			reject(err);
		}
		args.push(
			(err: Error): void => {
				cleanup();
				if (err) return reject(err);
				const address = server.address();
				if (typeof address === 'string') {
					resolve(address);
				} else {
					// TODO: detect protocol type based on `server` shape
					const protocol = 'http:';
					const { address: hostname, port } = address;
					const url = format({ protocol, hostname, port });
					resolve(url);
				}
			}
		);
		server.on('error', onError);
		try {
			server.listen(...args);
		} catch (err) {
			onError(err);
		}
	});
}
