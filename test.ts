import tap from 'tap'
import listen from './src';
import { createServer } from 'net';

tap.test('No arguments', async t => {
	const server = createServer();
	const address = await listen(server)
	if (address !== null) {
		t.doesNotThrow(() => new URL(address))
	}
	server.close()
});

tap.test('EADDRINUSE is thrown', async t => {
	const port = 63971;
	const server1 = createServer();
	const server2 = createServer();
	await t.resolves(listen(server1, port));
	await t.rejects(listen(server2, port));
	server1.close()
})
