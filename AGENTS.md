# Working Notes (Agents + Maintainers)

This folder (`listwinventures-rebuild/`) is the actively developed Astro + Tailwind rebuild of
`listwinventures.com`.

Use Node 22.x locally and in Vercel.

## Quick Start

```bash
npm install
npm run dev                    # http://localhost:8080
npm run build
npm run preview                # http://localhost:8080 (serves /dist)

npm audit
npm run test:security-headers  # public header policy + CV bundle allowlist
npm run test:e2e               # Playwright across 3 viewports
npm run test:cv-auth           # node:test units for the /cv password gate
npm run test:e2e:cv            # Playwright for the private CV workflow
```

`npm run dev` runs Astro only, so **`/cv` 404s locally** — it is a Vercel function, not a page. Use
`vercel dev` (port 3000) to exercise it, or `npm run test:e2e:cv`, which serves the handler over a
local http shim and needs no credentials.

⚠️ The `tests/visual.spec.ts` baselines are stale and that suite currently fails wholesale. Review
the diffs before trusting a red run, and refresh with `--update-snapshots` once confirmed.

## Where Content Lives

- `src/data/assets.ts` – logo/headshot catalogue + grouping (board/investment/philanthropy/hero).
- `src/data/entityDetails.ts` – company copy + highlights + `requiredSlugs` (powers `/company/[slug]`).
- `src/data/exploitDetails.ts` – Exploits cards + `/exploits/[slug]` pages.
- `src/data/press.ts` – Press & References library (powers `/press` and “Related reading” on company pages).
- `src/pages/press.astro` – `/press` route.
- `src/components/SiteNavigation.astro` – the header nav. **Zero-framework module JavaScript**
  (CSS desktop dropdowns + a native `<details>` drawer with a small inline accessibility
  enhancement). It replaced a React/Radix island, so only `/4ag` hydrates React. New icon names go
  in the `astro.config.mjs` allowlist. See “Navigation uses no framework JavaScript” in
  `docs/architecture.md`.
- `src/pages/contact.astro` – contact form. Posts to `PUBLIC_CONTACT_ENDPOINT` (a Formspree endpoint,
  set in Vercel for Production + Preview and in `.env.local`). `PUBLIC_*` vars inline at build time,
  so changing the endpoint needs a redeploy. See “Contact form” in `docs/architecture.md`.
- `src/layouts/BaseLayout.astro` – global shell. Also owns the cookie-consent banner + the
  consent-gated, idle-deferred GA/Hotjar loader (analytics load only after opt-in). See
  “Analytics & cookie consent” in `docs/architecture.md`.
- `private/cv.html` plus the Word/PDF files in `private/` – the password-gated CV viewer and source
  documents. **Not Astro/public assets.** `vercel.json` rewrites `/cv` to `api/cv.js`, which reads
  them only after the password check passes. **Never move them under `public/` or `src/pages/`** —
  anything in the static build is fetchable by anyone. See “Private CV operations” and “Private CV
  login screen” in `docs/architecture.md` before editing `api/cv.js`.

## Common Tasks

### Add A Press Link

1. Add a `PressItem` to `src/data/press.ts`.
2. Set `relatedSlugs: ['openwave']` (etc.) to surface the link on `/company/[slug]`.
3. Prefer `publishedIso: 'YYYY-MM-DD'` when known. Use `publishedLabel` when the exact date is unknown.
4. Keep copy original: link out to third-party sources; do not mirror full articles.
5. Set `featured: true` to pin an item into the “Featured” section on `/press`.

### Add Or Change Icons

This project uses `astro-icon` in allowlist mode.

If you reference a new icon name (ex: `tabler:news`) anywhere, you must also add the icon name to
`astro.config.mjs` under `icon({ include: { ... } })` or `npm run build` will fail.

### Add A New Static Route

When you add a new file under `src/pages/`, also update:

- `src/pages/sitemap.xml.ts`: add the route to `staticRoutes` so it appears in `sitemap.xml`.
- `src/pages/robots.txt.ts`: optionally disallow routes that should not be indexed.

### Maintain Interview Pages

- `/oral-history` is the CHM 2018 interview page and now includes a "More interviews" CTA to `/oral-history-caltech`.
- `/oral-history-caltech` renders a four-episode 2025 series and expects media under
  `public/media/oral-history/caltech-2025/`.
- Transcript button behavior on `/oral-history-caltech`:
  - PDF is always shown, served from Cloudinary via `transcriptPdfUrl` in the page frontmatter.
    The local `public/media/oral-history/caltech-2025/transcript-full.pdf` still exists but is no
    longer the linked copy.
  - TXT is conditional and only renders when `/media/oral-history/caltech-2025/transcript-full.txt` exists.
- Audio behavior on `/oral-history-caltech`:
  - An episode audio player and `Download audio (MP3)` link render only when the matching `.mp3` exists and has file size > 0.
  - Otherwise the UI shows `Audio coming soon` (no broken controls).
- If you change the `/oral-history` CTA section layout, refresh Desktop visual snapshots:
  - `npx playwright test tests/visual.spec.ts --project="Desktop Chrome" --update-snapshots --grep "(/ \\(top\\)|/oral-history \\(transcript CTA\\))"`

#### Caltech 2025 Source Ingest Notes

- Source drop used: `/Users/enzo/Downloads/Recordings - Don Listwin Interviewed by David Zierler/`
- Source naming map:
  - `250325_1184 ...` -> Episode 1 (`2025-03-25`)
  - `250402_1187 ...` -> Episode 2 (`2025-04-02`)
  - `250407_1190 ...` -> Episode 3 (`2025-04-07`)
  - `250428_1207 ...` -> Episode 4 (`2025-04-28`)
- Current published assets:
  - MP3 audio in `public/media/oral-history/caltech-2025/episode-*-*.mp3` (converted from WAV using `ffmpeg`, mono 44.1kHz, 64kbps).
  - Per-episode transcript TXT in `public/media/oral-history/caltech-2025/episode-*-*-transcript.txt`.
  - Combined transcript downloads:
    - TXT: `public/media/oral-history/caltech-2025/transcript-full.txt`
    - PDF: `public/media/oral-history/caltech-2025/transcript-full.pdf` (generated via `cupsfilter -m application/pdf`).

## Ship Checklist

- `npm audit` reports zero known vulnerabilities.
- `npm run test:security-headers` passes after any `vercel.json` or CV bundle change.
- `npm run build` passes.
- Page metadata: never render `pageTitle`/`pageDescription` as visible copy (they carry the brand
  suffix and pipes — use the separate `heading`/`intro` consts), the canonical host stays
  `www.listwinventures.com`, and no metadata asserts a contested fact. See "Page Metadata" in
  `docs/architecture.md`.
- If you touched `api/cv.js`, anything under `private/`, or `vercel.json`: `npm run test:cv-auth`
  and `npm run test:e2e:cv` pass, and `dist/` contains no CV HTML, Word, or PDF assets (their
  presence means the CV is being published unprotected).
- Any new static routes show up in `sitemap.xml`.
- Any new icons are added to the `astro.config.mjs` allowlist.
- If you touched the nav (`SiteNavigation.astro`) or anything header-related: `npm run test:e2e`
  passes `tests/responsive.spec.ts` (no horizontal overflow, focus containment and restoration,
  inert background, scroll locking, Escape close, JavaScript-off fallback, desktop-resize unlock,
  full-viewport stacking, and an on-screen desktop dropdown).
- If you touched analytics/consent: nothing loads GA/Hotjar eagerly in `<head>` — they must stay
  behind the consent opt-in in `BaseLayout.astro`. The consent banner is `role="region"`, **not**
  `dialog` (that role belongs to the nav drawer; two dialogs break `getByRole('dialog')`).
- If you touched the contact form: it still posts to `PUBLIC_CONTACT_ENDPOINT`, degrades to a native
  POST without JS, and shows the “not configured” message when the var is unset.
- Update `docs/architecture.md` if structure or data catalogs changed. (There is no `../docs/`
  copy — this repo is standalone; earlier references to a root-level sibling were stale.)
