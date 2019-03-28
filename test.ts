import test from 'ava';
import listen from './src';
import * as assert from 'assert';
import { createServer, isIPv4, isIPv6 } from 'net';

test('No arguments', async t => {
	const server = createServer();
	const address = await listen(server);
	const match = /^http\:\/\/(.+)\:\d+$/.exec(address);
	t.true(!!match);

	let [_, host] = match;
	if (/\[.+\]/.test(host)) {
		t.true(isIPv6(host.substring(1, host.length - 1)));
	} else {
		t.true(isIPv4(host.substring(1, host.length - 1)));
	}
});

test('EADDRINUSE is thrown', async t => {
	let err: NodeJS.ErrnoException;
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
	assert.equal(err.code, 'EADDRINUSE');
});
