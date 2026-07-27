# Listwin Ventures Rebuild

A modern Astro + Tailwind CSS scaffold prepared from the legacy WordPress export. The project
includes cleaned static content, preserved media assets, and a responsive shell ready for further
design or content work.

## Prerequisites

- Node.js 22.12+ within the 22.x release line, matching the Vercel project runtime.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local development server (http://localhost:8080):

   ```bash
   npm run dev
   ```

3. Generate and inspect a production build when ready:

   ```bash
   npm run build
   npm run preview
   ```

### Tests

```bash
npm audit                       # dependency vulnerability check
npm run test:security-headers   # public headers + exact private CV bundle allowlist
npm run test:e2e                # Playwright: responsive/visual/content across 3 viewports
npm run test:cv-auth            # node:test units for the /cv password gate
npm run test:e2e:cv             # Playwright for the private CV workflow
```

`npm run dev` serves Astro only, so **`/cv` 404s locally** — it is a Vercel serverless function
rather than a page. Use `vercel dev` to exercise it, or `npm run test:e2e:cv`, which serves the
handler over a local http shim and needs no Vercel login.

Note the `tests/visual.spec.ts` snapshot baselines are currently stale, so that suite fails as a
whole. Review the diffs before treating a failure as a real regression.

### Large Files

The repo intentionally ignores:

- `public/assets/uploads/termageddon-maxmind/`
- `public/assets/uploads/2025/06/`
- All `*.mp4`

Copy those assets from the internal media archive if you need them locally. They are not
required for most development tasks, but missing files will surface as 404s when referencing
the related media.

## Project Structure

- `src/pages/` – Astro page routing (hero/homepage, legal pages, BelizeKids.org spotlight, oral history, contact form, exploit detail pages, etc.).
- `src/layouts/BaseLayout.astro` – Global shell (sticky nav, dropdown menus, frosted glass header/footer, cookie-consent banner + deferred analytics loader).
- `src/components/SiteNavigation.astro` – the header nav. **Zero-framework module JavaScript**
  (CSS desktop dropdowns + a native `<details>` mobile drawer with a small inline accessibility
  enhancement). It replaced the old React/Radix island. See “Navigation uses no framework
  JavaScript” in `docs/architecture.md`.
- `src/components/CompanyCarousel.astro`, `LogoGrid.astro`, and `HeroMedia.astro` – reusable media primitives that render the homepage carousels, legacy grids, and hero imagery.
- `src/components/Button` (global `.btn` utility via `src/styles/global.css`) – shared white-fill/colored-outline button styling consumed across all pages for consistent hover states.
- `src/data/assets.ts` – legacy media mapping plus grouped board/investment/philanthropy collections.
- `src/data/entityDetails.ts` – canonical portfolio metadata powering `/company/[slug]` pages and the nav dropdowns.
- `src/data/exploitDetails.ts` – structured content for the Exploits cards and `/exploits/[slug]` pages (events, Belize initiatives, retreats).
- `src/data/press.ts` – curated press + reference links powering `/press` and the “Related reading” blocks on company detail pages.
- `public/assets/` – static uploads, legacy CSS, and any new media (note the large-file exclusions above).
- `docs/architecture.md` – ground truth for the design system, section structure, and data flow.
- `api/cv.js` + `private/` + `vercel.json` – the password-gated CV viewer, original Word download,
  and printable PDF. See “Private CV operations” in `docs/architecture.md` before touching them.

## Data-Driven Company Pages

Each logo on the homepage links to `/company/[slug]`, generated from `src/data/entityDetails.ts`.

To add or update a company:

1. Add/refresh the asset entry in `src/data/assets.ts` (under the appropriate group).
2. Add a `DetailContent` entry in `src/data/entityDetails.ts` with `summary`, `highlights`, and optional `externalUrl`.
3. Ensure the slug is listed in `requiredSlugs` so the page is pre-rendered.
4. Run `npm run build` to verify the new route.

The navigation dropdowns pull from the same detail list. Company names now render in only one dropdown:

- New – curated spotlight cards (driven by `workHighlights` in the layout).
- Investments – grouped by stage, plus an Exits group.
- Community Projects – philanthropic entities.
- Some company routes intentionally hide the hero logo (Sequoia, HWVP, TeleSoft). Update the `hideHeroMedia` array inside `src/pages/company/[slug].astro` if you change that behaviour.
- The Carbon Robotics detail page owns a “Latest News” block (`carbonNews` in the same file); refresh it whenever there is a notable funding or product announcement.

## Navigation

The nav is a **zero-framework module-JS Astro component** (`src/components/SiteNavigation.astro`,
fed `navItems` from `BaseLayout.astro`). Desktop dropdowns open on CSS
`:hover`/`:focus-within`; the mobile drawer is a native `<details>`. A small inline script keeps
ARIA state synchronized, contains and restores focus, makes background content inert, closes on
Escape/backdrop activation, and preserves body scroll state. New icon names still need adding to
the `astro.config.mjs` allowlist. It renders distinct menus:

- **New** – curated spotlight cards for current focus areas (Carbon Robotics, 4AG, BelizeKids.org). Update `workHighlights` in the layout when the focus list changes.
- **Investments** – mega-menu fed by `investmentAssets`/`entityDetails` (Seed, Private, Exits inserted between Private/Venture, then Venture, Public).
- **Community** – philanthropy slugs sourced from `entityDetails`.
- **About** – links to the oral-history interview, the on-page “My Story” anchor, and the Press library.
- **Contact** – dedicated `/contact` page (first name, last name, organisation, email, message). Any CTA pointing to “Contact” should link to `/contact`.
  > **The contact form posts to a third-party form service.** The old Netlify markup
  > (`data-netlify` + hidden `form-name`) is gone; `src/pages/contact.astro` now posts to the URL in
  > the **`PUBLIC_CONTACT_ENDPOINT`** environment variable (a Formspree endpoint). It is already set
  > in Vercel for Production and Preview and in `.env.local` for local builds. Because it is a
  > `PUBLIC_*` variable it is inlined at **build time**, so changing it requires a redeploy/rebuild,
  > not just an env edit. The form progressively enhances: with JS it submits via `fetch` and shows
  > an inline status without leaving the page; without JS it does a native POST. A honeypot field
  > (`_gotcha`) filters bots. **If the variable is unset, the form renders but tells the visitor it
  > is not configured instead of silently dropping the message.** New Formspree forms also require a
  > one-time email confirmation before they deliver.

All dropdowns share animated carets and card-style panels; the mobile nav expands into a full-width, touch-friendly drawer.

The mobile drawer is tested as a real modal when JavaScript is available: focus stays inside,
background content becomes inert, body scrolling locks, Escape closes the drawer, and focus returns
to the Menu trigger. Without JavaScript, the native `<summary>` remains an accurate, reachable close
control and the static markup does not claim modal-only ARIA state.

## Security and release checks

- Keep the project on Node 22.x so local, CI, and Vercel dependency resolution agree.
- Run `npm audit` after dependency changes. The production and development audit should report zero
  known vulnerabilities before release.
- Run `npm run test:security-headers` after editing `vercel.json`. Public routes receive CSP,
  `nosniff`, referrer, permissions, and frame-denial policies; `/api` and `/cv` remain excluded
  because the CV handler supplies its own stricter private response policy.
- Never broaden the CV function's exact `includeFiles` allowlist to `private/**`. Only the viewer,
  July 2026 Word/PDF documents, and their two protected page previews belong in the function bundle.
- Before release, run the focused responsive and CV tests plus `npm run build`, then verify that
  `dist/` contains no CV HTML, Word document, or CV PDF.

### Icons (astro-icon allowlist)

This project uses `astro-icon` in allowlist mode. If you reference a new icon name anywhere, add it
to the `icon({ include: ... })` list in `astro.config.mjs` or `npm run build` will fail.

## Press & References

- `/press` is backed by `src/data/press.ts`.
- Add `relatedSlugs: ['openwave']` (etc.) on a press item to surface it automatically on the matching `/company/[slug]` page.
- Prefer `publishedIso: 'YYYY-MM-DD'` when the publish date is known; otherwise use `publishedLabel`.
- Set `featured: true` to pin an item into the Featured section on `/press`.

## Next Steps

- Keep `docs/architecture.md` in sync when redesigning sections (hero, investments, exploits, nav).
- Use `src/data/entityDetails.ts` as the single source of truth for copy, CTA links, and navigation labels.
- Maintain `src/data/exploitDetails.ts` when adding new “Exploits” cards so `/exploits/[slug]` stays in sync with the homepage.
- Homepage content flows from: Hero → My Story → Investments (card carousel per stage) → Exploits. The Contact form now lives at `/contact`.
- Prune or archive legacy pages (`home-old`, placeholder legal docs) once they are no longer needed.
