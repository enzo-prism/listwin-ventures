import { timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Simple password gate for the private CV.
//
// The security boundary is that private/cv.html lives OUTSIDE the static build and is only
// read after the password check passes. Do not move that file under public/ or src/pages/ —
// anything in the static build is fetchable by anyone, regardless of what this file does.

const COOKIE_NAME = '__Host-listwin_cv';
const MAX_AGE_SECONDS = 8 * 60 * 60;
const CV_FILE = fileURLToPath(new URL('../private/cv.html', import.meta.url));

const headers = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  Vary: 'Cookie',
};

const send = (res, statusCode, body) => {
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = statusCode;
  res.end(body);
};

// Constant-time compare, so the password can't be recovered by timing the response.
const matches = (candidate, expected) => {
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
};

const readCookie = (header = '') => header
  .split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${COOKIE_NAME}=`))
  ?.slice(COOKIE_NAME.length + 1) ?? '';

const readPassword = (req) => {
  const body = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
  if (!body) return '';
  const params = typeof body === 'string' ? new URLSearchParams(body) : new URLSearchParams(body);
  return params.get('password') ?? '';
};

const loginPage = ({ error = '', unavailable = false } = {}) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Private CV access | Listwin Ventures</title><meta name="robots" content="noindex,nofollow,noarchive">
<style>:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:1.5rem;background:#f4f3ef;color:#17202a}main{width:min(100%,30rem);border:1px solid #d8d6cf;border-radius:1.25rem;background:#fff;padding:clamp(1.5rem,5vw,2.5rem);box-shadow:0 1.25rem 3rem rgba(23,32,42,.08)}p{color:#5b6470;line-height:1.55}label{display:block;margin:1.5rem 0 .5rem;font-weight:700}input{width:100%;border:1px solid #9da3aa;border-radius:.75rem;padding:.85rem 1rem;font:inherit}input:focus{outline:3px solid rgba(30,96,145,.2);border-color:#1e6091}button{width:100%;margin-top:1rem;border:0;border-radius:999px;padding:.9rem 1rem;background:#17202a;color:#fff;font:inherit;font-weight:700;cursor:pointer}[role=alert]{border-left:3px solid #b42318;padding-left:.75rem;color:#8a1c14}.privacy{margin-top:1.25rem;font-size:.875rem}</style></head>
<body><main><h1>Private CV access</h1><p>This page contains private contact and background information. Enter the access password shared by Don or the Listwin Ventures team.</p>
${unavailable ? '<p role="alert">Private access is temporarily unavailable. Please contact the Listwin Ventures team.</p>' : `<form method="post" action="/cv"><label for="password">Access password</label><input id="password" name="password" type="password" required autocomplete="current-password" autofocus>${error ? `<p role="alert">${error}</p>` : ''}<button type="submit">Open private CV</button></form>`}
<p class="privacy">Access expires after eight hours. The password is never stored in your browser.</p></main></body></html>`;

export default async function handler(req, res) {
  const password = process.env.CV_PASSWORD ?? '';

  // Fail closed: with no password configured, never serve the CV.
  if (!password) {
    send(res, 503, loginPage({ unavailable: true }));
    return;
  }

  // "Sign out" button in private/cv.html posts here. vercel.json rewrites /cv/:path* to this
  // handler, so this branch must exist or that button reads as a failed login.
  if (req.method === 'POST' && String(req.url ?? '').includes('/logout')) {
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.statusCode = 303;
    res.setHeader('Location', '/cv');
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
    res.end('');
    return;
  }

  if (req.method === 'POST') {
    if (!matches(readPassword(req), password)) {
      send(res, 401, loginPage({ error: 'We could not verify that password. Please try again.' }));
      return;
    }
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.statusCode = 303;
    res.setHeader('Location', '/cv');
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(password)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`,
    );
    res.end('');
    return;
  }

  if (!matches(decodeURIComponent(readCookie(req.headers.cookie)), password)) {
    send(res, 200, loginPage());
    return;
  }

  const cv = await readFile(CV_FILE, 'utf8');
  send(res, 200, req.method === 'HEAD' ? '' : cv);
}
