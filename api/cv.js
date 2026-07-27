import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Simple password gate for the private CV.
//
// The security boundary is that every CV asset lives OUTSIDE the static build and is only
// read after the password check passes. Do not move these files under public/ or src/pages/ —
// anything in the static build is fetchable by anyone, regardless of what this file does.

const COOKIE_NAME = '__Host-listwin_cv';
const MAX_AGE_SECONDS = 8 * 60 * 60;
const SESSION_VERSION = 1;
const CV_FILE = fileURLToPath(new URL('../private/cv.html', import.meta.url));
const CV_WORD_FILE = fileURLToPath(new URL('../private/Don-Listwin-CV-July-2026.doc', import.meta.url));
const CV_PDF_FILE = fileURLToPath(new URL('../private/Don-Listwin-CV-July-2026.pdf', import.meta.url));
const CV_PAGE_FILES = new Map([
  ['/cv/page-1.png', fileURLToPath(new URL('../private/Don-Listwin-CV-July-2026-page-1.png', import.meta.url))],
  ['/cv/page-2.png', fileURLToPath(new URL('../private/Don-Listwin-CV-July-2026-page-2.png', import.meta.url))],
]);

// Show/hide toggle for the password field. The button starts hidden and is revealed here, so a
// browser with JavaScript disabled never shows a control that cannot work.
const TOGGLE_SCRIPT = `
(function () {
  var field = document.getElementById('password');
  var toggle = document.getElementById('toggle-password');
  // Must be declared: a bare "status" would resolve to window.status (a legacy empty string),
  // so the live region would silently never update.
  var status = document.getElementById('password-status');
  if (!field || !toggle) return;
  toggle.hidden = false;
  toggle.addEventListener('click', function () {
    var reveal = field.type === 'password';
    var start = field.selectionStart;
    var end = field.selectionEnd;
    field.type = reveal ? 'text' : 'password';
    // Only the label changes — no aria-pressed. A flipping name plus a pressed state announces
    // "Hide password, pressed", which reads as though the password is hidden when it is visible.
    toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    // toggleAttribute, not .hidden — the hidden IDL property is on HTMLElement, which SVGElement
    // does not implement, so assigning svg.hidden silently does nothing.
    toggle.querySelector('[data-icon=eye]').toggleAttribute('hidden', reveal);
    toggle.querySelector('[data-icon=eye-off]').toggleAttribute('hidden', !reveal);
    // Screen readers do not reliably re-announce a changed name, so state goes to a live region.
    if (status) status.textContent = reveal ? 'Your password is visible' : 'Your password is hidden';
    field.focus();
    // Some browsers collapse the caret to the end when type changes; restore it.
    try { field.setSelectionRange(start, end); } catch (e) {}
  });
})();
`;

// Hashed rather than 'unsafe-inline', and derived from the script itself so editing the script
// above can never leave a stale hash behind.
const SCRIPT_HASH = `sha256-${createHash('sha256').update(TOGGLE_SCRIPT).digest('base64')}`;

const headers = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
  // The hash permits the login page's inline password toggle. img-src allows the authenticated
  // page previews served by this same handler.
  'Content-Security-Policy': `default-src 'self'; script-src 'self' '${SCRIPT_HASH}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'`,
  Vary: 'Cookie',
};

const send = (res, statusCode, body, {
  contentType = 'text/html; charset=utf-8',
  disposition,
} = {}) => {
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.setHeader('Content-Type', contentType);
  if (disposition) res.setHeader('Content-Disposition', disposition);
  res.statusCode = statusCode;
  res.end(body);
};

// Constant-time compare, so the password can't be recovered by timing the response.
const matches = (candidate, expected) => {
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
};

const signingSecret = (password) => process.env.CV_SESSION_SECRET || password;

const sign = (payload, password) => createHmac('sha256', signingSecret(password))
  .update(payload)
  .digest('base64url');

const createSessionToken = (password) => {
  const payload = Buffer.from(JSON.stringify({
    v: SESSION_VERSION,
    exp: Date.now() + (MAX_AGE_SECONDS * 1000),
    nonce: randomBytes(16).toString('base64url'),
  })).toString('base64url');

  return `${payload}.${sign(payload, password)}`;
};

const hasValidSession = (token, password) => {
  const parts = String(token).split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1] || !matches(parts[1], sign(parts[0], password))) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return session.v === SESSION_VERSION
      && Number.isFinite(session.exp)
      && session.exp > Date.now()
      && typeof session.nonce === 'string'
      && session.nonce.length >= 16;
  } catch {
    return false;
  }
};

const readCookie = (header = '') => header
  .split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${COOKIE_NAME}=`))
  ?.slice(COOKIE_NAME.length + 1) ?? '';

const readPassword = (req) => {
  try {
    const body = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
    if (!body) return '';
    return new URLSearchParams(body).get('password') ?? '';
  } catch {
    // A hand-crafted body (e.g. a JSON array) can make URLSearchParams throw. Treat as no password.
    return '';
  }
};

// Compare the pathname, not the raw URL: `includes('/logout')` would also match a query string
// like /cv?next=/logout, signing someone out when they meant to sign in.
const isLogout = (req) => {
  try {
    return new URL(req.url ?? '/cv', 'https://placeholder.invalid').pathname.endsWith('/logout');
  } catch {
    return false;
  }
};

const pathname = (req) => {
  try {
    return new URL(req.url ?? '/cv', 'https://placeholder.invalid').pathname;
  } catch {
    return '/cv';
  }
};

const loginPage = ({ error = '', unavailable = false } = {}) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${error ? 'Error: ' : ''}Private CV access | Listwin Ventures</title><meta name="robots" content="noindex,nofollow,noarchive">
<link rel="canonical" href="https://www.listwinventures.com/cv">
<meta name="description" content="Password-protected page. Listwin Ventures.">
<!-- Chat clients unfurl this link for everyone in the thread and ignore robots directives, so the
     card must disclose nothing about what is behind the gate: no PII categories, no personal name
     beside "private", no portrait, and a small summary card rather than a large hero. -->
<meta property="og:site_name" content="Listwin Ventures">
<meta property="og:locale" content="en_US">
<meta property="og:type" content="website">
<meta property="og:title" content="Private CV access">
<meta property="og:description" content="This link is password protected. Listwin Ventures.">
<meta property="og:url" content="https://www.listwinventures.com/cv">
<meta property="og:image" content="https://www.listwinventures.com/assets/uploads/OpenGraph.png">
<meta property="og:image:alt" content="Listwin Ventures">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Private CV access">
<meta name="twitter:description" content="This link is password protected. Listwin Ventures.">
<style>:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:1.5rem;background:#f4f3ef;color:#17202a}main{width:min(100%,30rem);border:1px solid #d8d6cf;border-radius:1.25rem;background:#fff;padding:clamp(1.5rem,5vw,2.5rem);box-shadow:0 1.25rem 3rem rgba(23,32,42,.08)}p{color:#5b6470;line-height:1.55}label{display:block;margin:1.5rem 0 .5rem;font-weight:700}input{width:100%;border:1px solid #767e88;border-radius:.75rem;padding:.85rem 3.75rem .85rem 1rem;font:inherit}input:focus{outline:3px solid #1e6091;outline-offset:1px;border-color:#1e6091}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}.pm-anchor{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}button[type=submit]{width:100%;margin-top:1rem;border:0;border-radius:999px;padding:.9rem 1rem;background:#17202a;color:#fff;font:inherit;font-weight:700;cursor:pointer}.field{position:relative;display:flex;align-items:center}.reveal{position:absolute;right:.5rem;width:2.75rem;height:2.75rem;display:grid;place-items:center;margin:0;padding:0;border:0;border-radius:.5rem;background:transparent;color:#5b6470;cursor:pointer}.reveal:hover{color:#17202a;background:#f1f0ec}.reveal:focus-visible{outline:3px solid #1e6091;outline-offset:1px}.reveal svg{width:1.25rem;height:1.25rem;display:block}[role=alert]{border-left:3px solid #b42318;padding-left:.75rem;color:#8a1c14}.privacy{margin-top:1.25rem;font-size:.875rem}</style></head>
<body><main><h1>Private CV access</h1><p>This page is password protected. Enter the access password shared by Don or the Listwin Ventures team.</p>
${unavailable ? '<p role="alert">Private access is temporarily unavailable. Please contact the Listwin Ventures team.</p>' : `<form method="post" action="/cv" data-form-type="login"><input type="text" name="username" id="username" value="Don Listwin CV" autocomplete="username" readonly tabindex="-1" aria-hidden="true" class="pm-anchor"><label for="password">Access password</label><div class="field"><input id="password" name="password" type="password" required autocomplete="current-password" data-form-type="password"${error ? ' aria-invalid="true" aria-describedby="password-error" autofocus' : ''}><button type="button" id="toggle-password" class="reveal" hidden aria-label="Show password" aria-controls="password"><svg data-icon="eye" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg><svg data-icon="eye-off" hidden aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/></svg></button></div><p id="password-status" class="sr-only" aria-live="polite"></p>${error ? `<p id="password-error" role="alert">${error}</p>` : ''}<button type="submit">Open private CV</button></form>`}
<p class="privacy">Access expires after eight hours.</p>
<script>${TOGGLE_SCRIPT}</script></main></body></html>`;

export default async function handler(req, res) {
  const password = process.env.CV_PASSWORD ?? '';

  // Fail closed: with no password configured, never serve the CV.
  if (!password) {
    send(res, 503, loginPage({ unavailable: true }));
    return;
  }

  // "Sign out" button in private/cv.html posts here. vercel.json rewrites /cv/:path* to this
  // handler, so this branch must exist or that button reads as a failed login.
  if (req.method === 'POST' && isLogout(req)) {
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
      `${COOKIE_NAME}=${createSessionToken(password)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`,
    );
    res.end('');
    return;
  }

  if (!hasValidSession(readCookie(req.headers.cookie), password)) {
    send(res, 200, loginPage());
    return;
  }

  const path = pathname(req);
  if (path === '/cv/download.doc') {
    const word = await readFile(CV_WORD_FILE);
    send(res, 200, req.method === 'HEAD' ? '' : word, {
      contentType: 'application/msword',
      disposition: 'attachment; filename="Don-Listwin-CV-July-2026.doc"',
    });
    return;
  }

  if (path === '/cv/document.pdf') {
    const pdf = await readFile(CV_PDF_FILE);
    send(res, 200, req.method === 'HEAD' ? '' : pdf, {
      contentType: 'application/pdf',
      disposition: 'inline; filename="Don-Listwin-CV-July-2026.pdf"',
    });
    return;
  }

  if (CV_PAGE_FILES.has(path)) {
    const image = await readFile(CV_PAGE_FILES.get(path));
    send(res, 200, req.method === 'HEAD' ? '' : image, {
      contentType: 'image/png',
    });
    return;
  }

  const cv = await readFile(CV_FILE, 'utf8');
  send(res, 200, req.method === 'HEAD' ? '' : cv);
}
