// Standalone host for the /cv Vercel function, used only by playwright.cv.config.ts.
//
// `/cv` is a Vercel serverless function, not an Astro route, so `astro preview` (the webServer
// behind playwright.config.ts) 404s on it. Rather than booting `vercel dev` — slow, network-bound,
// and it wants a linked project — this imports the same default export Vercel would invoke and
// serves it over plain node:http. Same handler and private assets, no cloud dependency.
//
// Two things Vercel does for you that have to be reproduced here:
//   1. `req.body` is populated before the handler runs (node:http gives you a stream instead).
//   2. vercel.json rewrites both `/cv` and `/cv/:path*` to this handler, so `/cv/logout` must route
//      here too while `req.url` keeps the original path — the handler's sign-out branch reads it.
import { createServer } from 'node:http';
import handler from '../api/cv.js';

const PORT = Number(process.env.CV_TEST_PORT ?? 8082);
const HOST = '127.0.0.1';
const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

const server = createServer(async (req, res) => {
  const path = (req.url ?? '/').split('?')[0];

  if (path === '/cv' || path.startsWith('/cv/')) {
    if (req.method === 'POST') req.body = (await readBody(req)).toString('utf8');
    await handler(req, res);
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  // Playwright's webServer waits on the port, but this makes a failed boot obvious in the log.
  console.log(`cv test server listening on http://${HOST}:${PORT}`);
});
