import test from 'ava';
import listen from './src';
import * as assert from 'assert';
import { createServer, isIPv4, isIPv6 } from 'net';

test('No arguments', async () => {
	const server = createServer();
	const address = await listen(server);
	const match = /^http\:\/\/(.+)\:\d+$/.exec(address);
	assert(match);
	if (match) {
		let [_, host] = match;
		if (/\[.+\]/.test(host)) {
			assert(isIPv6(host.substring(1, host.length - 1)));
		} else {
			assert(isIPv4(host.substring(1, host.length - 1)));
		}
	}
});

test('EADDRINUSE is thrown', async () => {
	let err: NodeJS.ErrnoException | null = null;
	const port = 63971;
	const server = createServer();
	const address = await listen(server, port);

	const server2 = createServer();
	try {
		const address2 = await listen(server2, port);
	} catch (_err) {
		err = _err;
	}
	assert(err);
	assert.equal(err && err.code, 'EADDRINUSE');
});
