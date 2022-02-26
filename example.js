const net = require('net');
const listen = require('./').default;

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
