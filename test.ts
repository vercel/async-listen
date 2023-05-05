import * as tap from 'tap';
import * as http from 'http';
import * as https from 'https';
import { resolve } from 'path';
import { AddressInfo, createServer } from 'net';
import { listen } from './src';

const testIf = (condition: boolean, ...args: Parameters<typeof tap.test>) =>
	condition ? tap.test(...args) : tap.skip(...args);

const isWindows = process.platform === 'win32';

tap.test('No arguments', async (t) => {
	const server = createServer();
	const address = await listen(server);
	t.ok(address instanceof URL);
	t.equal(address.protocol, 'tcp:');
	server.close();
});

tap.test('Invalid arguments', async (t) => {
	const server = createServer();
	() => {
		// @ts-expect-error Passed a RegExp, which is not expected
		listen(server, 0, 'adfs', /regexp-not-allowed/);
	};
});

tap.test('Throws error if `address()` returns null', async (t) => {
	const server = createServer();
	server.address = () => null;
	await t.rejects(listen(server));
	server.close();
});

testIf(!isWindows, 'Returns URL for UNIX pipe', async (t) => {
	const server = createServer();
	const socket = 'unix.sock';
	const address = await listen(server, socket);
	t.equal(address.protocol, 'unix:');
	t.equal(address.host, encodeURIComponent(resolve(socket)));
	server.close();
});

tap.test('Server autodetect', (t) => {
	t.test('http', async (t) => {
		const server = http.createServer();

		// Using `ListenOptions` interface
		const address = await listen(server, {
			port: 0,
			host: '127.0.0.1',
		});

		t.equal(address.protocol, 'http:');
		server.close();
	});

	t.test('https', async (t) => {
		const server = https.createServer();

		// Using `port`, `host` interface
		const address = await listen(server, 0, '127.0.0.1');

		t.equal(address.protocol, 'https:');
		server.close();
	});

	testIf(!isWindows, 'http - UNIX pipe', async (t) => {
		const socket = 'http.sock';
		const server = http.createServer();
		const address = await listen(server, socket);
		t.equal(address.protocol, 'http+unix:');
		server.close();
	});

	testIf(!isWindows, 'https - UNIX pipe', async (t) => {
		const socket = 'https.sock';
		const server = https.createServer();
		const address = await listen(server, socket);
		t.equal(address.protocol, 'https+unix:');
		server.close();
	});

	t.test('Custom protocol', async (t) => {
		const server = createServer();

		// @ts-expect-error `protocol` is not defined on `net.Server`
		server.protocol = 'ftp';

		// Using `ListenOptions` interface
		const address = await listen(server);

		t.equal(address.protocol, 'ftp:');
		server.close();
	});

	t.end();
});

tap.test('EADDRINUSE is thrown', async (t) => {
	const port = 63971;
	const server1 = createServer();
	const server2 = createServer();
	await t.resolves(listen(server1, port));
	await t.rejects(listen(server2, port));
	server1.close();
});

tap.test('IPv6 support', async (t) => {
	const server = http.createServer();
	const url = await listen(server);
	t.equal((server.address() as AddressInfo).family, 'IPv6');
	t.equal(url.hostname, '[::]');
	server.close();
});
