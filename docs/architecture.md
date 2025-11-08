# Architecture & Maintenance Notes

This document mirrors the root-level reference (`../docs/architecture.md`) so contributors working
solely inside the Astro project have the context they need. Keep both files in sync when shipping
structural changes.

## Project Layout

```
listwinventures-rebuild/
  public/                  # legacy CSS + uploads (large media ignored via .gitignore)
  src/
    components/            # HeroMedia, LogoGrid, etc.
    data/                  # assets.ts (media) + entityDetails.ts (portfolio metadata)
    layouts/               # BaseLayout.astro (sticky nav + dropdowns)
    pages/                 # Astro routes (home, CV, oral history, BelizeKids, company detail)
    styles/global.css      # Tailwind entry point + Apple-inspired theming
  docs/                    # this file
```

## Data Sources

- **`src/data/assets.ts`** – stores every logo/headshot and categorises them into board,
  investment, and philanthropy collections consumed by `LogoGrid`.
- **`src/data/entityDetails.ts`** – extends the catalog with copy, highlights, and slugs. It powers
  the `/company/[slug]` routes and navigation dropdowns.
- **`public/assets/uploads/`** – static media. Large items (GeoLite DB, Carbon Robotics videos,
  `*.mp4`) are ignored by git; copy them from the secure archive if you need them locally.

## Navigation & Dropdowns

`BaseLayout.astro` renders three dropdown menus fed by `entityDetails`:

1. **Work** – currently Carbon Robotics only.
2. **Investments** – grouped by stage (Seed/Private/Venture/Public) with extra Exits and
   philanthropic dividers.
3. **Community Projects** – philanthropic slugs.

When adding a new company, update `entityDetails` so the dropdowns, homepage grids, and company
detail pages stay in sync.

## Homepage Sections

After the hero and “My Story” modules, the homepage is limited to four sections:

1. **Recent Work** – Carbon Robotics spotlight (copy + CTA + media).
2. **Investments** – redesigned hero with thesis chips, CTA, and stage-specific grids.
3. **Exploits** – mirrors the investment layout, covering events, research initiatives, Belize
   community programmes, and hospitality experiences.
4. **Contact** – structured phone/email CTAs.

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
