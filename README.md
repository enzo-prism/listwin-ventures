# Listwin Ventures Rebuild

A modern Astro + Tailwind CSS scaffold prepared from the legacy WordPress export. The project
includes cleaned static content, preserved media assets, and a responsive shell ready for further
design or content work.

## Prerequisites

- Node.js 18.17+ (Astro’s minimum) and npm 9+.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server (runs at http://localhost:8080):

```bash
npm run dev
```

## Production Build

Generate an optimized production build and preview it locally on the same port:

```bash
npm run build
npm run preview
```

## Project Structure

- `src/pages/` &mdash; Astro pages created from the original WordPress content.
- `src/layouts/` &mdash; Global layout with responsive navigation and shared styles.
- `src/components/LogoGrid.astro` & `HeroMedia.astro` &mdash; helpers to showcase logos and imagery.
- `src/data/assets.ts` &mdash; catalog of preserved imagery mapped to boards, investments, and philanthropy.
- `public/assets/` &mdash; Imported uploads, theme styles, and other static files.
- See also `../docs/architecture.md` for a full tour of the rebuild and guidance on extending it.
- `archive/` (at the repository root) &mdash; Unmodified exports of the legacy `site/` and
  `content-source/` folders for reference.

## Next Steps

- Replace or extend theme styling in `public/assets/css/` and Tailwind utilities in `src/styles`.
- Review `src/data/assets.ts` to confirm each logo reflects the latest board/investment roster and
  swap in higher fidelity artwork (e.g., venture partner logos) as it becomes available.
- Add collections or content sources as needed (MDX, CMS, etc.).
- Remove or enhance legacy pages such as `home-old` once no longer required.
