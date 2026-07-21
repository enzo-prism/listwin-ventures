import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import handler from '../api/cv.js';

const PASSWORD = 'correct:private password';

// Strings that only appear in the real CV. Every "should not leak" assertion checks for these,
// so a regression that serves private/cv.html without auth fails the suite loudly.
const CV_MARKERS = /Board Experience|Don Listwin/i;

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

  it('clears the cookie on sign out', async () => {
    const response = await run(makeRequest({ method: 'POST', url: '/cv/logout' }));

    assert.equal(response.statusCode, 303);
    assert.equal(response.getHeader('location'), '/cv');
    assert.match(response.getHeader('set-cookie'), /Max-Age=0/);
  });

  it('does not leak CV content on a HEAD request', async () => {
    const cookie = (await login(PASSWORD)).getHeader('set-cookie').split(';', 1)[0];
    const response = await run(makeRequest({ method: 'HEAD', headers: { cookie } }));

    assert.equal(response.body, '');
  });
});
