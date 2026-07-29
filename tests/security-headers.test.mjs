import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const repoRoot = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('vercel.json', repoRoot), 'utf8'));

const publicRule = config.headers?.find(
  (rule) => rule.source === '/((?!api(?:/|$)|cv(?:/|$)).*)',
);
const headers = new Map(
  (publicRule?.headers ?? []).map(({ key, value }) => [key.toLowerCase(), value]),
);

const findPublicPhp = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) return findPublicPhp(path);
    return entry.name.endsWith('.php') ? [path.pathname] : [];
  }));
  return nested.flat();
};

describe('Vercel security boundaries', () => {
  it('never redirects the canonical private CV path back to itself', () => {
    const cvRedirects = (config.redirects ?? [])
      .filter(({ destination }) => destination === '/cv');

    assert.deepEqual(
      cvRedirects,
      [],
      'Vercel route matching is case-insensitive, so a case-normalizing redirect to /cv loops',
    );
  });

  it('redirects retired and duplicate public routes without touching the private CV route', () => {
    assert.deepEqual(config.redirects, [
      { source: '/home-old', destination: '/', permanent: true },
      { source: '/company/belizekids', destination: '/belizekids', permanent: true },
      { source: '/company/genologics', destination: '/genologics', permanent: true },
    ]);
  });

  it('applies the complete public-site header set outside API and CV routes', () => {
    assert.ok(publicRule, 'missing non-API/non-CV security header rule');
    assert.equal(headers.get('x-content-type-options'), 'nosniff');
    assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.equal(headers.get('x-frame-options'), 'DENY');
    assert.ok(headers.has('permissions-policy'));
    assert.ok(headers.has('content-security-policy'));
  });

  it('keeps executable and embedded content on the required origin allowlists', () => {
    const csp = headers.get('content-security-policy');
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.match(
      csp,
      /script-src 'self' 'unsafe-inline' https:\/\/www\.googletagmanager\.com https:\/\/\*\.hotjar\.com/,
    );
    assert.match(csp, /style-src 'self' 'unsafe-inline' https:\/\/\*\.hotjar\.com/);
    assert.match(csp, /frame-src https:\/\/www\.youtube\.com https:\/\/\*\.hotjar\.com/);
    assert.match(
      csp,
      /media-src 'self' https:\/\/4ag\.ai https:\/\/res\.cloudinary\.com/,
    );
    assert.match(csp, /form-action 'self' https:\/\/formspree\.io/);
    assert.match(csp, /connect-src[^;]*https:\/\/formspree\.io/);
    assert.match(csp, /connect-src[^;]*https:\/\/\*\.google-analytics\.com/);
    assert.match(csp, /connect-src[^;]*https:\/\/\*\.hotjar\.io/);
    assert.doesNotMatch(csp, /default-src \*/);

    const scriptDirective = csp
      .split(';')
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith('script-src '));
    assert.equal(
      scriptDirective,
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.hotjar.com",
    );
  });

  it('allows YouTube features but disables sensitive browser capabilities elsewhere', () => {
    const policy = headers.get('permissions-policy');
    assert.match(policy, /autoplay=\(self "https:\/\/www\.youtube\.com"\)/);
    assert.match(policy, /encrypted-media=\(self "https:\/\/www\.youtube\.com"\)/);
    assert.match(policy, /fullscreen=\(self "https:\/\/www\.youtube\.com"\)/);
    for (const disabled of [
      'camera=()',
      'display-capture=()',
      'geolocation=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'publickey-credentials-get=()',
      'usb=()',
    ]) {
      assert.match(policy, new RegExp(disabled.replace(/[()]/g, '\\$&')));
    }
  });

  it('bundles only the five named private CV assets', () => {
    const includeFiles = config.functions?.['api/cv.js']?.includeFiles;
    assert.equal(
      includeFiles,
      'private/{cv.html,Don-Listwin-CV-July-2026.doc,Don-Listwin-CV-July-2026.pdf,Don-Listwin-CV-July-2026-page-1.png,Don-Listwin-CV-July-2026-page-2.png}',
    );
    assert.doesNotMatch(includeFiles, /\*\*/);
    assert.doesNotMatch(includeFiles, /cv 2\.html/);
  });

  it('never publishes legacy PHP or WordPress security datastores', async () => {
    const phpFiles = await findPublicPhp(new URL('public/', repoRoot));
    assert.deepEqual(phpFiles, []);
  });
});
