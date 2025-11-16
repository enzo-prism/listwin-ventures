# Listwin Ventures Rebuild

A modern Astro + Tailwind CSS scaffold prepared from the legacy WordPress export. The project
includes cleaned static content, preserved media assets, and a responsive shell ready for further
design or content work.

## Prerequisites

- Node.js 18.17+ (Astro’s minimum) and npm 9+.

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
- `src/layouts/BaseLayout.astro` – Global shell (sticky nav, dropdown menus, frosted glass header/footer).
- `src/components/CompanyCarousel.astro`, `LogoGrid.astro`, and `HeroMedia.astro` – reusable media primitives that render the homepage carousels, legacy grids, and hero imagery.
- `src/components/Button` (global `.btn` utility via `src/styles/global.css`) – shared white-fill/colored-outline button styling consumed across all pages for consistent hover states.
- `src/data/assets.ts` – legacy media mapping plus grouped board/investment/philanthropy collections.
- `src/data/entityDetails.ts` – canonical portfolio metadata powering `/company/[slug]` pages and the nav dropdowns.
- `src/data/exploitDetails.ts` – structured content for the Exploits cards and `/exploits/[slug]` pages (events, Belize initiatives, retreats).
- `public/assets/` – static uploads, legacy CSS, and any new media (note the large-file exclusions above).
- `docs/architecture.md` – ground truth for the design system, section structure, and data flow.
- `archive/` – frozen WordPress exports for historical reference (do not edit).

## Data-Driven Company Pages

Each logo on the homepage links to `/company/[slug]`, generated from `src/data/entityDetails.ts`.

To add or update a company:

1. Add/refresh the asset entry in `src/data/assets.ts` (under the appropriate group).
2. Add a `DetailContent` entry in `src/data/entityDetails.ts` with `summary`, `highlights`, and optional `externalUrl`.
3. Ensure the slug is listed in `requiredSlugs` so the page is pre-rendered.
4. Run `npm run build` to verify the new route.

The navigation dropdowns pull from the same detail list. Company names now render in only one dropdown:

- New – currently Carbon Robotics only (driven by `workHighlights` in the layout).
- Investments – grouped by stage, plus an Exits group.
- Community Projects – philanthropic entities.
- Some company routes intentionally hide the hero logo (Sequoia, HWVP, TeleSoft). Update the `hideHeroMedia` array inside `src/pages/company/[slug].astro` if you change that behaviour.
- The Carbon Robotics detail page owns a “Latest News” block (`carbonNews` in the same file); refresh it whenever there is a notable funding or product announcement.

## Navigation

`src/layouts/BaseLayout.astro` now renders a responsive navigation system with distinct menus:

- **New** – curated spotlight cards for current focus areas (Carbon Robotics, BelizeKids.org). Update `workHighlights` in the layout when the focus list changes.
- **Investments** – mega-menu fed by `investmentAssets`/`entityDetails` (Seed, Private, Exits inserted between Private/Venture, then Venture, Public).
- **Community** – philanthropy slugs sourced from `entityDetails`.
- **About** – links to the oral-history interview and the on-page “My Story” anchor.
- **Contact** – dedicated `/contact` page with a Netlify-backed form (first name, last name, organisation, email, message). Any CTA pointing to “Contact” should link to `/contact`.

All dropdowns share animated carets and card-style panels; the mobile nav expands into a full-width, touch-friendly drawer.

## Next Steps

- Keep `docs/architecture.md` in sync when redesigning sections (hero, investments, exploits, nav).
- Use `src/data/entityDetails.ts` as the single source of truth for copy, CTA links, and navigation labels.
- Maintain `src/data/exploitDetails.ts` when adding new “Exploits” cards so `/exploits/[slug]` stays in sync with the homepage.
- Homepage content flows from: Hero → My Story → Investments (card carousel per stage) → Exploits. The Contact form now lives at `/contact`.
- Prune or archive legacy pages (`home-old`, placeholder legal docs) once they are no longer needed.
