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
    pages/                 # Astro routes (home, contact form, oral history, BelizeKids.org, exploit detail, company detail)
    styles/global.css      # Tailwind entry point + Apple-inspired theming + shared .btn utility
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
- Extra media (e.g., the Carbon Robotics field footage) is defined near the top of the file. Add new entries there so `galleryAssets` and `carbonVideos` stay organized.

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
