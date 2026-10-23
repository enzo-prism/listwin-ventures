# Architecture & Maintenance Notes

This is the standalone architecture reference for the Astro project. Keep it in sync when shipping
structural, security, routing, or deployment changes.

## Project Layout

```
listwin-ventures/
  public/                  # legacy CSS (kept for reference; not loaded) + uploads (large media ignored via .gitignore)
  playwright.config.ts     # Playwright config for responsive/content/visual tests
  src/
    components/            # PageHero, SectionHeading, LogoTile, CtaBand, Icon, BrandMark (original logo + dark variant), NetworkHalo, press cards…
    data/                  # assets.ts + entityDetails.ts + exploitDetails.ts + press.ts (content catalogs)
    layouts/               # BaseLayout.astro (theme init, header, nav, footer, consent, motion script)
    lib/                   # seo.ts, ga4.ts, logos.ts (dark-plate logo ids)
    pages/                 # Astro routes (home, contact form, oral history, BelizeKids.org, exploit detail, company detail)
    styles/global.css      # the design system: Tailwind 4 entry + tokens (light/dark) + components + motion
  tests/                   # Playwright + node:test suites
  docs/                    # this file, design-system.md, site-copy.md
```

## CSS Strategy

- `src/styles/global.css` is the only global stylesheet entry point. It is a **Tailwind 4 CSS-first**
  config: `@import 'tailwindcss'`, a class-based `dark` custom variant, theme tokens declared as
  plain CSS variables on `:root` / `.dark` and mapped into utilities with `@theme inline`, plus the
  component classes and motion. The full reference is `docs/design-system.md`.
- Tailwind runs through `@tailwindcss/vite` (registered in `astro.config.mjs`). There is no
  `tailwind.config.*`, `postcss.config.*`, or `components.json` anymore.
- Fonts are self-hosted via `@fontsource` packages (Geist Variable, Geist Mono Variable, Instrument
  Serif) and bundled into `/_astro/`, so the CSP's `font-src 'self'` needs no third-party host.
- Theme: an inline `<head>` script in `BaseLayout.astro` applies `.dark` before first paint from
  `localStorage['lv-theme']`, falling back to `prefers-color-scheme`. The toggle
  (`[data-theme-toggle]`) uses a View Transition circular reveal where supported.
- `compressHTML` is **off** in `astro.config.mjs`. Astro's compression removed the newline between
  running text and an inline element that started on the next source line, gluing words together
  ("founded the<a>Canary Foundation</a>") across the old site. Keep it off.
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

1. **Focus** – current focus areas (Carbon Robotics, 4AG, BelizeKids.org). Update the
   `workHighlights` array in the layout when swapping focus projects; each item carries a Lucide icon
   name and a one-line description.
2. **Investments** – mega-menu grouped by stage (`investmentAssets` + `entityDetails`). Exits sit in
   their own group at the end.
3. **Community** – philanthropy slugs pulled from `entityDetails`.
4. **About** – My Story, the Caltech 2025 interview, the CHM 2018 oral history, and the Press library.
5. **Press** – a direct link.
6. **Contact** – persistent ink CTA linking to `/contact`. A theme toggle sits to its right.

`Home` is a `mobileOnly` item (the logo links home on desktop). The dropdown carets animate, the
desktop mega-menu stays right-aligned to prevent overflow, and the mobile nav is a full-height sheet
with large serif entries and accordion sections. `aria-current="page"` marks the active route.

- Leaf icons are Lucide names rendered by `src/components/Icon.astro` (no allowlist).

### Navigation uses no framework JavaScript (`SiteNavigation.astro`)

- The nav was a React island (`SiteNavigation.tsx`, `client:load`) that pulled React + Radix +
  lucide onto **every** page (~300 KB). It is now a pure Astro component:
  - **Desktop dropdowns** open via CSS `:hover`/`:focus-within` — no JS needed to show/hide.
    Closed panels are `display:none` (not `visibility:hidden`) so their 700px box never contributes
    to document width and never creates horizontal overflow.
  - Panels are **right-aligned to their trigger** and single-section menus render one narrow column
    (`w-64`); only multi-section menus (Investments) use the wide `w-max` mega-grid. This keeps every
    panel on-screen at 1024–1920 without clipping. `tests/responsive.spec.ts` guards the overflow.
  - **Mobile** uses a native `<details>`/`<summary>` drawer with `<details>` accordions inside —
    fully functional with JS disabled.
  - A small `is:inline` accessibility enhancement syncs `aria-expanded`, gives the drawer modal
    semantics, contains keyboard focus, returns focus to the trigger, marks background content
    inert, closes on Escape/backdrop activation, preserves body scroll state, and unlocks the page
    if the viewport changes to desktop.
  - Static markup deliberately omits JavaScript-only `aria-expanded` and `aria-modal` state. With
    JavaScript disabled, the native summary moves above the open panel and remains the close control.
  - The sticky header's `backdrop-filter` would otherwise make it the containing block for fixed
    descendants in Chromium. The open state disables that filter and raises the header above the
    consent banner so the panel and backdrop cover the full viewport. The mobile Playwright checks
    guard this geometry and stacking behavior.
  - No page hydrates a framework anymore: the `/4ag` Embla/React carousel was replaced by a CSS
    scroll-snap gallery, and React, Radix, shadcn/ui, and `astro-icon` were removed in the October
    2026 redesign.
  - The drawer toggle is a `<summary>`, not a `<button>` — update selectors accordingly.

## Canonical URLs & Share Links

- `src/layouts/BaseLayout.astro` is the single source of truth for canonical page URLs. It builds
  `pageUrl` from the production origin plus `Astro.url` path/query/hash components.
- Do **not** use `Astro.url?.href` for share or OpenGraph URL values on static pages, because build
  output can otherwise inherit `http://localhost:8080/...`.
- **The canonical host is `https://www.listwinventures.com` (with `www`).** Production serves `www`
  with a 200 and 307-redirects the apex to it, so every URL the site emits must use `www` — a
  canonical pointing at a redirecting host is worse than no canonical at all. Five files must agree:
  `astro.config.mjs`, `BaseLayout.astro`, `sitemap.xml.ts`, `robots.txt.ts`, `llms.txt.ts`.
- ⚠️ The apex→www redirect is currently **307 (temporary)**, which tells Google *not* to consolidate
  the hosts. It should be **308/301 permanent** — that is a Vercel domain setting, not a repo change.
- Canonical URLs strip the trailing slash. Both `/press` and `/press/` return 200, so without
  normalization a page's self-canonical (`/genologics/`) would disagree with another page's override
  pointing at it (`/genologics`).
- `src/components/SharePanel.astro` powers social share buttons and Copy Link. It also normalizes
  links at runtime with `window.location.href` and includes a clipboard fallback (`document.execCommand('copy')`)
  for browsers where `navigator.clipboard` is unavailable.
- Share-strip visibility is controlled in `BaseLayout.astro` via `shareEnabledPaths` and
  `shareEnabledPrefixes`; update those lists when adding/removing key routes.
- Regression check after share/SEO URL changes:
  - `npm run build`
  - `rg "localhost:8080|localhost" dist`

## Page Metadata (titles, descriptions, OpenGraph, structured data)

`BaseLayout.astro` accepts optional metadata props, all defaulted so a page that passes only
`title` and `description` behaves exactly as before:

| Prop | Purpose |
|---|---|
| `canonical` | Point at a different URL when two routes cover the same subject |
| `ogType` | `website` (default) or `article` |
| `ogImage` / `ogImageAlt` | Per-page share image; falls back to the site card |
| `robots` | Emits `<meta name="robots">`; omitted entirely when unset |
| `jsonLd` | Page-specific schema.org node(s), appended to the shared `@graph` |

Rules worth knowing before editing:

- **Never render `pageTitle` or `pageDescription` as visible page copy.** They are title-tag and
  meta-description strings — brand suffix, pipes and all. `/4ag`, `/belizekids`, `/genologics`, and
  both dynamic routes previously did this, so the on-page `<h1>` literally read
  `4AG Robotics | Don Listwin Investment | Listwin Ventures`. Each page now keeps separate
  `heading`/`intro` (or `intro`) consts for what the visitor sees.
- Generated routes build metadata through `src/lib/seo.ts` (`buildTitle`, `buildDescription`).
  `buildDescription` packs whole sentences so the result is always grammatical, and
  `truncateAtWord` never cuts mid-word or leaves a dangling preposition.
- Records whose generated output would be poor carry `seoTitle` / `seoDescription` / `seoName`
  overrides in `entityDetails.ts` and `exploitDetails.ts`. `seoName` exists because some names are
  derived from logo alt text (`Sequoia Capital`, `VIDA lung health`).
- **Overrides are also the factual-integrity control.** Several `summary` fields carry unsourced
  superlatives ("the only foundation in the world…", "a leading provider", "pioneered"). A meta
  description is the most-quoted surface on the site, so those records have an `seoDescription` that
  states the same thing without the unverifiable claim. Keep that bar for new records.
- The Canary Foundation founding year is **2004** (per canaryfoundation.org and Wikipedia:
  "founded in 2004 by … Don Listwin"). The homepage "My Story" prose previously said 2002 in two
  places — now corrected to 2004 so the whole site agrees with the Exploits card. `docs/site-copy.md`
  still shows 2002 because it archives the original legacy WordPress copy verbatim.
- Metadata must not assert the site's remaining known-contested fact: the board count (three vs nine).
- Page-specific JSON-LD appends into the **same** `@graph` so it stays cross-linked to the
  Organization/Person/WebSite nodes by `@id`. Do not emit a second `<script>`.
- `Organization.description` and `WebSite.description` use a fixed `siteDescription`, deliberately
  **not** the page description — otherwise those entities claim a different identity on all 53 pages.
- `personSameAs` in `BaseLayout.astro` lists only URLs that were fetched and identity-confirmed. Do
  not add one that cannot be verified: a wrong `sameAs` actively harms entity resolution. LinkedIn
  and Crunchbase are deliberately absent because they bot-block automated checks (999 / 403) and
  need a human to confirm them in a browser first.

## Homepage Sections

`src/pages/index.astro`, top to bottom:

1. **Hero** – rotating role line, display name, lede, CTAs, and the portrait inside `NetworkHalo`
   (an SVG network whose links draw in and whose "packets" travel via `animateMotion`; packets are
   removed under reduced motion). Two floating badges (Cisco 1990–2000, Canary Foundation 2004).
2. **Logo marquee** – every distinct board/investment logo on plates; pauses on hover, static
   under reduced motion.
3. **Numbers** – count-ups for figures stated in the My Story copy (40+ years, 10 years at Cisco,
   $12B+, 4 boards). Do not add a number that the copy does not state.
4. **Current focus** (`#focus`) – full-bleed photo cards for Carbon Robotics and 4AG.
5. **My Story** (`#my-story`) – sticky heading + the verbatim story copy. `tests/content.spec.ts`
   asserts its text and that `4AG Robotics` / `Carbon Robotics` each resolve to exactly one link
   inside `#my-story`, so do not add other links whose accessible name contains those strings here.
6. **Milestones** (`#journey`) – horizontal scroll-snap timeline (arrows are a progressive
   enhancement), every entry sourced from the story copy or press library.
7. **Interviews** – Caltech 2025 and CHM 2018 cards.
8. **Investments** (`#investments`) – a ledger: one row per stage with `LogoTile`s. The `Exits`
   `<h3>`'s parent must contain the exit names (content test).
9. **Exploits** (`#exploits`) – four themes (Big Events / Big Idea / Big Love / Big Fun) with photo
   cards linking to `/exploits/[slug]` or company pages; a five-card theme gets a 2×2 featured card.
10. **Recognition** – the Wikimedia FT photo with credit + primary-source Stanford links.
11. **CTA band** → `/contact`.

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
  - Full transcript PDF link is always shown. It is served from Cloudinary via `transcriptPdfUrl` in
    `src/pages/oral-history-caltech.astro`, not from the local copy that still exists at
    `public/media/oral-history/caltech-2025/transcript-full.pdf`.
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

## Icons

`src/components/Icon.astro` renders icons to inline SVG at build time from `@iconify-json/lucide`
(default set) and `@iconify-json/tabler` (`tabler:` prefix, used for brand marks). There is no
allowlist; an unknown name throws during `npm run build`. Icons are `aria-hidden` unless a `label`
prop is passed.

## Sitemap

- `src/pages/sitemap.xml.ts` builds `sitemap.xml` from a `staticRoutes` list plus the company and exploit slugs.
- When adding a new top-level static page (example: `/press`), also add it to `staticRoutes`.
- `/oral-history-caltech` is included in `staticRoutes` as the Caltech 2025 interview route.
- `/cv` is intentionally excluded from `staticRoutes` and all public discovery files.
- `/cv` is not an Astro route. `vercel.json` rewrites it to `api/cv.js`, which fails closed unless both `CV_PASSWORD` and `CV_SESSION_SECRET` are configured.
- The handler uses a constant-time comparison against `CV_PASSWORD`, then issues an eight-hour
  signed `HttpOnly; Secure; SameSite=Strict` session token with private/no-store response headers.
  The reusable password is never stored in the browser cookie.
- The CV viewer, original Word file, and printable PDF live under `private/`, are included only in
  the Vercel function bundle, and must never be moved under `public/` or `src/pages/`.
- `/cv` is deliberately not blocked in `robots.txt`, so crawlers can receive the handler's `X-Robots-Tag: noindex` response and remove any previously indexed URL. Authentication remains the access-control boundary.

## Hosting and headers

- This site is deployed on **Vercel**. Pushing to `main` auto-deploys production via the Vercel
  GitHub integration; branch pushes get preview deployments.
- ⚠️ `public/_headers` uses Netlify/Cloudflare Pages syntax and **is inert on Vercel** — it is a
  leftover from an earlier host. Its `X-Robots-Tag` rules for `/cv` have never applied in
  production. They are also redundant: `api/cv.js` sets that header itself on every response.
  **Do not add security or cache headers to `public/_headers` expecting them to work.** Real
  headers belong in the `headers` array of `vercel.json`, or in the handler.
- `vercel.json` applies the public site's security headers to every non-API, non-CV route:
  `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and
  `X-Frame-Options: DENY`. The CSP defaults to same-origin content, blocks object embeds and
  third-party framing, and allowlists only the site's required runtime services:
  - GA4 and Hotjar scripts/connections after consent.
  - Formspree for the contact form's native and enhanced submissions.
  - YouTube for the oral-history embed.
  - 4AG and Cloudinary for initiative/company videos.
  - HTTPS images because the curated portfolio/press catalogs intentionally use multiple external
    image hosts; executable resources remain on explicit host allowlists.
- Keep the public-header rule's `/api` and `/cv` exclusions. `api/cv.js` owns the private route's
  stricter no-store/no-referrer/CSP policy, and duplicate edge headers can produce an accidental
  intersection that blocks the authenticated viewer.
- Inline scripts/styles remain allowed because Astro renders several small inline enhancements,
  structured-data scripts, and element styles. Third-party scripts still require explicit hosts,
  and `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'none'` reduce the risk.
- Static assets are served with `Cache-Control: public, max-age=31536000, immutable` by Vercel's
  defaults. Vercel also supplies `Strict-Transport-Security: max-age=63072000` to deployment
  responses, so the repo deliberately does not duplicate or weaken HSTS.
- `api/cv.js` function assets use an exact `includeFiles` allowlist. Never broaden it to
  `private/**`: unrelated working files under `private/` must not enter the deployed function.

## Analytics & cookie consent

- Google Analytics (`gtag`, `G-5R6NTCMFK3`) and Hotjar (`hjid 6585931`) used to load eagerly in
  `<head>` on every page. They now load **only after an explicit opt-in** and, even then, off the
  critical path via `requestIdleCallback`. The loader + consent banner live at the bottom of
  `BaseLayout.astro`.
- The choice is stored in `localStorage` under `lv-analytics-consent` (`granted`/`denied`). Granted
  → analytics load immediately on later visits; denied → nothing loads; no decision → the banner
  shows. The banner is `role="region"` (a persistent non-modal notice, **not** a `dialog` — that
  role is reserved for the mobile nav drawer, and two dialogs break `getByRole('dialog')`).
- To change measurement IDs, edit the constants in the consent `is:inline` script.

## Contact form

- `src/pages/contact.astro` posts to the third-party endpoint in **`PUBLIC_CONTACT_ENDPOINT`**
  (a Formspree endpoint). It is already configured in Vercel for Production + Preview and in
  `.env.local`. Because `PUBLIC_*` vars inline at **build time**, changing the endpoint requires a
  redeploy/rebuild (e.g. `vercel redeploy <prod-deployment>`), not just an env edit. A brand-new
  Formspree form also needs a one-time email confirmation before it delivers.
- Progressive enhancement: with JS it submits via `fetch` (inline status, no navigation); without JS
  it falls back to a native POST. A hidden `_gotcha` honeypot filters bots. When the variable is
  unset the form tells the visitor it is not configured rather than silently dropping the message.
- The form controls are native `<input>`/`<textarea>` elements styled with the design system's
  `.field` / `.field-label` classes (the shadcn/React components were removed).

## Image optimization

- Remote Cloudinary image URLs carry `f_auto,q_auto` transforms (AVIF/WebP + auto quality). The
  `Don_Listwin_*.pdf` transcript URL is deliberately left untransformed — it is not an image.
- Raw `<img>` tags in the shared components and the homepage grids set `decoding="async"` alongside
  `loading="lazy"`; the hero portrait is `eager` + `fetchpriority="high"`.
- Logos are raster files with inconsistent backgrounds, so they always render on a `.logo-plate`
  (white in both themes). White-on-transparent marks (Carbon Robotics, HWVP) are listed in
  `src/lib/logos.ts` and get the dark plate. Images under `public/` are still not run through `astro:assets` (that would mean
  moving them into `src/`); a future migration could add responsive `srcset`/AVIF at build time.

## Private CV operations

- **The security boundary is that every file under `private/` is outside the static build.** The
  handler reads the viewer, original Word CV, and printable PDF only after the password check
  passes. Anything under `public/` or `src/pages/` is fetchable by anyone with `curl`, no matter
  what JavaScript sits in front of it — so a client-side password check is not an option here.
  This page was publicly exposed once (July 2026) and that is the mistake to avoid repeating.
- Authenticated routes:
  - `/cv` serves the private viewer.
  - `/cv/download.doc` downloads Don's exact July 2026 Word file.
  - `/cv/document.pdf` serves the two-page printable PDF exported from that Word file with Apple
    Pages so Book Antiqua headings, Times New Roman body text, square bullets, spacing, and page
    breaks match Don's source formatting.
  - `/cv/page-1.png` and `/cv/page-2.png` serve browser-safe previews rendered from that PDF.
  - The original Word file stays byte-for-byte unchanged; only its derived PDF/PNG previews may be
    regenerated.
  All asset routes return `Cache-Control: private, no-store` and no-index headers. Anonymous asset
  requests return the login page and never receive document bytes.
- Configure both `CV_PASSWORD` and a separate `CV_SESSION_SECRET` in every Vercel environment that
  serves this route (Production, Preview, and Development). The handler returns `503` when either is
  missing. The password itself never appears in the signed session token.
- **Vercel binds environment variables at deploy time, so an env change alone has no effect — you
  must redeploy.** `vercel redeploy <current-production-url>` reuses the exact deployed source and
  is safer than `vercel --prod`, which rebuilds from your local working copy. Confirm afterwards
  that a correct password returns `303` and a wrong one returns `401`.
- Changing `CV_PASSWORD` or `CV_SESSION_SECRET` invalidates existing signed sessions.
- Never commit the plaintext password to this repo, to `docs/`, or to a commit message.
- Two Vercel WAF rules rate-limit both `/cv` and direct `/api/cv` password posts to five attempts per
  IP every ten minutes. Keep both rules enabled and publish staged firewall changes before release.
  The live rule IDs are `rule_rate_limit_cv_login_GUMWLK` and
  `rule_rate_limit_direct_cv_function_s7XKzB`.

## Private CV login screen

- The password field has a show/hide eyeball. Notes for anyone editing it:
  - The inline toggle script is permitted by a **CSP hash derived from the script itself**
    (`SCRIPT_HASH` in `api/cv.js`), so it can never go stale. Do not add `'unsafe-inline'`.
  - `img-src` **must keep `'self'`** so the authenticated viewer can load its protected page
    previews. Printing uses the browser PDF viewer.
  - Icon visibility uses `toggleAttribute('hidden', …)`, **not** `.hidden = …`. The `hidden` IDL
    property lives on `HTMLElement`; the icons are `SVGElement`, so assigning `.hidden` does nothing.
  - There is deliberately **no `aria-pressed`**. A flipping accessible name plus a pressed state
    announces "Hide password, pressed", implying the opposite of the true state. State is announced
    via the `#password-status` polite live region instead.
  - The button ships with the `hidden` attribute and is revealed by the script, so no dead control
    appears without JavaScript. The stylesheet needs `[hidden]{display:none!important}` because the
    author `display` rules would otherwise beat it.
  - `autofocus` is applied **only** on the error render, where it lands on the field described by
    `aria-describedby`; a clean load leaves focus alone so screen readers hear the instructions.
- **The `#username` field exists so password managers can save the credential with a usable label**,
  and so Safari 15.4+ does not interrupt with "enter the username for this account". Its exact shape
  is load-bearing and non-obvious:
  - It must **not** be `type="hidden"`. Chromium excludes hidden inputs from the FormData the
    password manager sees, and Firefox's username-compatible type allowlist omits `hidden`. The
    WHATWG spec blesses `<input type=hidden autocomplete=username>`; no major engine honours it for
    password management, so the spec is not a safe guide here.
  - It is **CSS-clipped (`.pm-anchor`), not `display:none`**. Verified in real Chrome via
    `chrome://password-manager-internals`: `display:none` is classified `invisible`, clipping is
    classified `visible` and stays on the interactability path as well as the autocomplete path.
  - Its own class, not `.sr-only` — `.sr-only` exists to *expose* the live region to screen readers,
    the opposite intent.
  - `readonly` + `tabindex="-1"` + `aria-hidden="true"` keep it out of the tab order and the
    accessibility tree. The server ignores the field; `readPassword` reads only `password`.
- **Two existing behaviours are load-bearing for save detection — do not change them.** The `303`
  redirect is the strongest submission signal the platform offers, and the `401` on a wrong password
  is what suppresses a save prompt for a failed login (Chrome checks both
  `WasLastNavigationHTTPError` and whether the form reappears). Changing the 401 to a 200 would make
  browsers offer to save wrong passwords.
- The Credential Management API (`navigator.credentials.store`) was evaluated and rejected:
  Chromium-only, an eleven-year-old W3C Working Draft with no WebKit or Mozilla position, unreachable
  by third-party managers (they parse the DOM), and it would require replacing the native POST with
  `preventDefault` + `fetch`, breaking the no-JavaScript path.
- Run `npm run test:cv-auth`, `npm run test:e2e:cv`, `npm run build`, and verify that `dist/`
  contains no CV HTML, Word, or PDF assets before deploying. `test:e2e:cv` serves `api/cv.js` over
  a local HTTP shim (`tests-cv/serve-cv.mjs`), so it needs no `vercel dev` and no credentials.
- Production acceptance: anonymous/wrong-password requests expose no CV or document bytes;
  authenticated HTML, Word, and PDF requests return `Cache-Control: private, no-store`; the Word
  download matches its checked SHA-256; logout and tampered/expired cookies fail closed.

## Development Workflow

```bash
npm install
npm run dev       # http://localhost:8080
npm run build
npm run preview   # run after build to inspect /dist
npm audit
npm run test:security-headers
npm run test:cv-auth
npm run test:e2e:cv
npm run test:e2e   # Playwright responsive/content/visual tests (multi-viewport)
```

Tailwind + Astro support hot reload. When editing data catalogs, run `npm run build` to ensure the
company detail routes still pre-render correctly.

### Responsive QA (Playwright)

- First-time setup may require downloading browsers: `npx playwright install`
- CI builds that do not run `npm run test:e2e` can skip browser downloads by setting
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`.

### Release verification

- Use Node 22.x locally and in Vercel.
- `npm audit` must report zero known vulnerabilities.
- `npm run test:security-headers` validates both the public header policy and the exact five-file
  private CV function allowlist.
- `npm run test:cv-auth` and `npm run test:e2e:cv` must pass after any CV or Vercel routing change.
- Run `npx playwright test tests/responsive.spec.ts` after any navigation or header change.
- `npm run build` must complete all 53 static pages, and `dist/` must contain no private CV files.
- After production deploys, verify public security headers, anonymous `/cv` access, protected asset
  denial, and the production deployment commit before calling the release complete.

## Documentation Expectations

- Update this file whenever navigation rules, homepage sections, or data catalogues change. (There
  is no root-level copy of this document; the repo is standalone.)
- Record large-asset decisions so contributors know why certain directories are ignored by git.
- When adding a new component or workflow, briefly document the intent plus any required scripts
  or environment variables.
