export type PressKind = 'article' | 'interview' | 'press-release' | 'video' | 'reference';

export type PressItem = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  summary: string;
  kind: PressKind;
  author?: string;
  /**
   * ISO date in YYYY-MM-DD form when we know the precise publish date.
   * Used for sorting + consistent formatting.
   */
  publishedIso?: string;
  /**
   * Fallback display label when the exact day/month is unknown (ex: "2018").
   */
  publishedLabel?: string;
  quote?: string;
  tags?: string[];
  relatedSlugs?: string[];
  featured?: boolean;
};

const pressItems: PressItem[] = [
  {
    id: 'time-openwave-profile-2003',
    title: 'Openwave',
    publisher: 'TIME',
    author: 'Chris Taylor',
    publishedIso: '2003-07-28',
    url: 'https://time.com/archive/6669206/openwave-don-listwin-redwood-city-calif/',
    summary:
      'TIME’s 2003 profile on Don Listwin’s Openwave era, covering the dot-com crash, the turnaround, and the leadership lessons that stuck.',
    kind: 'article',
    quote: 'Through failure, we learn lessons in humility.',
    tags: ['dot-com', 'turnaround', 'leadership', 'mobile-internet'],
    relatedSlugs: ['openwave'],
    featured: true,
  },
  {
    id: 'chm-oral-history-2018',
    title: 'Oral History of Don Listwin',
    publisher: 'Computer History Museum',
    publishedLabel: '2018',
    url: '/oral-history',
    summary:
      'Long-form interview and chapter summary covering Cisco, Openwave, and the Canary Foundation.',
    kind: 'interview',
    tags: ['leadership', 'career', 'cisco', 'openwave', 'philanthropy'],
    relatedSlugs: ['openwave', 'canary-foundation', 'belizekids'],
  },
  {
    id: 'carbon-robotics-businesswire-2025-06-02',
    title: 'Carbon Robotics Adds Lead Independent Director to Board',
    publisher: 'Business Wire',
    publishedIso: '2025-06-02',
    url: 'https://www.businesswire.com/news/home/20250602427241/en/Carbon-Robotics-Adds-Lead-Independent-Director-to-Board',
    summary:
      'Board update and company milestones from Carbon Robotics.',
    kind: 'press-release',
    tags: ['board', 'robotics', 'agtech'],
    relatedSlugs: ['carbon-robotics'],
  },
  {
    id: 'zevx-press-release-2023-02-16',
    title: 'ZEVX Closes $20M+ Funding Round, Appoints Don Listwin as CEO',
    publisher: 'ZEVX',
    publishedIso: '2023-02-16',
    url: '/zevx-closes-20m-funding-round-appoints-don-listwin-as-ceo',
    summary:
      'Press release detailing ZEVX’s funding round and Don Listwin’s appointment as CEO.',
    kind: 'press-release',
    tags: ['ev', 'funding', 'leadership'],
    relatedSlugs: ['zevx'],
  },
];

const scoreFeatured = (item: PressItem) => (item.featured ? 1 : 0);
const scoreDate = (item: PressItem) => {
  if (!item.publishedIso) return Number.NEGATIVE_INFINITY;
  const ts = Date.parse(item.publishedIso);
  return Number.isFinite(ts) ? ts : Number.NEGATIVE_INFINITY;
};

export const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

export const getPressItems = () =>
  [...pressItems].sort((a, b) => scoreFeatured(b) - scoreFeatured(a) || scoreDate(b) - scoreDate(a));

export const getRelatedPressItems = (slug: string, limit = 4) =>
  getPressItems().filter((item) => item.relatedSlugs?.includes(slug)).slice(0, limit);

