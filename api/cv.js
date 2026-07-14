import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const COOKIE_NAME = '__Host-listwin_cv_session';
const SESSION_SCOPE = 'listwin-cv';
const SESSION_TTL_MS = 8 * 60 * 60 * 1_000;
const CV_FILE = fileURLToPath(new URL('../private/cv.html', import.meta.url));
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 32;

const securityHeaders = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  Vary: 'Cookie',
};

const applyHeaders = (res) => {
  for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
};

const send = (res, statusCode, body, contentType = 'text/html; charset=utf-8') => {
  applyHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', contentType);
  res.end(body);
};

const redirect = (res, location, cookie) => {
  applyHeaders(res);
  res.statusCode = 303;
  res.setHeader('Location', location);
  if (cookie) res.setHeader('Set-Cookie', cookie);
  res.end('');
};

const base64Url = (value) => Buffer.from(value).toString('base64url');
const unbase64Url = (value) => Buffer.from(value, 'base64url');

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const createPasswordHash = (password, salt = randomBytes(16).toString('hex')) => {
  const derived = scryptSync(password, Buffer.from(salt, 'hex'), KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derived.toString('hex')}`;
};

const verifyPassword = (password, encodedHash) => {
  try {
    const [algorithm, nValue, rValue, pValue, salt, expectedHex, extra] = encodedHash.split('$');
    if (algorithm !== 'scrypt' || extra) return false;
    const expected = Buffer.from(expectedHex, 'hex');
    if (expected.length !== KEY_LENGTH) return false;
    const actual = scryptSync(password, Buffer.from(salt, 'hex'), KEY_LENGTH, {
      N: Number(nValue),
      r: Number(rValue),
      p: Number(pValue),
      maxmem: 64 * 1024 * 1024,
    });
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
};

export const createSessionToken = ({
  secret,
  now = Date.now(),
  expiresAt = now + SESSION_TTL_MS,
}) => {
  if (!secret || secret.length < 32) throw new Error('Session secret must be at least 32 characters.');
  const payload = base64Url(JSON.stringify({
    version: 1,
    scope: SESSION_SCOPE,
    issuedAt: now,
    expiresAt,
    nonce: randomBytes(16).toString('hex'),
  }));
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const verifySessionToken = (token, secret, now = Date.now()) => {
  try {
    if (!secret || secret.length < 32) return false;
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return false;
    const expected = createHmac('sha256', secret).update(payload).digest('base64url');
    if (!safeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const parsed = JSON.parse(unbase64Url(payload).toString('utf8'));
    return parsed.version === 1 &&
      parsed.scope === SESSION_SCOPE &&
      Number.isFinite(parsed.issuedAt) &&
      Number.isFinite(parsed.expiresAt) &&
      parsed.issuedAt <= now &&
      parsed.expiresAt > now;
  } catch {
    return false;
  }
};

const parseCookies = (header = '') => Object.fromEntries(
  header.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return index === -1 ? [part, ''] : [part.slice(0, index), part.slice(index + 1)];
  }),
);

const bodyParams = (req) => {
  if (typeof req.body === 'string') return new URLSearchParams(req.body);
  if (Buffer.isBuffer(req.body)) return new URLSearchParams(req.body.toString('utf8'));
  if (req.body && typeof req.body === 'object') return new URLSearchParams(req.body);
  return new URLSearchParams();
};

const requestPath = (req) => new URL(req.url ?? '/cv', 'https://placeholder.invalid').pathname;

const sameOrigin = (req) => {
  const host = req.headers.host;
  const origin = req.headers.origin;
  const protocol = String(req.headers['x-forwarded-proto'] ?? 'https').split(',')[0].trim();
  return Boolean(host && origin && origin === `${protocol}://${host}`);
};

const sanitizeNext = (value) => value === '/cv' || value === '/cv/' ? '/cv' : '/cv';

const loginPage = ({ error = '', unavailable = false } = {}) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Private CV access | Listwin Ventures</title><meta name="robots" content="noindex,nofollow,noarchive">
<style>:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:1.5rem;background:#f4f3ef;color:#17202a}main{width:min(100%,30rem);border:1px solid #d8d6cf;border-radius:1.25rem;background:#fff;padding:clamp(1.5rem,5vw,2.5rem);box-shadow:0 1.25rem 3rem rgba(23,32,42,.08)}p{color:#5b6470;line-height:1.55}label{display:block;margin:1.5rem 0 .5rem;font-weight:700}input{width:100%;border:1px solid #9da3aa;border-radius:.75rem;padding:.85rem 1rem;font:inherit}input:focus{outline:3px solid rgba(30,96,145,.2);border-color:#1e6091}button{width:100%;margin-top:1rem;border:0;border-radius:999px;padding:.9rem 1rem;background:#17202a;color:#fff;font:inherit;font-weight:700;cursor:pointer}[role=alert]{border-left:3px solid #b42318;padding-left:.75rem;color:#8a1c14}.privacy{margin-top:1.25rem;font-size:.875rem}</style></head>
<body><main><h1>Private CV access</h1><p>This page contains private contact and background information. Enter the access password shared by Don or the Listwin Ventures team.</p>
${unavailable ? '<p role="alert">Private access is temporarily unavailable. Please contact the Listwin Ventures team.</p>' : `<form method="post" action="/cv"><label for="password">Access password</label><input id="password" name="password" type="password" required autocomplete="current-password" autofocus>${error ? `<p role="alert">${error}</p>` : ''}<input type="hidden" name="next" value="/cv"><button type="submit">Open private CV</button></form>`}
<p class="privacy">Access expires after eight hours. The password is never stored in your browser.</p></main></body></html>`;

const sessionCookie = (token) => `${COOKIE_NAME}=${token}; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1_000)}; HttpOnly; Secure; SameSite=Strict`;
const expiredCookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

export default async function handler(req, res) {
  const passwordHash = process.env.CV_PASSWORD_HASH ?? '';
  const sessionSecret = process.env.CV_SESSION_SECRET ?? '';
  if (!passwordHash || sessionSecret.length < 32) {
    send(res, 503, loginPage({ unavailable: true }));
    return;
  }

  const path = requestPath(req);
  if (req.method === 'POST' && path.endsWith('/logout')) {
    if (!sameOrigin(req)) {
      send(res, 403, loginPage({ error: 'This request could not be verified.' }));
      return;
    }
    redirect(res, '/cv', expiredCookie);
    return;
  }

  if (req.method === 'POST') {
    if (!sameOrigin(req)) {
      send(res, 403, loginPage({ error: 'This request could not be verified.' }));
      return;
    }
    const params = bodyParams(req);
    if (!verifyPassword(String(params.get('password') ?? ''), passwordHash)) {
      send(res, 401, loginPage({ error: 'We could not verify that password. Please try again.' }));
      return;
    }
    const token = createSessionToken({ secret: sessionSecret });
    redirect(res, sanitizeNext(params.get('next')), sessionCookie(token));
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    applyHeaders(res);
    res.setHeader('Allow', 'GET, HEAD, POST');
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const cookies = parseCookies(req.headers.cookie ?? '');
  if (!verifySessionToken(cookies[COOKIE_NAME] ?? '', sessionSecret)) {
    send(res, 200, loginPage());
    return;
  }

  const cv = await readFile(CV_FILE, 'utf8');
  send(res, 200, req.method === 'HEAD' ? '' : cv);
}
