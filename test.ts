import net from 'net'
import test from 'ava'
import http from 'http'
import listen from './'

test('no arguments', async (t) => {
  const server = net.createServer()
  const address = await listen(server)
  const match = /^http\:\/\/(.+)\:\d+$/.exec(address)
  t.pass(!!match)

  let [ _, host ] = match
  if (/\[.+\]/.test(host)) {
    t.pass(net.isIPv6(host.substring(1, host.length - 1)))
  } else {
    t.pass(net.isIPv4(host.substring(1, host.length - 1)))
  }
})
