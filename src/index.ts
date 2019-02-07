import { format } from 'url';
import { AddressInfo, Server } from 'net';

export interface Address extends AddressInfo {
  url: string
}

export default function listen (server: Server, ...args): Promise<string | Address> {
  return new Promise((resolve, reject) => {
    args.push((err: Error): void => {
      if (err) return reject(err);
      const addressInfo = server.address();
      if (typeof addressInfo === 'string') {
        resolve(addressInfo);
      } else {
        // TODO: detect protocol type based on `server` shape
        const protocol = 'http:';
        const { address: hostname, port } = addressInfo;
        const url = format({ protocol, hostname, port });
        resolve({ url, ...addressInfo, });
      }
    });
    server.listen(...args);
  });
}
