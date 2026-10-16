import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import chokidar from 'chokidar';
import { buildSite } from './build.mjs';

const host = process.env.HOST || 'localhost';
const requestedPort = Number(process.env.PORT || 3000);
const distDir = path.resolve('dist');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function openBrowser(url) {
  const commands = {
    win32: ['cmd.exe', ['/d', '/s', '/c', 'start', '', url]],
    darwin: ['open', [url]],
    linux: ['xdg-open', [url]]
  };
  const [command, args] = commands[process.platform] || commands.linux;
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => console.warn(`Open ${url} manually if the browser did not launch.`));
  child.unref();
}

async function resolveFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  const candidate = path.resolve(distDir, `.${pathname}`);
  if (candidate !== distDir && !candidate.startsWith(`${distDir}${path.sep}`)) return null;
  try {
    const details = await stat(candidate);
    return details.isDirectory() ? path.join(candidate, 'index.html') : candidate;
  } catch {
    if (!path.extname(candidate)) {
      const fallback = path.join(candidate, 'index.html');
      try {
        await stat(fallback);
        return fallback;
      } catch {}
    }
    return null;
  }
}

await buildSite({ previewDrafts: true });

const server = http.createServer(async (request, response) => {
  const file = await resolveFile(request.url || '/');
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'content-type': contentTypes[path.extname(file)] || 'application/octet-stream',
    'cache-control': 'no-store'
  });
  createReadStream(file).pipe(response);
});

let currentPort = requestedPort;
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && currentPort < requestedPort + 10) {
    const nextPort = currentPort + 1;
    console.warn(`Port ${currentPort} is already in use; trying ${nextPort}…`);
    currentPort = nextPort;
    server.listen(currentPort, host);
    return;
  }
  console.error(error.code === 'EADDRINUSE'
    ? `Could not find an available port between ${requestedPort} and ${currentPort}.`
    : error);
  process.exit(1);
});

server.listen(currentPort, host, () => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : requestedPort;
  const url = `http://${host}:${port}/`;
  console.log(`Local: ${url}`);
  console.log('Watching src/ and build/ for changes. Press Ctrl+C to stop.');
  openBrowser(url);
});

let building = false;
let rebuildRequested = false;
async function rebuild() {
  if (building) {
    rebuildRequested = true;
    return;
  }
  building = true;
  try {
    await buildSite({ previewDrafts: true });
  } catch (error) {
    console.error(`Rebuild failed: ${error.message}`);
  } finally {
    building = false;
    if (rebuildRequested) {
      rebuildRequested = false;
      rebuild();
    }
  }
}

const watcher = chokidar.watch(['src', 'build'], {
  ignored: ['build/dev.mjs'],
  ignoreInitial: true
});
watcher.on('all', rebuild);

async function shutdown() {
  await watcher.close();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
