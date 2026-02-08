export type PressKind = 'article' | 'interview' | 'press-release' | 'video' | 'reference';

export type PressSection = 'cancer-early-detection' | 'technology-leadership';

export type PressItem = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  summary: string;
  kind: PressKind;
  section?: PressSection;
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
    section: 'technology-leadership',
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
    section: 'technology-leadership',
    tags: ['leadership', 'career', 'cisco', 'openwave', 'philanthropy'],
    relatedSlugs: ['openwave', 'canary-foundation', 'belizekids'],
    featured: true,
  },
  {
    id: 'stanford-medicine-canary-center-2009-06-09',
    title: 'Foundation to Back Early Cancer Detection Center',
    publisher: 'Stanford Medicine',
    publishedIso: '2009-06-09',
    url: 'https://med.stanford.edu/news/all-news/2009/06/foundation-to-back-early-cancer-detection-center.html',
    summary:
      'Stanford Medicine announcement on Canary Foundation and Stanford committing $20M to establish the Canary Center for Cancer Early Detection.',
    kind: 'article',
    section: 'cancer-early-detection',
    tags: ['canary-foundation', 'stanford', 'early-detection'],
    relatedSlugs: ['canary-foundation', 'stanford'],
    featured: true,
  },
  {
    id: 'stanford-canary-center-history',
    title: 'History',
    publisher: 'Stanford Canary Center',
    url: 'https://med.stanford.edu/canarycenter/history.html',
    summary:
      'Stanford Canary Center background page with a timeline of the center’s creation and leadership credits (including Don Listwin and Sam Gambhir).',
    kind: 'reference',
    section: 'cancer-early-detection',
    tags: ['canary-center', 'stanford', 'reference'],
    relatedSlugs: ['canary-foundation', 'stanford'],
  },
  {
    id: 'stanford-medicine-canary-pledge-2007-05-30',
    title: 'Canary Foundation Pledges to Team With Cancer Center',
    publisher: 'Stanford Medicine',
    publishedIso: '2007-05-30',
    url: 'https://med.stanford.edu/news/all-news/2007/05/canary-foundation-pledges-to-team-with-cancer-center.html',
    summary:
      'Stanford Medicine coverage of Canary Foundation’s pledge to support early-detection research in partnership with Stanford’s cancer center.',
    kind: 'article',
    section: 'cancer-early-detection',
    tags: ['canary-foundation', 'stanford', 'early-detection'],
    relatedSlugs: ['canary-foundation', 'stanford'],
  },
  {
    id: 'don-listwin-award-early-detection-research',
    title: 'Don Listwin Award',
    publisher: 'Early Detection of Cancer Conference',
    url: 'https://www.earlydetectionresearch.com/award/',
    summary:
      'Overview of the Don Listwin Award for Early Detection of Cancer, including its mission and links to award context.',
    kind: 'reference',
    section: 'cancer-early-detection',
    tags: ['award', 'early-detection', 'reference'],
    relatedSlugs: ['canary-foundation'],
  },
  {
    id: 'cambridge-early-cancer-institute-don-listwin-award-2024-10-24',
    title: 'Prof Antonis Antoniou Announced as 2024 Don Listwin Award Winner',
    publisher: 'Cambridge Early Cancer Institute',
    publishedIso: '2024-10-24',
    url: 'https://www.earlycancer.cam.ac.uk/news/prof-antonis-antoniou-announced-2024-don-listwin-award-winner',
    summary:
      'University of Cambridge announcement naming Prof. Antonis Antoniou as the 2024 Don Listwin Award winner.',
    kind: 'article',
    section: 'cancer-early-detection',
    tags: ['award', 'cambridge', 'early-detection'],
    relatedSlugs: ['canary-foundation'],
  },
  {
    id: 'cancer-research-uk-peter-sasieni-don-listwin-award-2023-10-11',
    title:
      '“Seeing Those Results for the First Time Made My Whole Career Seem Worthwhile” — Peter Sasieni Wins Don Listwin Award',
    publisher: 'Cancer Research UK',
    publishedIso: '2023-10-11',
    url: 'https://news.cancerresearchuk.org/2023/10/11/seeing-those-results-for-the-first-time-made-my-whole-career-seem-worthwhile-peter-sasieni-wins-don-listwin-award/',
    summary:
      'Cancer Research UK profile on Peter Sasieni receiving the Don Listwin Award and the impact of early-detection research.',
    kind: 'article',
    section: 'cancer-early-detection',
    tags: ['award', 'early-detection', 'research'],
    relatedSlugs: ['canary-foundation'],
  },
  {
    id: 'fred-hutch-canary-foundation-research-floor-2010-08-30',
    title: 'Arnold Floor Named to Honor Canary Foundation',
    publisher: 'Fred Hutch',
    publishedIso: '2010-08-30',
    url: 'https://www.fredhutch.org/en/news/center-news/2010/08/Arnold-Canary-Foundation.html',
    summary:
      'Fred Hutch recognition story naming a research floor in honor of the Canary Foundation and its early-detection support.',
    kind: 'article',
    section: 'cancer-early-detection',
    tags: ['recognition', 'canary-foundation', 'research'],
    relatedSlugs: ['canary-foundation'],
  },
  {
    id: 'prnewswire-canary-foundation-gifts-2012-08-22',
    title:
      'Canary Foundation Announces $8.5 Million in Gifts to Advance Vital Cancer Early Detection Studies',
    publisher: 'PR Newswire',
    publishedIso: '2012-08-22',
    url: 'https://www.prnewswire.com/news-releases/canary-foundation-announces-85-million-in-gifts-to-advance-vital-cancer-early-detection-studies-167085565.html',
    summary:
      'PR Newswire release announcing $8.5M in Canary Foundation gifts to accelerate early-detection studies across partner institutions.',
    kind: 'press-release',
    section: 'cancer-early-detection',
    tags: ['press-release', 'funding', 'early-detection'],
    relatedSlugs: ['canary-foundation', 'stanford'],
  },
  {
    id: 'su2c-dream-team-awards-2009-05-26',
    title: 'Stand Up To Cancer Awards $73.6 Million for Novel, Groundbreaking Cancer Research',
    publisher: 'Stand Up To Cancer Newsroom',
    publishedIso: '2009-05-26',
    url: 'https://news.standuptocancer.org/press/stand-up-to-cancer-awards-73-6-million-for-novel-groundbreaking-cancer-research/',
    summary:
      'Stand Up To Cancer newsroom release announcing $73.6M in Dream Team awards supporting multi-institution cancer research.',
    kind: 'press-release',
    section: 'cancer-early-detection',
    tags: ['press-release', 'dream-team', 'research'],
    relatedSlugs: ['canary-foundation'],
  },
  {
    id: 'cisco-departure-2000-08-08',
    title: 'Cisco Systems, Inc. Announces Departure of Don Listwin',
    publisher: 'Cisco Newsroom',
    publishedIso: '2000-08-08',
    url: 'https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2000/m08/cisco-systems-inc-announces-departure-of-don-listwin.html',
    summary:
      'Cisco newsroom announcement marking Don Listwin’s departure and the leadership transition that preceded his Openwave CEO chapter.',
    kind: 'press-release',
    section: 'technology-leadership',
    tags: ['cisco', 'leadership', 'press-release'],
    relatedSlugs: ['openwave'],
  },
  {
    id: 'lightreading-listwin-leaves-cisco-2000-08-09',
    title: 'Listwin Leaves Cisco',
    publisher: 'Light Reading',
    publishedIso: '2000-08-09',
    url: 'https://www.lightreading.com/cable-technology/listwin-leaves-cisco',
    summary:
      'Light Reading coverage of Don Listwin leaving Cisco, capturing the industry framing around the leadership shuffle.',
    kind: 'article',
    section: 'technology-leadership',
    tags: ['cisco', 'leadership', 'telecom'],
    relatedSlugs: ['openwave'],
  },
  {
    id: 'lightreading-nuti-moves-to-symbol-2002-07-17',
    title: "Cisco's Nuti Moves to Symbol",
    publisher: 'Light Reading',
    publishedIso: '2002-07-17',
    url: 'https://www.lightreading.com/cable-technology/cisco-s-nuti-moves-to-symbol',
    summary:
      'Light Reading story on Cisco executive moves, with context that references Don Listwin’s earlier transition.',
    kind: 'article',
    section: 'technology-leadership',
    tags: ['cisco', 'leadership', 'industry'],
  },
  {
    id: 'wsj-ex-executive-big-push-cancer',
    title: 'Ex-Executive Backs Big Push to Get a Jump on Cancer',
    publisher: 'The Wall Street Journal',
    // WSJ article id contains a UNIX timestamp: 1152668841 → 2006-07-12 (UTC).
    publishedIso: '2006-07-12',
    url: 'https://www.wsj.com/articles/SB115266884127904206',
    summary:
      'Wall Street Journal coverage (paywalled) on Don Listwin backing a major push focused on earlier cancer detection.',
    kind: 'article',
    section: 'cancer-early-detection',
    tags: ['wsj', 'paywalled', 'early-detection', 'coverage'],
    relatedSlugs: ['canary-foundation'],
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
