const net = require('net');
const { default: listen } = require('./');

async function main() {
  const server = net.createServer()
  const address = await listen(server)
  console.log({ address });
  server.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
