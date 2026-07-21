# Architecture & Maintenance Notes

This document mirrors the root-level reference (`../docs/architecture.md`) so contributors working
solely inside the Astro project have the context they need. Keep both files in sync when shipping
structural changes.

## Project Layout

```
listwinventures-rebuild/
  public/                  # legacy CSS (kept for reference; not loaded) + uploads (large media ignored via .gitignore)
  playwright.config.ts     # Playwright config for responsive smoke tests
  src/
    components/            # HeroMedia, LogoGrid, CompanyCarousel, etc.
    data/                  # assets.ts + entityDetails.ts + exploitDetails.ts + press.ts (content catalogs)
    layouts/               # BaseLayout.astro (sticky nav + dropdowns)
    pages/                 # Astro routes (home, contact form, oral history, BelizeKids.org, exploit detail, company detail)
    styles/global.css      # Tailwind entry point + Apple-inspired theming + shared .btn utility
  tests/                   # Playwright smoke tests (responsive overflow checks)
  docs/                    # this file
```

## CSS Strategy

- `src/styles/global.css` is the only global stylesheet entry point (Tailwind base/components/utilities + shared site styles).
- Legacy WordPress stylesheets remain under `public/assets/css/` for reference only and are not loaded by `BaseLayout.astro`.

## Data Sources

- **`src/data/assets.ts`** – stores every logo/headshot and categorises them into board,
  investment, and philanthropy collections consumed by `LogoGrid`.
- **`src/data/entityDetails.ts`** – extends the catalog with copy, highlights, and slugs. It powers
  the `/company/[slug]` routes and navigation dropdowns.
- **`src/data/exploitDetails.ts`** – drives the Exploits cards and `/exploits/[slug]` pages
  (NetAid, San Jose Grand Prix, Belize initiatives, Canary Cove, etc.).
- **`src/data/press.ts`** – curated third-party articles, interviews, and press releases. It powers
  `/press` plus the “Related reading” blocks on matching company pages.
- **`public/assets/uploads/`** – static media. Large items (GeoLite DB, Carbon Robotics videos,
  `*.mp4`) are ignored by git; copy them from the secure archive if you need them locally.
- **`public/media/oral-history/caltech-2025/`** – interview media placeholders and downloads for
  `/oral-history-caltech` (episode audio plus transcript files).

## Navigation & Dropdowns

`BaseLayout.astro` renders a responsive navigation system:

1. **New** – curated spotlight cards (currently Carbon Robotics, 4AG, BelizeKids.org). Update the
   `workHighlights` array in the layout when swapping focus projects and include an icon name so the
   dropdown visuals stay consistent.
2. **Investments** – mega-menu grouped by stage (`investmentAssets` + `entityDetails`). Exits sit in
   their own group at the end.
3. **Community** – philanthropy slugs pulled from `entityDetails`.
4. **About** – quick links to the oral-history interview, the on-page “My Story”, and the Press library.
5. **Contact** – persistent CTA linking to `/contact`.

The dropdown carets animate, the desktop mega-menu stays right-aligned to prevent overflow, and the
mobile nav expands into a full-width card with all sections stacked.

- All nav entries leverage `astro-icon`. Keep the icon maps (`navItems`, `workHighlights`,
  `investmentIcons`, `communityLinks`, `storyLinks`) in `BaseLayout.astro` updated whenever you add
  or rename items so the grey→green hover treatment remains aligned across desktop and mobile.

## Canonical URLs & Share Links

- `src/layouts/BaseLayout.astro` is the single source of truth for canonical page URLs. It builds
  `pageUrl` from the production origin plus `Astro.url` path/query/hash components.
- Do **not** use `Astro.url?.href` for share or OpenGraph URL values on static pages, because build
  output can otherwise inherit `http://localhost:8080/...`.
- `astro.config.mjs` sets `site: 'https://listwinventures.com'` and must stay aligned with the live
  domain.
- `src/components/SharePanel.astro` powers social share buttons and Copy Link. It also normalizes
  links at runtime with `window.location.href` and includes a clipboard fallback (`document.execCommand('copy')`)
  for browsers where `navigator.clipboard` is unavailable.
- Share-strip visibility is controlled in `BaseLayout.astro` via `shareEnabledPaths` and
  `shareEnabledPrefixes`; update those lists when adding/removing key routes.
- Regression check after share/SEO URL changes:
  - `npm run build`
  - `rg "localhost:8080|localhost" dist`

## Homepage Sections

After the hero and “My Story” modules, the homepage is limited to three key sections:

1. **Recent Work** – Carbon Robotics spotlight (copy + CTA + media).
2. **Investments** – hero text plus stage-specific carousels (Seed, Private, Exits, Venture, Public).
3. **Exploits** – themed cards that now link to `/exploits/[slug]` for long-form writeups.

The standalone contact section was removed; all inquiries route through `/contact`.

### Initiative Pages

- `/4ag` lives at `src/pages/4ag.astro` and captures 4AG Robotics’ story using only facts pulled
  from their public site. When adding similar initiative pages, reuse the same BaseLayout-driven
  structure and add the initiative to `workHighlights` so it surfaces under “New”.

## Company Detail Pages

- `src/pages/company/[slug].astro` consumes `getEntityDetails()` to prerender every portfolio slug. Keep `entityDetails.ts` as the single source of truth for copy/highlights.
- Some slugs (currently Sequoia, HWVP, and TeleSoft) intentionally hide the hero logo to avoid duplicating brand assets. Update the `hideHeroMedia` list in the page component if the design changes.
- Carbon Robotics includes an inline “Latest News” card stack managed by the `carbonNews` object in the same file. Refresh that block whenever there is a funding or product update so the detail page stays current.
- Company pages render “Related reading” by matching `detail.slug` against `relatedSlugs` inside `src/data/press.ts`.
- Extra media (e.g., the Carbon Robotics field footage) is defined near the top of the file. Add new entries there so `galleryAssets` and `carbonVideos` stay organized.

## Press & References

- `/press` lives at `src/pages/press.astro` and is backed by `src/data/press.ts`.
- Use `relatedSlugs` to connect a press item to one or more `/company/[slug]` pages.
- Prefer `publishedIso: 'YYYY-MM-DD'` when known. Use `publishedLabel` if the exact date is unknown.
- Set `featured: true` to pin an item into the Featured section on `/press`.
- Keep copy original: link out to third-party sources; do not mirror full articles.

## Interview Pages

- `/oral-history` is the 2018 Computer History Museum interview page.
- `/oral-history-caltech` is the 2025 Caltech Heritage Project interview page.
- Caltech interview media lives at `public/media/oral-history/caltech-2025/`.
- `/oral-history-caltech` intentionally uses file-aware rendering:
  - Full transcript PDF link is always shown. It is served from Cloudinary via `transcriptPdfUrl` in
    `src/pages/oral-history-caltech.astro`, not from the local copy that still exists at
    `public/media/oral-history/caltech-2025/transcript-full.pdf`.
  - Full transcript TXT link is only shown when `transcript-full.txt` exists.
  - Episode audio controls are shown only when the matching `.mp3` exists and has a non-zero file size.
  - Missing or empty episode audio files show a neutral `Audio coming soon` note.
- When `/oral-history` CTA layout changes, refresh Desktop visual baselines for the homepage/oral-history snapshot set:
  - `npx playwright test tests/visual.spec.ts --project="Desktop Chrome" --update-snapshots --grep "(/ \\(top\\)|/oral-history \\(transcript CTA\\))"`
- The Caltech page now also supports per-episode transcript links using:
  - `episode-1-2025-03-25-transcript.txt`
  - `episode-2-2025-04-02-transcript.txt`
  - `episode-3-2025-04-07-transcript.txt`
  - `episode-4-2025-04-28-transcript.txt`
- Audio source handling for Caltech uploads:
  - Recordings arrive as large WAV masters (e.g., from `/Users/enzo/Downloads/Recordings - Don Listwin Interviewed by David Zierler/`).
  - Public web audio is MP3 (mono, 44.1kHz, 64kbps) written to `public/media/oral-history/caltech-2025/episode-*.mp3`.
  - Keep runtime and transcript links in `src/pages/oral-history-caltech.astro` in sync with uploaded assets.

## Icons (astro-icon allowlist)

`astro-icon` is configured in allowlist mode via `astro.config.mjs`.

If you reference a new icon name anywhere (navigation, Press page, etc.), you must add it to the
`icon({ include: ... })` list or `npm run build` will fail.

## Sitemap

- `src/pages/sitemap.xml.ts` builds `sitemap.xml` from a `staticRoutes` list plus the company and exploit slugs.
- When adding a new top-level static page (example: `/press`), also add it to `staticRoutes`.
- `/oral-history-caltech` is included in `staticRoutes` as the Caltech 2025 interview route.
- `/cv` is intentionally excluded from `staticRoutes` and all public discovery files.
- `/cv` is not an Astro route. `vercel.json` rewrites it to `api/cv.js`, which fails closed unless `CV_PASSWORD` is configured.
- The handler is a deliberately simple password gate: a constant-time comparison against `CV_PASSWORD`, an eight-hour `HttpOnly; Secure; SameSite=Strict` cookie, and private/no-store response headers.
- The CV HTML lives in `private/cv.html`, is included only in the Vercel function bundle, and must never be moved under `public/` or `src/pages/`.
- `/cv` is deliberately not blocked in `robots.txt`, so crawlers can receive the handler's `X-Robots-Tag: noindex` response and remove any previously indexed URL. Authentication remains the access-control boundary.

## Hosting and headers

- This site is deployed on **Vercel**. Pushing to `main` auto-deploys production via the Vercel
  GitHub integration; branch pushes get preview deployments.
- ⚠️ `public/_headers` uses Netlify/Cloudflare Pages syntax and **is inert on Vercel** — it is a
  leftover from an earlier host. Its `X-Robots-Tag` rules for `/cv` have never applied in
  production. They are also redundant: `api/cv.js` sets that header itself on every response.
  **Do not add security or cache headers to `public/_headers` expecting them to work.** Real
  headers belong in the `headers` array of `vercel.json`, or in the handler.
- Static assets are already served with `Cache-Control: public, max-age=31536000, immutable` by
  Vercel's defaults, and HSTS is applied at the platform level. `nosniff`, `Referrer-Policy`, and
  a CSP are **not** currently set for the static site (the `/cv` handler sets its own).

## Private CV operations

- **The security boundary is that `private/cv.html` is outside the static build.** The handler only
  reads that file after the password check passes. Anything under `public/` or `src/pages/` is
  fetchable by anyone with `curl`, no matter what JavaScript sits in front of it — so a
  client-side password check is not an option here. This page was publicly exposed once (July 2026)
  and that is the mistake to avoid repeating.
- To change the password, set `CV_PASSWORD` in Vercel (Production). It is stored as a plain value,
  not a hash — the simplification is deliberate, and it means anyone with Vercel project access can
  read the password.
- **Vercel binds environment variables at deploy time, so an env change alone has no effect — you
  must redeploy.** `vercel redeploy <current-production-url>` reuses the exact deployed source and
  is safer than `vercel --prod`, which rebuilds from your local working copy. Confirm afterwards
  that a correct password returns `303` and a wrong one returns `401`.
- Changing `CV_PASSWORD` invalidates existing sessions, because the cookie stores the password and
  is re-checked on every request.
- Never commit the plaintext password to this repo, to `docs/`, or to a commit message.
- ⚠️ There is **no rate limiting** on this endpoint, by choice. Two Vercel WAF rules
  (`rule_rate_limit_cv_login_GUMWLK`, `rule_rate_limit_direct_cv_function_s7XKzB`) capped `/cv`
  POSTs at 5 per 600s per IP; they are now **Disabled** — not deleted, so `vercel firewall rules
  enable <id>` + `vercel firewall publish` restores them. They were disabled because they refused
  the *correct* password once tripped, counted sign-out against the same quota, and were keyed by
  IP, so everyone behind one office NAT shared five attempts. The tradeoff accepted: the password
  alone is the defence, and automated guessing is unthrottled.

## Private CV login screen

- The password field has a show/hide eyeball. Notes for anyone editing it:
  - The inline toggle script is permitted by a **CSP hash derived from the script itself**
    (`SCRIPT_HASH` in `api/cv.js`), so it can never go stale. Do not add `'unsafe-inline'`.
  - `script-src` **must keep `'self'`** — `private/cv.html` loads `/cv-print.js`, and without it the
    "Print CV" button becomes a visible control that silently does nothing.
  - Icon visibility uses `toggleAttribute('hidden', …)`, **not** `.hidden = …`. The `hidden` IDL
    property lives on `HTMLElement`; the icons are `SVGElement`, so assigning `.hidden` does nothing.
  - There is deliberately **no `aria-pressed`**. A flipping accessible name plus a pressed state
    announces "Hide password, pressed", implying the opposite of the true state. State is announced
    via the `#password-status` polite live region instead.
  - The button ships with the `hidden` attribute and is revealed by the script, so no dead control
    appears without JavaScript. The stylesheet needs `[hidden]{display:none!important}` because the
    author `display` rules would otherwise beat it.
  - `autofocus` is applied **only** on the error render, where it lands on the field described by
    `aria-describedby`; a clean load leaves focus alone so screen readers hear the instructions.
- Run `npm run test:cv-auth`, `npm run test:e2e:cv`, `npm run build`, and verify that
  `dist/cv/index.html` does not exist before deploying. `test:e2e:cv` serves `api/cv.js` over a
  local http shim (`tests-cv/serve-cv.mjs`), so it needs no `vercel dev` and no credentials.
- Production acceptance: anonymous/wrong-password requests expose no CV bytes; authenticated requests return `Cache-Control: private, no-store`; logout and tampered/expired cookies fail closed.

## Development Workflow

```bash
npm install
npm run dev       # http://localhost:8080
npm run build
npm run preview   # run after build to inspect /dist
npm run test:e2e   # Playwright responsive smoke tests (multi-viewport)
```

Tailwind + Astro support hot reload. When editing data catalogs, run `npm run build` to ensure the
company detail routes still pre-render correctly.

### Responsive QA (Playwright)

- First-time setup may require downloading browsers: `npx playwright install`
- CI builds that do not run `npm run test:e2e` can skip browser downloads by setting
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`.

## Documentation Expectations

- Update this file whenever navigation rules, homepage sections, or data catalogues change. (There
  is no root-level copy of this document; the repo is standalone.)
- Record large-asset decisions so contributors know why certain directories are ignored by git.
- When adding a new component or workflow, briefly document the intent plus any required scripts
  or environment variables.
