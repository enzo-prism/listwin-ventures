# Design System — "Quiet Ledger"

The October 2026 redesign. Editorial, gallery-like whitespace; a serif display face over a clean
grotesk; one green accent carried over from the original Listwin Ventures logo. Light and dark are
both first-class. Motion is calm, precise, and always optional.

Everything below lives in `src/styles/global.css` (Tailwind 4, CSS-first — there is no
`tailwind.config.*` or `postcss.config.*` anymore) and a handful of components in `src/components/`.

## Principles

1. **Whitespace is the luxury.** Sections breathe (`.section-lv` ≈ 72–144px vertical padding).
   Prefer fewer, larger elements over many small boxes. Do not wrap whole sections in cards.
2. **Type does the work.** Headlines are Instrument Serif at display sizes; everything else is
   Geist. Meta labels are Geist Mono, uppercase, tracked.
3. **One accent.** `primary` (Listwin green) is used sparingly: italic `<em>` accents in headlines,
   hover states, small indicators. Buttons are ink (`btn-primary`), not green.
4. **Both themes, always.** Never hard-code `white`, `black`, `text-gray-*`, hex colors, or
   `bg-white`. Use tokens (`bg-background`, `bg-card`, `bg-muted`, `text-foreground`,
   `text-muted-foreground`, `border-border`, `text-primary`…). Check every page in dark mode.
5. **Motion is enhancement.** Content is visible without JavaScript and under
   `prefers-reduced-motion`. The Playwright suite runs with reduced motion.
6. **Mobile is not an afterthought.** 360px wide must look designed, not squeezed. No horizontal
   overflow, 44px+ tap targets, `text-wrap: balance` headlines.

## Tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | warm paper | deep green-black | page |
| `card` | white | raised charcoal | surfaces |
| `muted` / `subtle` | soft greys | charcoal steps | wells, chips, hover |
| `foreground` / `muted-foreground` | ink / grey | paper / grey | text |
| `border` / `input` | hairlines | hairlines | dividers, fields |
| `primary` | Listwin green | luminous mint | accent |
| `accent` / `accent-foreground` | green tint | green tint | subtle highlights |
| `glow` | mint | mint | aurora, spotlight, CTA accent |
| `plate` | white | near-white | logo plates (logos are raster, mostly dark-on-white) |

Radii: `rounded-xl` = 1.25rem base, `rounded-2xl`, `rounded-3xl`, and `rounded-[2rem]` for hero media.
Shadows: `shadow-[var(--shadow-soft)]`, `shadow-[var(--shadow-lift)]`, `shadow-[var(--shadow-panel)]`.

## Typography classes

| Class | Use |
|---|---|
| `.display-xl` | Homepage name only |
| `.display-lg` | Page `<h1>` (PageHero default) |
| `.display-md` | Section `<h2>` |
| `.display-sm` | Sub-section / card titles that should feel editorial |
| `.lede` | Intro paragraphs (muted, 18–21px) |
| `.prose-lv` | Long-form copy: inline links get a green underline; `h2`/`h3`, lists (green markers), and `code` are styled |
| `.eyebrow` | Mono label with a leading rule (`.eyebrow.no-rule` drops the rule) |
| `<em>` inside a display class | Italic green accent — use once per headline at most |

**Whitespace trap:** `compressHTML` is off in `astro.config.mjs` because Astro's compression glued
words to inline links that started on a new line ("founded the<a>Canary…"). Keep it off.

## Layout classes

- `.container-lv` — max 80rem, responsive side padding (20/32/48px). Use for every section.
- `.container-narrow` — add for reading-width (52rem) blocks.
- `.section-lv` / `.section-tight` — vertical rhythm for top-level sections.
- `.hairline` — gradient divider.

`BaseLayout` no longer wraps pages in a container: **each page owns its full-bleed sections**.

## Components

| Component | What it is |
|---|---|
| `Icon.astro` | Build-time SVG. `<Icon name="arrow-right" size={16} />`. Lucide names by default (lucide.dev/icons), `tabler:brand-x` for brand marks. Unknown names fail the build. No allowlist. Add `class="arrow"` inside `.btn` for the nudge-on-hover. |
| `PageHero.astro` | Page opener with aurora + grid backdrop and staggered word rise. Props: `eyebrow`, `title` (may contain one `<em>…</em>`), `intro`, `align`, `size`, `crumbs`. Default slot = action buttons; `slot="media"` = right column. |
| `SectionHeading.astro` | Eyebrow + display title + lede, optional right-aligned action slot. Reveals on scroll. |
| `LogoTile.astro` | Logo on a consistent plate + name + arrow. Links to `/company/<slug>` when one exists. |
| `CtaBand.astro` | Inverted ink band with glow; default copy routes to `/contact`. |
| `HeroMedia.astro` | Photo or logo figure (logos get a plate). |
| `PressLinkCard` / `PressPhotoCard` / `RelatedPressSection` | Press system. Whole card is clickable via `.stretched-link`. |
| `SharePanel.astro` | Rendered by `BaseLayout` at the bottom of `<main>` on share-enabled paths. |
| `BrandMark.astro` | The original Listwin Ventures logo (`/assets/media/listwin-ventures-logo.webp`) in the header and footer. Dark mode swaps in `listwin-ventures-logo-dark.webp` — the same artwork with only the black/grey text and "V" lightened; the green is untouched. Regenerate the dark file if the logo ever changes. |

Utility classes: `.btn` + `.btn-primary` (ink) / `.btn-secondary` (outlined card) / `.btn-ghost` /
`.btn-brand` (green, use rarely) / `.btn-sm`; `.link-arrow`; `.chip` (+ `.chip-live` pulsing dot);
`.card-lv` (+ `.card-hover` lift, + `.spotlight` cursor light); `.icon-well` (44px accent-tinted icon square); `.stretched-link`; `.logo-plate`
(+ `.is-dark`); `.media-frame` (+ `.zoom-media` slow zoom on hover); `.field` + `.field-label` for
form controls; `.aurora`, `.grid-lines`; `.marquee` + `.marquee-track`; `.video-frame`; `.stat-num`.

## Motion

All motion is wired by one inline script at the end of `BaseLayout.astro`. It only adds
`html.motion-ready` when IntersectionObserver exists and the visitor has not asked for reduced
motion — hidden-until-revealed states are scoped to that class, so no-JS and reduced-motion
visitors see everything immediately.

| Hook | Effect |
|---|---|
| `data-reveal` | Fade + rise + un-blur when scrolled into view. Variants: `data-reveal="fade"`, `"scale"`. |
| `data-reveal-stagger="70"` on a parent | Its direct `[data-reveal]` children get incremental delays. |
| `style="--reveal-delay:120ms"` | Manual delay. |
| `.rise` + `style="--d:200ms"` | Load-time rise (heroes). |
| `.rise-words > .word` + `--i` | Per-word load-time rise (PageHero does this for you). |
| `data-count-to="40" data-count-suffix="+"` | Count-up when visible (server-render the final value as text). |
| `.spotlight` | Cursor-following glow on fine pointers. |
| `.marquee` | Infinite logo strip; duplicate the set with `aria-hidden="true"`; pauses on hover; stops under reduced motion. |
| `.scroll-progress` | Top reading-progress bar (CSS scroll-timeline, no JS). |
| View transitions | `@view-transition { navigation: auto; }` cross-fades page navigations; the header persists. |
| Theme toggle | `[data-theme-toggle]` — circular reveal via `document.startViewTransition`. Choice saved in `localStorage['lv-theme']`; otherwise follows the OS. An inline `<head>` script applies it before first paint. |

Easing: `var(--ease-out-expo)` for nearly everything; durations 300–1100ms.

## Do / Don't

- ✅ Use `data-reveal` on section headings, card groups, and media — not on every paragraph.
- ✅ Full-bleed imagery in `media-frame` with `rounded-[2rem]`; use real photos from `public/assets`.
- ✅ Keep `<h1>` copy separate from `pageTitle` (see "Page Metadata" in `architecture.md`).
- ❌ No new runtime dependencies, frameworks, or client islands. The site ships zero framework JS.
- ❌ No external images (`https://…` in `<img src>`): the content tests forbid hotlinks.
- ❌ Don't invent facts, numbers, or quotes. Every claim must already exist in the data files or page copy.
