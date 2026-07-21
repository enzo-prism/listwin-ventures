# Working Notes (Agents + Maintainers)

This folder (`listwinventures-rebuild/`) is the actively developed Astro + Tailwind rebuild of
`listwinventures.com`.

## Quick Start

```bash
npm install
npm run dev       # http://localhost:8080
npm run build
npm run preview   # http://localhost:8080 (serves /dist)

npm run test:e2e      # Playwright: responsive/visual/content across 3 viewports
npm run test:cv-auth  # node:test units for the /cv password gate
npm run test:e2e:cv   # Playwright for the /cv login screen and toggle
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
- `private/cv.html` – the password-gated CV. **Not an Astro page.** `vercel.json` rewrites `/cv` to
  the `api/cv.js` serverless function, which reads this file only after the password check passes.
  **Never move it under `public/` or `src/pages/`** — anything in the static build is fetchable by
  anyone. See “Private CV operations” and “Private CV login screen” in `docs/architecture.md`
  before editing `api/cv.js`; it has four non-obvious traps that have each caused a real bug.

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

- `npm run build` passes.
- If you touched `api/cv.js`, `private/cv.html`, or `vercel.json`: `npm run test:cv-auth` and
  `npm run test:e2e:cv` pass, and `dist/cv/index.html` does **not** exist after a build (its
  presence means the CV is being published unprotected).
- Any new static routes show up in `sitemap.xml`.
- Any new icons are added to the `astro.config.mjs` allowlist.
- Update `docs/architecture.md` if structure or data catalogs changed. (There is no `../docs/`
  copy — this repo is standalone; earlier references to a root-level sibling were stale.)
