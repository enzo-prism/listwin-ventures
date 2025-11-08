# Architecture & Maintenance Notes

This document mirrors the root-level reference (`../docs/architecture.md`) so contributors working
solely inside the Astro project have the context they need. Keep both files in sync when shipping
structural changes.

## Project Layout

```
listwinventures-rebuild/
  public/                  # legacy CSS + uploads (large media ignored via .gitignore)
  src/
    components/            # HeroMedia, LogoGrid, CompanyCarousel, etc.
    data/                  # assets.ts (media) + entityDetails.ts (portfolio metadata)
    layouts/               # BaseLayout.astro (sticky nav + dropdowns)
    pages/                 # Astro routes (home, contact form, oral history, BelizeKids, exploit detail, company detail)
    styles/global.css      # Tailwind entry point + Apple-inspired theming
  docs/                    # this file
```

## Data Sources

- **`src/data/assets.ts`** – stores every logo/headshot and categorises them into board,
  investment, and philanthropy collections consumed by `LogoGrid`.
- **`src/data/entityDetails.ts`** – extends the catalog with copy, highlights, and slugs. It powers
  the `/company/[slug]` routes and navigation dropdowns.
- **`src/data/exploitDetails.ts`** – drives the Exploits cards and `/exploits/[slug]` pages
  (NetAid, San Jose Grand Prix, Belize initiatives, Canary Cove, etc.).
- **`public/assets/uploads/`** – static media. Large items (GeoLite DB, Carbon Robotics videos,
  `*.mp4`) are ignored by git; copy them from the secure archive if you need them locally.

## Navigation & Dropdowns

`BaseLayout.astro` renders a responsive navigation system:

1. **Work** – curated spotlight cards (currently Carbon Robotics + BelizeKids.org). Update the
   `workHighlights` array in the layout when swapping focus projects.
2. **Investments** – mega-menu grouped by stage (`investmentAssets` + `entityDetails`). Exits sit in
   their own group at the end.
3. **Community** – philanthropy slugs pulled from `entityDetails`.
4. **Stories** – quick links to the oral-history interview and the on-page “My Story”.
5. **Contact** – persistent CTA linking to `/contact`.

The dropdown carets animate, the desktop mega-menu stays right-aligned to prevent overflow, and the
mobile nav expands into a full-width card with all sections stacked.

## Homepage Sections

After the hero and “My Story” modules, the homepage is limited to three key sections:

1. **Recent Work** – Carbon Robotics spotlight (copy + CTA + media).
2. **Investments** – hero text plus stage-specific carousels (Seed, Private, Exits, Venture, Public).
3. **Exploits** – themed cards that now link to `/exploits/[slug]` for long-form writeups.

The standalone contact section was removed; all inquiries route through `/contact`.

## Development Workflow

```bash
npm install
npm run dev       # http://localhost:8080
npm run build
npm run preview   # run after build to inspect /dist
```

Tailwind + Astro support hot reload. When editing data catalogs, run `npm run build` to ensure the
company detail routes still pre-render correctly.

## Documentation Expectations

- Update this file (and the root copy) whenever navigation rules, homepage sections, or data
  catalogues change.
- Record large-asset decisions so contributors know why certain directories are ignored by git.
- When adding a new component or workflow, briefly document the intent plus any required scripts
  or environment variables.
