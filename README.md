# Listwin Ventures

Don Listwin's personal technology-investing and philanthropy site, live at
**https://www.listwinventures.com**. Astro 7 static site + Tailwind 4, deployed on Vercel (push to
`main` = production).

The site was redesigned end-to-end in October 2026 — the "Quiet Ledger" design system: editorial
whitespace, Instrument Serif display type over Geist, one Listwin-green accent, first-class light
and dark themes (OS-following, with a toggle), and calm, optional motion (scroll reveals, count-ups,
an animated network around the hero portrait, logo marquee, view transitions). **It ships zero
framework JavaScript.** See [`docs/design-system.md`](docs/design-system.md).

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

Visual snapshot baselines were regenerated for the October 2026 redesign (macOS renders). Refresh
them with `npx playwright test tests/visual.spec.ts --update-snapshots` after an intended visual
change, reviewing the diffs first.

### Large Files

The repo intentionally ignores:

- `public/assets/uploads/termageddon-maxmind/`
- `public/assets/uploads/2025/06/`
- All `*.mp4`

Copy those assets from the internal media archive if you need them locally. They are not
required for most development tasks, but missing files will surface as 404s when referencing
the related media.

## Project Structure

- `src/pages/` – Astro page routing (homepage, legal pages, BelizeKids.org spotlight, oral history, contact form, exploit detail pages, etc.). Each page owns its full-bleed sections (`.container-lv` + `.section-lv`).
- `src/layouts/BaseLayout.astro` – Global shell (no-flash theme init, sticky header that frosts on scroll, theme toggle, dropdown menus, footer, share strip, cookie-consent banner + deferred analytics loader, and the one motion script).
- `src/styles/global.css` – the whole design system: tokens (light + dark), type scale, buttons, cards, logo plates, form fields, motion. Tailwind 4 CSS-first config; there is no `tailwind.config.*` or PostCSS config.
- `src/components/PageHero.astro`, `SectionHeading.astro`, `LogoTile.astro`, `CtaBand.astro`, `BrandMark.astro`, `NetworkHalo.astro`, `Icon.astro` – the redesign's building blocks.
- `src/components/SiteNavigation.astro` – the header nav. **Zero-framework module JavaScript**
  (CSS desktop dropdowns + a native `<details>` mobile drawer with a small inline accessibility
  enhancement). It replaced the old React/Radix island. See “Navigation uses no framework
  JavaScript” in `docs/architecture.md`.
- `src/components/LogoGrid.astro`, `CompanyCarousel.astro`, and `HeroMedia.astro` – logo/media primitives (logos always sit on a `.logo-plate`; white-on-transparent marks are listed in `src/lib/logos.ts` and get a dark plate).
- Buttons are global classes: `.btn` + `.btn-primary` (ink) / `.btn-secondary` / `.btn-ghost` / `.btn-brand` / `.btn-sm`.
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

- Focus – curated spotlight items (driven by `workHighlights` in the layout).
- Investments – grouped by stage, plus an Exits group.
- Community – philanthropic entities.
- Some company routes intentionally hide the hero logo (Sequoia, HWVP, TeleSoft). Update the `hideHeroMedia` array inside `src/pages/company/[slug].astro` if you change that behaviour.
- The Carbon Robotics detail page owns a “Latest News” block (`carbonNews` in the same file); refresh it whenever there is a notable funding or product announcement.

## Navigation

The nav is a **zero-framework module-JS Astro component** (`src/components/SiteNavigation.astro`,
fed `navItems` from `BaseLayout.astro`). Desktop dropdowns open on CSS
`:hover`/`:focus-within`; the mobile drawer is a native `<details>` full-height sheet with large
serif entries. A small inline script keeps ARIA state synchronized, contains and restores focus,
makes background content inert, closes on Escape/backdrop activation, and preserves body scroll
state. Icons are Lucide names rendered by `Icon.astro`. It renders distinct menus:

- **Focus** – current focus areas (Carbon Robotics, 4AG, BelizeKids.org). Update `workHighlights` in the layout when the focus list changes.
- **Investments** – mega-menu fed by `investmentAssets`/`entityDetails`, grouped by stage with Exits last.
- **Community** – philanthropy slugs sourced from `entityDetails`.
- **About** – My Story, the Caltech 2025 and CHM 2018 interviews, and the Press library.
- **Press** – direct link to `/press`.
- **Home** – mobile drawer only (the logo is the home link on desktop).
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

All dropdowns share animated carets and card-style panels; the mobile nav expands into a full-height, touch-friendly sheet. A theme toggle (sun/moon) sits beside the nav on every breakpoint.

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

### Icons

`src/components/Icon.astro` renders Lucide (default) and Tabler (`tabler:` prefix) icons to inline
SVG at build time from the Iconify JSON packages. No allowlist, no runtime JS; an unknown name
fails the build.

## Press & References

- `/press` is backed by `src/data/press.ts`.
- Add `relatedSlugs: ['openwave']` (etc.) on a press item to surface it automatically on the matching `/company/[slug]` page.
- Prefer `publishedIso: 'YYYY-MM-DD'` when the publish date is known; otherwise use `publishedLabel`.
- Set `featured: true` to pin an item into the Featured section on `/press`.

## Next Steps

- Keep `docs/architecture.md` in sync when redesigning sections (hero, investments, exploits, nav).
- Use `src/data/entityDetails.ts` as the single source of truth for copy, CTA links, and navigation labels.
- Maintain `src/data/exploitDetails.ts` when adding new “Exploits” cards so `/exploits/[slug]` stays in sync with the homepage.
- Homepage content flows: Hero (portrait + animated network) → logo marquee → numbers → Current focus (Carbon Robotics, 4AG) → My Story → Milestones timeline → Interviews → Investments ledger (by stage) → Exploits (four themes) → Recognition → Contact CTA. The Contact form lives at `/contact`.
