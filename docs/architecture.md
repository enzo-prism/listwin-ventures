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
  - Full transcript PDF link is always shown (`/media/oral-history/caltech-2025/transcript-full.pdf`).
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
- `/cv` is intentionally excluded from `staticRoutes` and is not linked in navigation; it is a private share-only CV page.
- Crawlers are blocked from `/cv` in `src/pages/robots.txt.ts` and `src/pages/llms.txt.ts`.

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

- Update this file (and the root copy) whenever navigation rules, homepage sections, or data
  catalogues change.
- Record large-asset decisions so contributors know why certain directories are ignored by git.
- When adding a new component or workflow, briefly document the intent plus any required scripts
  or environment variables.
