import { format } from 'url';
import { AddressInfo, Server } from 'net';

export default function listen (server: Server, ...args): Promise<string> {
  return new Promise((resolve, reject) => {
    args.push((err: Error): void => {
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
    });
    server.listen(...args);
  });
}
