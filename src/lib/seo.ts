// Helpers for generating page metadata from the data catalogs.
//
// These build the <title> and <meta name="description"> for the generated /company/[slug] and
// /exploits/[slug] routes. They are metadata only — never render their output as visible page
// copy, or headings start reading like title tags (pipes, brand suffix and all).

const BRAND_SUFFIX = ' | Listwin Ventures';
const TITLE_MAX = 60;
const DESC_MAX = 158;

// Words that must not be left stranded at the end of a truncated string.
const DANGLING = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet', 'of', 'in', 'on', 'at', 'to', 'for',
  'with', 'by', 'from', 'as', 'into', 'onto', 'over', 'under', 'after', 'before', 'between',
  'through', 'during', 'without', 'within', 'across', 'about', 'against', 'along', 'among',
  'around', 'behind', 'below', 'beside', 'beyond', 'near', 'off', 'out', 'per', 'since', 'than',
  'that', 'till', 'toward', 'towards', 'until', 'up', 'upon', 'via', 'while', 'who', 'whom',
  'whose', 'which', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'has', 'have', 'had',
  'its', 'their', 'his', 'her', 'our', 'your', 'it', 'this', 'these', 'those', 'not', 'can',
  'could',
]);

/**
 * Truncate on a word boundary. Never cuts mid-word and never leaves a dangling preposition or
 * auxiliary verb. `max` includes the ellipsis.
 */
export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;

  let cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);
  cut = cut.replace(/[\s,;:—–\-(“"']+$/u, '');

  const words = cut.split(' ');
  while (words.length > 1) {
    const bare = words[words.length - 1].toLowerCase().replace(/[^a-z'’-]/g, '');
    if (!DANGLING.has(bare)) break;
    words.pop();
  }
  cut = words.join(' ');

  if (/[.!?]$/.test(cut)) return cut;
  return `${cut.replace(/[.,;:]$/, '')}…`;
}

// Abbreviations and domain names that must not be treated as a sentence end.
const ABBREV = /(?:\b(?:Inc|Ltd|Corp|Co|Dr|Mr|Mrs|Ms|St|Jr|Sr|vs|etc|No)|\b[A-Z])\.$/;

/** Sentence split that survives "HP Inc.", "Software.com" and "BelizeKids.org". */
export function splitSentences(text: string): string[] {
  const parts: string[] = [];
  let buf = '';
  for (const token of text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)) {
    buf = buf ? `${buf} ${token}` : token;
    if (ABBREV.test(buf)) continue;
    if (!/[.!?]["'”’)]?$/.test(buf)) continue;
    parts.push(buf);
    buf = '';
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

/** Richest title variant that still fits within the 60-character budget. */
export function buildTitle(name: string, attribution = 'Don Listwin'): string {
  const full = `${name} — ${attribution}${BRAND_SUFFIX}`;
  if (full.length <= TITLE_MAX) return full;

  const short = `${name}${BRAND_SUFFIX}`;
  if (short.length <= TITLE_MAX) return short;

  return `${truncateAtWord(name, TITLE_MAX - BRAND_SUFFIX.length)}${BRAND_SUFFIX}`;
}

/**
 * Build a description from an ordered pool of prose, packing whole sentences so the result is
 * always grammatical. Falls back to a word-boundary truncation when even the first sentence is
 * too long. Records needing something better carry an explicit `seoDescription`.
 */
export function buildDescription(blocks: (string | undefined)[]): string {
  const pool = blocks
    .filter((block): block is string => Boolean(block && block.trim().length))
    .flatMap(splitSentences);
  if (!pool.length) return '';

  let out = '';
  for (const sentence of pool) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > DESC_MAX) break;
    out = next;
  }

  return out || truncateAtWord(pool[0], DESC_MAX);
}
