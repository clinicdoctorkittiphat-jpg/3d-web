import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 8787);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function resolveRequestPath(url) {
  const requestPath = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const normalized = normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = resolve(join(root, normalized === '/' ? 'index.html' : normalized));
  return filePath.startsWith(root) ? filePath : join(root, 'index.html');
}

createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || '/');
  const finalPath = existsSync(filePath) && statSync(filePath).isFile() ? filePath : join(root, 'index.html');
  const type = mimeTypes[extname(finalPath)] || 'application/octet-stream';

  res.writeHead(200, { 'content-type': type });
  createReadStream(finalPath).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`Static preview running at http://127.0.0.1:${port}/`);
});
