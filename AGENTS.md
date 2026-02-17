# Working Notes (Agents + Maintainers)

This folder (`listwinventures-rebuild/`) is the actively developed Astro + Tailwind rebuild of
`listwinventures.com`.

## Quick Start

```bash
npm install
npm run dev       # http://localhost:8080
npm run build
npm run preview   # http://localhost:8080 (serves /dist)
```

## Where Content Lives

- `src/data/assets.ts` – logo/headshot catalogue + grouping (board/investment/philanthropy/hero).
- `src/data/entityDetails.ts` – company copy + highlights + `requiredSlugs` (powers `/company/[slug]`).
- `src/data/exploitDetails.ts` – Exploits cards + `/exploits/[slug]` pages.
- `src/data/press.ts` – Press & References library (powers `/press` and “Related reading” on company pages).
- `src/pages/press.astro` – `/press` route.

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
  - PDF is always shown at `/media/oral-history/caltech-2025/transcript-full.pdf`.
  - TXT is conditional and only renders when `/media/oral-history/caltech-2025/transcript-full.txt` exists.
- Audio behavior on `/oral-history-caltech`:
  - An episode audio player renders only when the matching `.mp3` exists and has file size > 0.
  - Otherwise the UI shows `Audio coming soon` (no broken controls).
- If you change the `/oral-history` CTA section layout, refresh Desktop visual snapshots:
  - `npx playwright test tests/visual.spec.ts --project="Desktop Chrome" --update-snapshots --grep "(/ \\(top\\)|/oral-history \\(transcript CTA\\))"`

## Ship Checklist

- `npm run build` passes.
- Any new static routes show up in `sitemap.xml`.
- Any new icons are added to the `astro.config.mjs` allowlist.
- Update both `docs/architecture.md` and `../docs/architecture.md` if structure or data catalogs changed.
