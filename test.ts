import tap from 'tap'
import listen from './src';
import { createServer } from 'net';
import http from 'http';
import http2 from 'http2';
import https from 'https';

tap.test('No arguments', async t => {
	const server = createServer();
	const address = await listen(server)
	t.ok(address instanceof URL)
	t.equal((address as URL).protocol, 'tcp:')
	server.close()
});

tap.test('server autodetect', t => {
	t.test('http', async t => {
		const server = http.createServer();
		const address = await listen(server);
		t.ok(address instanceof URL)
		t.equal((address as URL).protocol, 'http:')
		server.close()
	})

	t.test('https', async t => {
		const server = https.createServer();
		const address = await listen(server);
		t.ok(address instanceof URL)
		t.equal((address as URL).protocol, 'https:')
		server.close()
	})

	t.end()
})

tap.test('EADDRINUSE is thrown', async t => {
	const port = 63971;
	const server1 = createServer();
	const server2 = createServer();
	await t.resolves(listen(server1, port));
	await t.rejects(listen(server2, port));
	server1.close()
})
