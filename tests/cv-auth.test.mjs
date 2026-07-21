import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, it } from 'node:test';

import handler from '../api/cv.js';

const PASSWORD = 'correct:private password';

// Strings that appear ONLY in the real CV. Every "should not leak" assertion checks for these, so
// a regression that serves private/cv.html without auth fails the suite loudly.
// Deliberately not "Don Listwin": that is a common string which legitimately appears elsewhere
// (the password-manager username field), so it produced false positives rather than real signal.
// These five are CV-exclusive — verified absent from the login page and present in private/cv.html.
const CV_MARKERS = /Board Experience|Management Experience|Woodside Road|DOB:|Curriculum/i;

const makeRequest = ({ method = 'GET', url = '/cv', headers = {}, body } = {}) => ({
  method,
  url,
  headers,
  body,
});

const makeResponse = () => ({
  statusCode: 200,
  headers: new Map(),
  body: '',
  setHeader(name, value) {
    this.headers.set(name.toLowerCase(), value);
  },
  getHeader(name) {
    return this.headers.get(name.toLowerCase());
  },
  end(value = '') {
    this.body = String(value);
    return this;
  },
});

const run = async (request) => {
  const response = makeResponse();
  await handler(request, response);
  return response;
};

const login = async (password) => run(makeRequest({
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: `password=${encodeURIComponent(password)}`,
}));

beforeEach(() => {
  process.env.CV_PASSWORD = PASSWORD;
});

afterEach(() => {
  delete process.env.CV_PASSWORD;
});

describe('Listwin private CV handler', () => {
  it('fails closed when no password is configured', async () => {
    delete process.env.CV_PASSWORD;
    const response = await run(makeRequest());

    assert.equal(response.statusCode, 503);
    assert.doesNotMatch(response.body, CV_MARKERS);
  });

  it('shows a login page without CV content to anonymous visitors', async () => {
    const response = await run(makeRequest());

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Private CV access/);
    assert.doesNotMatch(response.body, CV_MARKERS);
    assert.equal(response.getHeader('cache-control'), 'private, no-store, max-age=0, must-revalidate');
    assert.match(response.getHeader('x-robots-tag'), /noindex/);
    assert.equal(response.getHeader('referrer-policy'), 'no-referrer');
    assert.equal(response.getHeader('vary'), 'Cookie');
  });

  it('rejects an incorrect password without setting a cookie', async () => {
    const response = await login('incorrect');

    assert.equal(response.statusCode, 401);
    assert.match(response.body, /could not verify/i);
    assert.equal(response.getHeader('set-cookie'), undefined);
    assert.doesNotMatch(response.body, CV_MARKERS);
  });

  it('associates and announces the error on a failed attempt', async () => {
    const { body } = await login('incorrect');

    // The error must be programmatically tied to the field, not merely nearby. role="alert" alone
    // is unreliable here because the page is a full reload, so the region exists at parse time.
    assert.match(body, /aria-invalid="true"/);
    assert.match(body, /aria-describedby="password-error"/);
    assert.match(body, /id="password-error"[^>]*role="alert"/);
    // Focus lands on the described input, and the title signals failure on load.
    assert.match(body, /id="password"[^>]*autofocus/);
    assert.match(body, /<title>Error: /);
  });

  it('does not steal focus when there is no error to report', async () => {
    const { body } = await run(makeRequest());

    assert.doesNotMatch(body, /autofocus/);
    assert.doesNotMatch(body, /aria-invalid/);
  });

  // The CV page loads /cv-print.js. If script-src ever drops 'self' the Print button becomes a
  // visible control that silently does nothing.
  it('permits the external print script under the CSP', async () => {
    const csp = (await run(makeRequest())).getHeader('content-security-policy');

    assert.match(csp, /script-src[^;]*'self'/);
  });

  it('issues a secure cookie on the correct password', async () => {
    const response = await login(PASSWORD);

    assert.equal(response.statusCode, 303);
    assert.equal(response.getHeader('location'), '/cv');
    assert.doesNotMatch(response.body, CV_MARKERS);

    const setCookie = response.getHeader('set-cookie');
    assert.match(setCookie, /^__Host-listwin_cv=/);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Secure/);
    assert.match(setCookie, /SameSite=Strict/);
    assert.match(setCookie, /Path=\//);
  });

  it('serves the CV only when the cookie carries the right password', async () => {
    const cookie = (await login(PASSWORD)).getHeader('set-cookie').split(';', 1)[0];
    const response = await run(makeRequest({ headers: { cookie } }));

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Board Experience/);
    assert.match(response.body, /Don Listwin/);
    assert.match(response.body, /<meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex">/);
    assert.equal(response.getHeader('cache-control'), 'private, no-store, max-age=0, must-revalidate');
  });

  it('rejects a forged or stale cookie', async () => {
    for (const cookie of [
      '__Host-listwin_cv=wrong',
      '__Host-listwin_cv=',
      `__Host-listwin_cv=${encodeURIComponent(PASSWORD)}x`,
      'other_cookie=irrelevant',
    ]) {
      const response = await run(makeRequest({ headers: { cookie } }));
      assert.doesNotMatch(response.body, CV_MARKERS, `leaked CV for cookie: ${cookie}`);
    }
  });

  // A malformed cookie used to throw URIError out of decodeURIComponent, 500ing every GET. The
  // cookie is HttpOnly so the page could not clear it — an unrecoverable lockout.
  it('shows the login page rather than crashing on a malformed cookie', async () => {
    for (const raw of ['%', '%E0%A4', '%zz', '%C0%80', 'Canary%']) {
      const response = await run(makeRequest({ headers: { cookie: `__Host-listwin_cv=${raw}` } }));

      assert.equal(response.statusCode, 200, `expected login page for cookie: ${raw}`);
      assert.match(response.body, /Private CV access/);
      assert.doesNotMatch(response.body, CV_MARKERS);
    }
  });

  it('survives a body that URLSearchParams cannot parse', async () => {
    const response = await run(makeRequest({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: [1, 2, 3],
    }));

    assert.equal(response.statusCode, 401);
    assert.doesNotMatch(response.body, CV_MARKERS);
  });

  // `includes('/logout')` also matched a query string, so /cv?next=/logout signed the visitor out
  // when they were trying to sign in.
  it('does not treat a /logout query string as a sign-out', async () => {
    const response = await run(makeRequest({
      method: 'POST',
      url: '/cv?next=/logout',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `password=${encodeURIComponent(PASSWORD)}`,
    }));

    assert.equal(response.statusCode, 303);
    assert.match(response.getHeader('set-cookie'), /^__Host-listwin_cv=[^;]+/);
    assert.doesNotMatch(response.getHeader('set-cookie'), /Max-Age=0/);
  });

  it('clears the cookie on sign out', async () => {
    const response = await run(makeRequest({ method: 'POST', url: '/cv/logout' }));

    assert.equal(response.statusCode, 303);
    assert.equal(response.getHeader('location'), '/cv');
    assert.match(response.getHeader('set-cookie'), /Max-Age=0/);
  });

  // The show/hide toggle is inline JS allowed by a hashed CSP. If the hash and the script ever
  // drift apart the browser silently blocks the script and the eyeball stops working with no
  // visible error, so this is asserted rather than eyeballed.
  it('allows its own inline toggle script under the CSP', async () => {
    const { body, ...rest } = await run(makeRequest());
    const csp = (await run(makeRequest())).getHeader('content-security-policy');
    const inline = body.match(/<script>([\s\S]*?)<\/script>/);

    assert.ok(inline, 'login page should embed the toggle script');
    const hash = `sha256-${createHash('sha256').update(inline[1]).digest('base64')}`;
    assert.ok(csp.includes(`'${hash}'`), `CSP does not permit the inline script (${hash})`);
    assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/);
  });

  it('exposes an accessible show/hide password control', async () => {
    const { body } = await run(makeRequest());

    // Progressive enhancement: hidden until the script runs, so no dead button without JS.
    assert.match(body, /id="toggle-password"[^>]*\shidden/);
    assert.match(body, /id="toggle-password"[^>]*type="button"|type="button"[^>]*id="toggle-password"/);
    assert.match(body, /aria-label="Show password"/);
    assert.match(body, /aria-controls="password"/);
    // Deliberately NOT aria-pressed: a flipping accessible name plus a pressed state announces
    // "Hide password, pressed", which implies the opposite of the actual state. Matches attribute
    // usage only — the inline script's explanatory comment mentions the word.
    assert.doesNotMatch(body, /aria-pressed\s*=/);
    // Status goes to a polite live region, since a changed name is not reliably re-announced.
    assert.match(body, /id="password-status"[^>]*aria-live="polite"/);
    // Icons are decorative; the button carries the accessible name.
    assert.match(body, /data-icon="eye"[^>]*aria-hidden="true"/);
    assert.match(body, /data-icon="eye-off"[^>]*hidden/);
    // Label must stay associated with the input.
    assert.match(body, /<label for="password">/);
    assert.match(body, /id="password"[^>]*type="password"/);
    assert.match(body, /autocomplete="current-password"/);
  });

  it('does not leak CV content on a HEAD request', async () => {
    const cookie = (await login(PASSWORD)).getHeader('set-cookie').split(';', 1)[0];
    const response = await run(makeRequest({ method: 'HEAD', headers: { cookie } }));

    assert.equal(response.body, '');
  });
});
