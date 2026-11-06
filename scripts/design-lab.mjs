/**
 * Design-lab preview ports that share one Next dev runtime, including its hot-reload connection.
 *
 *   node scripts/design-lab.mjs              the Fresh Fruit case-study lab (default)
 *   node scripts/design-lab.mjs hero-film    the hero film lab
 */
import {spawn} from 'node:child_process';
import {createServer, request} from 'node:http';
import {connect} from 'node:net';
import {fileURLToPath} from 'node:url';

const LABS = {
  'fresh-fruit': {
    name: 'Fresh Fruit design lab',
    basePath: '/design-lab/fresh-fruit',
    upstreamPort: 3000,
    previews: [
      {port: 3001, slug: 'editorial', title: 'The editorial'},
      {port: 3002, slug: 'cinematic', title: 'After hours'},
      {port: 3003, slug: 'swiss', title: 'The index'},
      {port: 3004, slug: 'organic', title: 'Field notes'},
      {port: 3005, slug: 'blueprint', title: 'Under the hood'},
      {port: 3006, slug: 'kinetic', title: 'Fresh perspective'},
    ],
  },
  // Its own upstream port, so it never reuses a `next dev` another checkout runs on 3000
  'hero-film': {
    name: 'Hero film lab',
    basePath: '/design-lab/hero-film',
    upstreamPort: 3100,
    previews: [
      {port: 3001, slug: 'long-take', title: 'The long take'},
      {port: 3002, slug: 'redline', title: 'Redline to render'},
      {port: 3003, slug: 'pull-request', title: 'Pull request'},
      {port: 3004, slug: 'departures', title: 'Departures'},
      {port: 3005, slug: 'in-register', title: 'In register'},
    ],
  },
};

const labName = process.argv[2] ?? 'fresh-fruit';
const lab = LABS[labName];
if (!lab) {
  console.error(`Unknown design lab "${labName}". Choose one of: ${Object.keys(LABS).join(', ')}`);
  process.exit(1);
}

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const upstream = new URL(`http://127.0.0.1:${lab.upstreamPort}`);
const {previews} = lab;

const isListening = () =>
  new Promise((resolve) => {
    const socket = connect({host: upstream.hostname, port: Number(upstream.port)});
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });

const servers = [];
const connections = new Set();
let nextProcess;
let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const socket of connections) socket.destroy();
  for (const server of servers) {
    server.closeAllConnections();
    server.close();
  }
  nextProcess?.kill('SIGTERM');
}

try {
  // Bind every preview port before starting Next, so a port conflict fails cleanly.
  for (const preview of previews) {
    const server = createServer((incoming, outgoing) => {
      // The bare port opens its own direction
      if (incoming.url === '/' || incoming.url === '') {
        outgoing.writeHead(302, {Location: `${lab.basePath}/${preview.slug}`});
        outgoing.end();
        return;
      }
      const proxy = request(
        new URL(incoming.url ?? '/', upstream),
        {
          method: incoming.method,
          headers: {...incoming.headers, host: upstream.host},
        },
        (response) => {
          outgoing.writeHead(response.statusCode ?? 502, response.headers);
          response.pipe(outgoing);
        },
      );
      proxy.on('error', () => {
        if (!outgoing.headersSent) outgoing.writeHead(502, {'Content-Type': 'text/plain; charset=utf-8'});
        outgoing.end('The design preview is starting. Refresh in a moment.');
      });
      incoming.on('aborted', () => proxy.destroy());
      outgoing.on('close', () => proxy.destroy());
      incoming.pipe(proxy);
    });

    // Forward Next/Turbopack's WebSocket so edits appear on every preview port.
    server.on('upgrade', (incoming, socket, head) => {
      const proxy = request(new URL(incoming.url ?? '/', upstream), {headers: {...incoming.headers, host: upstream.host}});
      proxy.on('upgrade', (response, upstreamSocket, upstreamHead) => {
        connections.add(upstreamSocket);
        upstreamSocket.on('close', () => connections.delete(upstreamSocket));
        const headers = [];
        for (let index = 0; index < response.rawHeaders.length; index += 2) {
          headers.push(`${response.rawHeaders[index]}: ${response.rawHeaders[index + 1]}`);
        }
        socket.write(`HTTP/1.1 101 Switching Protocols\r\n${headers.join('\r\n')}\r\n\r\n`);
        if (head.length) upstreamSocket.write(head);
        if (upstreamHead.length) socket.write(upstreamHead);
        upstreamSocket.pipe(socket).pipe(upstreamSocket);
        socket.on('error', () => upstreamSocket.destroy());
        upstreamSocket.on('error', () => socket.destroy());
        socket.on('close', () => upstreamSocket.destroy());
      });
      proxy.on('error', () => socket.destroy());
      proxy.on('response', () => socket.destroy());
      socket.on('error', () => proxy.destroy());
      proxy.end();
    });

    server.on('connection', (socket) => {
      connections.add(socket);
      socket.on('close', () => connections.delete(socket));
    });

    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(preview.port, '127.0.0.1', resolve);
    });
    servers.push(server);
    server.on('error', (error) => {
      console.error(error.message);
      shutdown();
      process.exitCode = 1;
    });
  }

  if (!(await isListening())) {
    nextProcess = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', upstream.hostname, '--port', upstream.port], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env,
    });
    nextProcess.once('exit', (code) => {
      if (!shuttingDown) {
        process.exitCode = code ?? 1;
        shutdown();
      }
    });
  }

  console.log(`\n${lab.name}: ${previews.length} live previews, one shared Next development runtime.`);
  console.log(`Compare all: http://localhost:${upstream.port}${lab.basePath}`);
  for (const preview of previews) console.log(`${preview.title.padEnd(20)} http://localhost:${preview.port}  (${lab.basePath}/${preview.slug})`);
  console.log('\nPress Ctrl+C to stop the preview ports.\n');
} catch (error) {
  console.error(`Could not start design lab: ${error.message}`);
  shutdown();
  process.exitCode = 1;
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
