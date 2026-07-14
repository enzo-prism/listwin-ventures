import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import handler, {
  createPasswordHash,
  createSessionToken,
} from '../api/cv.js';

const SESSION_SECRET = 'test-listwin-session-secret-that-is-more-than-thirty-two-characters';
const PASSWORD = 'correct:private password';

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
  status(code) {
    this.statusCode = code;
    return this;
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

const validOriginHeaders = {
  host: 'www.listwinventures.com',
  origin: 'https://www.listwinventures.com',
  'x-forwarded-proto': 'https',
  'content-type': 'application/x-www-form-urlencoded',
};

beforeEach(() => {
  process.env.CV_PASSWORD_HASH = createPasswordHash(PASSWORD, '00112233445566778899aabbccddeeff');
  process.env.CV_SESSION_SECRET = SESSION_SECRET;
});

afterEach(() => {
  delete process.env.CV_PASSWORD_HASH;
  delete process.env.CV_SESSION_SECRET;
});

describe('Listwin private CV handler', () => {
  it('fails closed when required secrets are missing', async () => {
    delete process.env.CV_PASSWORD_HASH;
    const response = await run(makeRequest());

    assert.equal(response.statusCode, 503);
    assert.doesNotMatch(response.body, /Board Experience|Don Listwin/i);
  });

  it('shows a generic login page without CV content to anonymous visitors', async () => {
    const response = await run(makeRequest());

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Private CV access/);
    assert.doesNotMatch(response.body, /Board Experience|Don Listwin/i);
    assert.equal(response.getHeader('cache-control'), 'private, no-store, max-age=0, must-revalidate');
    assert.match(response.getHeader('x-robots-tag'), /noindex/);
    assert.equal(response.getHeader('referrer-policy'), 'no-referrer');
    assert.equal(response.getHeader('content-security-policy'), "default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  });

  it('rejects cross-origin and incorrect login attempts without setting a cookie', async () => {
    const crossOrigin = await run(makeRequest({
      method: 'POST',
      headers: { ...validOriginHeaders, origin: 'https://attacker.example' },
      body: `password=${encodeURIComponent(PASSWORD)}`,
    }));
    assert.equal(crossOrigin.statusCode, 403);
    assert.equal(crossOrigin.getHeader('set-cookie'), undefined);

    const incorrect = await run(makeRequest({
      method: 'POST',
      headers: validOriginHeaders,
      body: 'password=incorrect',
    }));
    assert.equal(incorrect.statusCode, 401);
    assert.match(incorrect.body, /could not verify/i);
    assert.equal(incorrect.getHeader('set-cookie'), undefined);
    assert.doesNotMatch(incorrect.body, /Board Experience|Don Listwin/i);
  });

  it('issues a secure signed session and serves the CV only with a valid cookie', async () => {
    const login = await run(makeRequest({
      method: 'POST',
      headers: validOriginHeaders,
      body: `password=${encodeURIComponent(PASSWORD)}&next=%2Fcv`,
    }));

    assert.equal(login.statusCode, 303);
    assert.equal(login.getHeader('location'), '/cv');
    const setCookie = login.getHeader('set-cookie');
    assert.match(setCookie, /^__Host-listwin_cv_session=/);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Secure/);
    assert.match(setCookie, /SameSite=Strict/);
    assert.match(setCookie, /Path=\//);

    const cookie = setCookie.split(';', 1)[0];
    const authorized = await run(makeRequest({ headers: { cookie } }));
    assert.equal(authorized.statusCode, 200);
    assert.match(authorized.body, /Board Experience/);
    assert.match(authorized.body, /Don Listwin/);
    assert.equal(authorized.getHeader('cache-control'), 'private, no-store, max-age=0, must-revalidate');
    assert.equal(authorized.getHeader('vary'), 'Cookie');
  });

  it('rejects tampered and expired sessions', async () => {
    const valid = createSessionToken({
      secret: SESSION_SECRET,
      now: 1_000,
      expiresAt: 2_000,
    });
    const tampered = `${valid.slice(0, -1)}${valid.endsWith('a') ? 'b' : 'a'}`;

    const tamperedResponse = await run(makeRequest({
      headers: { cookie: `__Host-listwin_cv_session=${tampered}` },
    }));
    assert.doesNotMatch(tamperedResponse.body, /Board Experience/);

    const expired = createSessionToken({
      secret: SESSION_SECRET,
      now: 1_000,
      expiresAt: Date.now() - 1,
    });
    const expiredResponse = await run(makeRequest({
      headers: { cookie: `__Host-listwin_cv_session=${expired}` },
    }));
    assert.doesNotMatch(expiredResponse.body, /Board Experience/);
  });

  it('clears the session on same-origin logout', async () => {
    const response = await run(makeRequest({
      method: 'POST',
      url: '/cv/logout',
      headers: validOriginHeaders,
      body: '',
    }));

    assert.equal(response.statusCode, 303);
    assert.equal(response.getHeader('location'), '/cv');
    assert.match(response.getHeader('set-cookie'), /Max-Age=0/);
  });
});
